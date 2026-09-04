const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const { initDB } = require('./db/schema');
const { initSocket } = require('./socket/handlers');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ─── CORS ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check (used by Docker & cloud platforms) ──────────────────────
app.get('/api/dashboard/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  });
});

// ─── DB + Socket Init ─────────────────────────────────────────────────────
initDB();
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? '*'
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});
initSocket(io);

// Attach io to every request
app.use((req, res, next) => { req.io = io; next(); });

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/ngos',          require('./routes/ngos'));
app.use('/api/inspections',   require('./routes/inspections'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/beneficiaries', require('./routes/beneficiaries'));
app.use('/api/evidence',      require('./routes/evidence'));

// ─── Model Context Protocol (MCP) Remote SSE Transport ───────────────────
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const { createDosjeMcpServer } = require('./mcp/dosjeMcpServer');

let activeSseTransports = new Map();

app.get('/sse', async (req, res) => {
  try {
    const transport = new SSEServerTransport('/messages', res);
    const mcpServer = createDosjeMcpServer();
    activeSseTransports.set(transport.sessionId, transport);

    res.on('close', () => {
      activeSseTransports.delete(transport.sessionId);
    });

    await mcpServer.connect(transport);
  } catch (err) {
    console.error('Error establishing MCP SSE connection:', err);
    if (!res.headersSent) res.status(500).send('MCP connection failed');
  }
});

app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = sessionId ? activeSseTransports.get(sessionId) : activeSseTransports.values().next().value;
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).json({ error: 'No active MCP SSE transport session' });
  }
});

// MCP info endpoint for dashboard inspection
app.get('/api/mcp/info', (req, res) => {
  res.json({
    name: 'dosje-monitoring-mcp',
    status: 'online',
    version: '1.0.0',
    protocolVersion: '2024-11-05',
    transports: {
      stdio: 'node server/mcp/index.js',
      sse: `${req.protocol}://${req.get('host')}/sse`
    },
    toolsCount: 8,
    tools: [
      'dosje_list_projects',
      'dosje_create_project',
      'dosje_list_beneficiaries',
      'dosje_get_beneficiary_status',
      'dosje_query_field_evidence',
      'dosje_calculate_trust_score',
      'dosje_get_compliance_stats',
      'dosje_trigger_ai_inspection'
    ]
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ─── Serve React Static Files in Production / Render ─────────────────────
const clientDistPath = path.join(__dirname, '../client/dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ DoSJE Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

module.exports = app;
module.exports.app = app;
module.exports.server = server;
module.exports.io = io;
