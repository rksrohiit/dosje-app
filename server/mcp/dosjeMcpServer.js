/**
 * DoSJE Model Context Protocol (MCP) Server
 * Exposes DoSJE digital trust infrastructure tools, resources, and prompts
 * to AI models, agentic assistants, and MCP clients (Cursor, Claude Desktop, Antigravity, etc.).
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');
const { db } = require('../db/schema');
const { computeTrustScore, generateVerificationCode, generateFileHash } = require('../services/trustEngine');
const { assignInspection } = require('../services/aiAssignment');

function createDosjeMcpServer() {
  const server = new Server(
    {
      name: 'dosje-monitoring-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // ─── 1. LIST TOOLS ────────────────────────────────────────────────────────
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'dosje_list_projects',
          description: 'List all affirmative action and social welfare projects under DoSJE schemes (SMILE, DAP, SHG), with beneficiary targets, budgets, and compliance status.',
          inputSchema: {
            type: 'object',
            properties: {
              status: { type: 'string', description: 'Filter by status: "active", "completed", "all"' },
              scheme_id: { type: 'string', description: 'Filter by scheme: "s1" (SMILE), "s2" (DAP), "s3" (SHG)' }
            }
          }
        },
        {
          name: 'dosje_create_project',
          description: 'Register a new DoSJE social welfare project linked to an approved government scheme.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Name of the project (e.g. "Rural Education Support 2026")' },
              scheme_id: { type: 'string', enum: ['s1', 's2', 's3'], description: 'Scheme ID (s1=SMILE, s2=DAP, s3=SHG)' },
              location: { type: 'string', description: 'Village / locality address' },
              state: { type: 'string', description: 'Indian State' },
              district: { type: 'string', description: 'District / Tehsil' },
              beneficiary_target: { type: 'number', description: 'Target beneficiary count' },
              budget: { type: 'number', description: 'Approved budget in INR' },
              description: { type: 'string', description: 'Project scope and deliverables' }
            },
            required: ['name', 'location', 'state', 'district', 'beneficiary_target', 'budget']
          }
        },
        {
          name: 'dosje_list_beneficiaries',
          description: 'Query enrolled beneficiaries with DPDP-compliant privacy (masked Aadhaar).',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { type: 'string', description: 'Filter by associated Project ID' },
              status: { type: 'string', enum: ['verified', 'pending', 'rejected', 'all'], description: 'Verification status' },
              search: { type: 'string', description: 'Search term for name or village' }
            }
          }
        },
        {
          name: 'dosje_get_beneficiary_status',
          description: 'Retrieve real-world 5-stage progress (PM-AJAY style) and entitlement history for a beneficiary.',
          inputSchema: {
            type: 'object',
            properties: {
              beneficiary_id: { type: 'string', description: 'Beneficiary ID (e.g. "BEN-1001")' }
            },
            required: ['beneficiary_id']
          }
        },
        {
          name: 'dosje_query_field_evidence',
          description: 'Inspect cryptographic field audit evidence, GPS coordinates, anti-replay challenge codes, and SHA-256 digital fingerprints.',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: { type: 'string', description: 'Filter by Project ID' },
              trust_status: { type: 'string', enum: ['verified', 'review', 'suspicious', 'all'], description: 'Filter by trust tier' }
            }
          }
        },
        {
          name: 'dosje_calculate_trust_score',
          description: 'Execute the 6-signal Digital Trust Score Engine on field audit data (GPS proximity, timestamp, hardware attestation, duplicate hash, dynamic code, and beneficiary confirmation).',
          inputSchema: {
            type: 'object',
            properties: {
              beneficiary_id: { type: 'string', description: 'Target beneficiary ID to compare GPS location with' },
              gps_lat: { type: 'number', description: 'Captured GPS latitude' },
              gps_lng: { type: 'number', description: 'Captured GPS longitude' },
              verification_code: { type: 'string', description: 'Dynamic anti-replay challenge code visible in photo' },
              beneficiary_confirmed: { type: 'number', enum: [0, 1], description: '1 if beneficiary confirmed delivery via SMS/OTP' }
            },
            required: ['beneficiary_id', 'gps_lat', 'gps_lng']
          }
        },
        {
          name: 'dosje_get_compliance_stats',
          description: 'Get central ministry oversight statistics: compliance scores, attendance anomalies, live alerts, and CCTV inspection counts.',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'dosje_trigger_ai_inspection',
          description: 'Run the AI risk algorithm to automatically score NGOs and assign an unannounced physical inspection to an available PMU officer.',
          inputSchema: {
            type: 'object',
            properties: {
              ngo_id: { type: 'string', description: 'Optional: Target specific NGO ID for priority inspection' }
            }
          }
        }
      ]
    };
  });

  // ─── 2. CALL TOOL ─────────────────────────────────────────────────────────
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'dosje_list_projects') {
        let query = 'SELECT p.*, s.name as scheme_name FROM projects p LEFT JOIN schemes s ON p.scheme_id = s.id WHERE 1=1';
        const params = [];
        if (args?.status && args.status !== 'all') {
          query += ' AND p.status = ?';
          params.push(args.status);
        }
        if (args?.scheme_id) {
          query += ' AND p.scheme_id = ?';
          params.push(args.scheme_id);
        }
        query += ' ORDER BY p.created_at DESC';
        const projects = db.prepare(query).all(...params);
        return {
          content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }]
        };
      }

      if (name === 'dosje_create_project') {
        const year = new Date().getFullYear();
        const count = db.prepare('SELECT COUNT(*) as c FROM projects').get().c;
        const id = `DOSJE-PROJECT-${year}-${String(count + 1).padStart(3, '0')}`;
        const ngo_id = 'ngo1';

        db.prepare(`
          INSERT INTO projects (id, ngo_id, name, description, location, state, district, lat, lng, beneficiary_target, budget, start_date, end_date, status, scheme_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
        `).run(
          id, ngo_id, args.name, args.description || '', args.location, args.state, args.district,
          28.59, 77.04, args.beneficiary_target, args.budget,
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          args.scheme_id || 's1',
          new Date().toISOString()
        );

        return {
          content: [
            {
              type: 'text',
              text: `Project registered successfully with ID: ${id}\nScheme: ${args.scheme_id || 's1'}\nBudget: ₹${args.budget?.toLocaleString('en-IN')}\nTarget: ${args.beneficiary_target} beneficiaries`
            }
          ]
        };
      }

      if (name === 'dosje_list_beneficiaries') {
        let query = 'SELECT id, name, guardian_name, village, district, state, phone, aadhaar_last4, project_id, status, services_received, verification_count FROM beneficiaries WHERE 1=1';
        const params = [];
        if (args?.project_id) {
          query += ' AND project_id = ?';
          params.push(args.project_id);
        }
        if (args?.status && args.status !== 'all') {
          query += ' AND status = ?';
          params.push(args.status);
        }
        query += ' ORDER BY created_at DESC LIMIT 50';
        const beneficiaries = db.prepare(query).all(...params);
        return {
          content: [{ type: 'text', text: JSON.stringify(beneficiaries, null, 2) }]
        };
      }

      if (name === 'dosje_get_beneficiary_status') {
        const ben = db.prepare('SELECT b.*, p.name as project_name FROM beneficiaries b LEFT JOIN projects p ON b.project_id = p.id WHERE b.id = ?').get(args.beneficiary_id);
        if (!ben) {
          return { content: [{ type: 'text', text: `Beneficiary not found: ${args.beneficiary_id}` }] };
        }
        const evidence = db.prepare('SELECT * FROM evidence WHERE beneficiary_id = ? ORDER BY captured_at DESC').all(args.beneficiary_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ ...ben, field_evidence_history: evidence }, null, 2)
            }
          ]
        };
      }

      if (name === 'dosje_query_field_evidence') {
        let query = 'SELECT e.*, b.name as beneficiary_name, p.name as project_name FROM evidence e LEFT JOIN beneficiaries b ON e.beneficiary_id = b.id LEFT JOIN projects p ON e.project_id = p.id WHERE 1=1';
        const params = [];
        if (args?.project_id) {
          query += ' AND e.project_id = ?';
          params.push(args.project_id);
        }
        if (args?.trust_status && args.trust_status !== 'all') {
          query += ' AND e.trust_status = ?';
          params.push(args.trust_status);
        }
        query += ' ORDER BY e.created_at DESC LIMIT 25';
        const evidence = db.prepare(query).all(...params);
        return {
          content: [{ type: 'text', text: JSON.stringify(evidence, null, 2) }]
        };
      }

      if (name === 'dosje_calculate_trust_score') {
        const beneficiary = db.prepare('SELECT * FROM beneficiaries WHERE id = ?').get(args.beneficiary_id);
        const evidenceData = {
          gps_lat: args.gps_lat,
          gps_lng: args.gps_lng,
          gps_accuracy: 5.0,
          device_id: 'MCP-EVAL-DEVICE',
          verification_code: args.verification_code || 'X7P92',
          file_hash: generateFileHash(args.beneficiary_id + Date.now()),
          captured_at: new Date().toISOString(),
          beneficiary_confirmed: args.beneficiary_confirmed || 0
        };

        const result = computeTrustScore(evidenceData, beneficiary);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      if (name === 'dosje_get_compliance_stats') {
        const stats = db.prepare(`
          SELECT
            (SELECT COUNT(*) FROM ngos) as total_ngos,
            (SELECT COUNT(*) FROM projects) as total_projects,
            (SELECT COUNT(*) FROM beneficiaries) as total_beneficiaries,
            (SELECT COUNT(*) FROM evidence) as total_evidence,
            (SELECT ROUND(AVG(trust_score), 1) FROM evidence) as avg_trust_score,
            (SELECT COUNT(*) FROM alerts WHERE is_read = 0) as unread_alerts,
            (SELECT ROUND(AVG(compliance_score), 1) FROM ngos) as avg_compliance_score
        `).get();
        return {
          content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }]
        };
      }

      if (name === 'dosje_trigger_ai_inspection') {
        const result = await assignInspection({ ngo_id: args?.ngo_id });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Error executing ${name}: ${err.message}` }]
      };
    }
  });

  // ─── 3. RESOURCES ─────────────────────────────────────────────────────────
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'dosje://schemes',
          name: 'Central Welfare Schemes',
          description: 'Official affirmative action schemes managed by DoSJE (SMILE, DAP, SHG)',
          mimeType: 'application/json'
        },
        {
          uri: 'dosje://stats',
          name: 'National Monitoring Overview',
          description: 'Live counts of NGOs, beneficiaries, and compliance score average',
          mimeType: 'application/json'
        }
      ]
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    if (uri === 'dosje://schemes') {
      const schemes = db.prepare('SELECT * FROM schemes').all();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(schemes, null, 2)
          }
        ]
      };
    }
    if (uri === 'dosje://stats') {
      const stats = db.prepare(`
        SELECT
          (SELECT COUNT(*) FROM ngos) as total_ngos,
          (SELECT COUNT(*) FROM projects) as total_projects,
          (SELECT COUNT(*) FROM beneficiaries) as total_beneficiaries,
          (SELECT COUNT(*) FROM evidence WHERE trust_status = 'verified') as auto_approved_evidence
      `).get();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(stats, null, 2)
          }
        ]
      };
    }
    throw new Error(`Resource not found: ${uri}`);
  });

  // ─── 4. PROMPTS ───────────────────────────────────────────────────────────
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: 'audit_field_fraud',
          description: 'Template for auditing potential location spoofing, recycled photos, or grant leakage for an NGO project.',
          arguments: [
            { name: 'project_id', description: 'The project ID to investigate', required: true }
          ]
        },
        {
          name: 'generate_beneficiary_progress_summary',
          description: 'Generate an executive summary of beneficiary verification stages for PM-AJAY review.',
          arguments: [
            { name: 'beneficiary_id', description: 'Beneficiary ID', required: true }
          ]
        }
      ]
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === 'audit_field_fraud') {
      return {
        description: 'Audit report template for suspicious field verifications',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please audit the field verification evidence for project ${args.project_id}. Query the evidence using dosje_query_field_evidence, examine any records marked as "suspicious" or "review", check GPS proximity anomalies (>100m distance), inspect perceptual duplicate hashes, and recommend whether central grant disbursements should be put on hold.`
            }
          }
        ]
      };
    }
    if (name === 'generate_beneficiary_progress_summary') {
      return {
        description: 'Beneficiary entitlement summary prompt',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Retrieve the verification status and entitlement ledger for beneficiary ${args.beneficiary_id} using dosje_get_beneficiary_status. Summarize their current stage (1 through 5), services physically verified, and field worker audit details.`
            }
          }
        ]
      };
    }
    throw new Error(`Prompt not found: ${name}`);
  });

  return server;
}

module.exports = { createDosjeMcpServer };
