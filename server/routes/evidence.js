const express = require('express');
const router = express.Router();
const { db } = require('../db/schema');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { computeTrustScore, generateVerificationCode, generateFileHash } = require('../services/trustEngine');

// GET / — List evidence (filter by project_id, worker_id, trust_status)
router.get('/', authenticate, (req, res) => {
  const { project_id, trust_status, worker_id } = req.query;
  let query = `SELECT e.*, b.name as beneficiary_name, p.name as project_name, u.name as worker_name
    FROM evidence e
    LEFT JOIN beneficiaries b ON e.beneficiary_id = b.id
    LEFT JOIN projects p ON e.project_id = p.id
    LEFT JOIN users u ON e.worker_id = u.id
    WHERE 1=1`;
  const params = [];

  if (req.user.role === 'ngo' || req.user.role === 'field_worker') {
    query += ' AND p.ngo_id = ?'; params.push(req.user.ngo_id);
  }
  if (project_id) { query += ' AND e.project_id = ?'; params.push(project_id); }
  if (trust_status) { query += ' AND e.trust_status = ?'; params.push(trust_status); }
  if (worker_id) { query += ' AND e.worker_id = ?'; params.push(worker_id); }

  query += ' ORDER BY e.created_at DESC LIMIT 100';
  const evidence = db.prepare(query).all(...params);
  res.json(evidence);
});

// GET /stats — Evidence dashboard statistics
router.get('/stats', authenticate, (req, res) => {
  let whereClause = '';
  const params = [];

  if (req.user.role === 'ngo' || req.user.role === 'field_worker') {
    whereClause = 'WHERE p.ngo_id = ?';
    params.push(req.user.ngo_id);
  }

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_evidence,
      SUM(CASE WHEN e.trust_status = 'verified' THEN 1 ELSE 0 END) as auto_approved,
      SUM(CASE WHEN e.trust_status = 'review' THEN 1 ELSE 0 END) as needs_review,
      SUM(CASE WHEN e.trust_status = 'suspicious' THEN 1 ELSE 0 END) as suspicious,
      ROUND(AVG(e.trust_score), 1) as avg_trust_score,
      SUM(CASE WHEN e.beneficiary_confirmed = 1 THEN 1 ELSE 0 END) as confirmed_count
    FROM evidence e
    LEFT JOIN projects p ON e.project_id = p.id
    ${whereClause}
  `).get(...params);

  res.json(stats);
});

// GET /challenge — Generate a new verification challenge code
router.get('/challenge', authenticate, (req, res) => {
  const code = generateVerificationCode();
  res.json({ code, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
});

// POST / — Submit new evidence
router.post('/', authenticate, (req, res) => {
  const {
    project_id, beneficiary_id, type, file_url,
    gps_lat, gps_lng, gps_accuracy,
    device_id, verification_code, notes, captured_at
  } = req.body;

  const id = `EV-${uuidv4().substring(0, 8).toUpperCase()}`;
  const file_hash = generateFileHash(id + Date.now());

  // Get beneficiary location for trust score
  const beneficiary = db.prepare('SELECT * FROM beneficiaries WHERE id = ?').get(beneficiary_id);

  // Compute trust score
  const evidenceData = {
    gps_lat, gps_lng, gps_accuracy,
    device_id, verification_code, file_hash,
    captured_at: captured_at || new Date().toISOString(),
    beneficiary_confirmed: 0
  };

  const trustResult = computeTrustScore(evidenceData, beneficiary);

  db.prepare(`INSERT INTO evidence (id, project_id, beneficiary_id, worker_id, type, file_url, file_hash, gps_lat, gps_lng, gps_accuracy, device_id, verification_code, distance_from_target, trust_score, trust_status, ai_checks, beneficiary_confirmed, notes, captured_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`).run(
    id, project_id, beneficiary_id, req.user.id,
    type || 'photo',
    file_url || `https://dosje-evidence.s3.amazonaws.com/${id}.jpg`,
    file_hash, gps_lat, gps_lng, gps_accuracy || 10,
    device_id || 'unknown',
    verification_code,
    trustResult.distance_from_target,
    trustResult.trust_score,
    trustResult.trust_status,
    JSON.stringify(trustResult.ai_checks),
    notes, captured_at || new Date().toISOString(),
    new Date().toISOString()
  );

  // Update beneficiary verification count
  if (beneficiary) {
    db.prepare('UPDATE beneficiaries SET verification_count = verification_count + 1, last_verified_at = ? WHERE id = ?').run(
      new Date().toISOString(), beneficiary_id
    );
  }

  // Emit socket event
  if (req.io) {
    req.io.to('dashboard').emit('new_evidence', { id, trust_score: trustResult.trust_score, trust_status: trustResult.trust_status });
  }

  res.status(201).json({
    id,
    ...trustResult,
    file_hash,
    message: 'Evidence submitted and scored'
  });
});

// PUT /:id/confirm — Beneficiary OTP confirmation
router.put('/:id/confirm', authenticate, (req, res) => {
  const evidence = db.prepare('SELECT * FROM evidence WHERE id = ?').get(req.params.id);
  if (!evidence) return res.status(404).json({ error: 'Evidence not found' });

  // Re-compute trust score with confirmation
  const beneficiary = db.prepare('SELECT * FROM beneficiaries WHERE id = ?').get(evidence.beneficiary_id);
  const updatedEvidence = { ...evidence, beneficiary_confirmed: 1 };
  const trustResult = computeTrustScore(updatedEvidence, beneficiary);

  db.prepare('UPDATE evidence SET beneficiary_confirmed = 1, trust_score = ?, trust_status = ?, ai_checks = ? WHERE id = ?').run(
    trustResult.trust_score, trustResult.trust_status, JSON.stringify(trustResult.ai_checks), req.params.id
  );

  res.json({ success: true, new_trust_score: trustResult.trust_score, new_status: trustResult.trust_status });
});

module.exports = router;
