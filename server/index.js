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
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? '*'   // Nginx handles CORS in production
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: allowedOrigins }));
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
initSocket(io);
module.exports.io = io;

// Attach io to every request
app.use((req, res, next) => { req.io = io; next(); });

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/ngos',        require('./routes/ngos'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/reports',     require('./routes/reports'));
app.use('/api/analytics',   require('./routes/analytics'));
app.use('/api/dashboard',   require('./routes/dashboard'));

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ DoSJE Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
