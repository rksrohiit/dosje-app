const express = require('express');
const router = express.Router();
const { db } = require('../db/schema');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET / — List beneficiaries (filter by project_id, ngo_id via query)
router.get('/', authenticate, (req, res) => {
  const { project_id, ngo_id, status } = req.query;
  let query = `SELECT b.*, p.name as project_name FROM beneficiaries b LEFT JOIN projects p ON b.project_id = p.id WHERE 1=1`;
  const params = [];

  if (project_id) { query += ' AND b.project_id = ?'; params.push(project_id); }
  if (req.user.role === 'ngo' || req.user.role === 'field_worker') {
    query += ' AND b.ngo_id = ?'; params.push(req.user.ngo_id);
  } else if (ngo_id) {
    query += ' AND b.ngo_id = ?'; params.push(ngo_id);
  }
  if (status) { query += ' AND b.status = ?'; params.push(status); }

  query += ' ORDER BY b.created_at DESC';
  const beneficiaries = db.prepare(query).all(...params);
  res.json(beneficiaries);
});

// GET /my-status — Beneficiary views own status
router.get('/my-status', authenticate, (req, res) => {
  // Match by user name + ngo_id (in production: match by Aadhaar/phone)
  const beneficiary = db.prepare(`
    SELECT b.*, p.name as project_name, p.status as project_status, p.start_date, p.end_date,
      n.name as ngo_name
    FROM beneficiaries b
    LEFT JOIN projects p ON b.project_id = p.id
    LEFT JOIN ngos n ON b.ngo_id = n.id
    WHERE b.ngo_id = ? AND b.name = ?
    LIMIT 1
  `).get(req.user.ngo_id, req.user.name);

  if (!beneficiary) {
    // Fallback: return first beneficiary for demo
    const fallback = db.prepare(`
      SELECT b.*, p.name as project_name, p.status as project_status, p.start_date, p.end_date,
        n.name as ngo_name
      FROM beneficiaries b
      LEFT JOIN projects p ON b.project_id = p.id
      LEFT JOIN ngos n ON b.ngo_id = n.id
      WHERE b.ngo_id = ?
      ORDER BY b.created_at ASC LIMIT 1
    `).get(req.user.ngo_id || 'ngo1');
    return res.json(fallback || { message: 'No beneficiary record found' });
  }

  // Get evidence/verification history
  const evidenceHistory = db.prepare(`
    SELECT e.*, u.name as worker_name
    FROM evidence e
    LEFT JOIN users u ON e.worker_id = u.id
    WHERE e.beneficiary_id = ?
    ORDER BY e.captured_at DESC
  `).all(beneficiary.id);

  res.json({ ...beneficiary, evidence_history: evidenceHistory });
});

// GET /:id — Single beneficiary details
router.get('/:id', authenticate, (req, res) => {
  const beneficiary = db.prepare(`
    SELECT b.*, p.name as project_name, n.name as ngo_name
    FROM beneficiaries b
    LEFT JOIN projects p ON b.project_id = p.id
    LEFT JOIN ngos n ON b.ngo_id = n.id
    WHERE b.id = ?
  `).get(req.params.id);

  if (!beneficiary) return res.status(404).json({ error: 'Beneficiary not found' });

  const evidence = db.prepare('SELECT * FROM evidence WHERE beneficiary_id = ? ORDER BY captured_at DESC').all(req.params.id);
  res.json({ ...beneficiary, evidence });
});

// POST / — Register beneficiary
router.post('/', authenticate, (req, res) => {
  const { name, guardian_name, village, district, state, phone, aadhaar_last4, project_id, lat, lng } = req.body;
  const ngo_id = req.user.ngo_id || req.body.ngo_id;

  // Generate unique ID: BEN-NNNN
  const count = db.prepare('SELECT COUNT(*) as c FROM beneficiaries').get().c;
  const id = `BEN-${String(count + 1001).padStart(4, '0')}`;

  db.prepare(`INSERT INTO beneficiaries (id, name, guardian_name, village, district, state, phone, aadhaar_last4, project_id, ngo_id, lat, lng, status, services_received, verification_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', '[]', 0, ?)`).run(
    id, name, guardian_name, village, district, state, phone, aadhaar_last4,
    project_id, ngo_id, lat || 0, lng || 0, new Date().toISOString()
  );

  res.status(201).json({ id, message: 'Beneficiary registered successfully' });
});

// PUT /:id/verify — Mark beneficiary as verified
router.put('/:id/verify', authenticate, (req, res) => {
  const { services } = req.body;
  const beneficiary = db.prepare('SELECT * FROM beneficiaries WHERE id = ?').get(req.params.id);
  if (!beneficiary) return res.status(404).json({ error: 'Beneficiary not found' });

  const existingServices = JSON.parse(beneficiary.services_received || '[]');
  const updatedServices = [...new Set([...existingServices, ...(services || [])])];

  db.prepare('UPDATE beneficiaries SET status = ?, services_received = ?, verification_count = verification_count + 1, last_verified_at = ? WHERE id = ?').run(
    'verified', JSON.stringify(updatedServices), new Date().toISOString(), req.params.id
  );

  res.json({ success: true, message: 'Beneficiary verified' });
});

module.exports = router;
