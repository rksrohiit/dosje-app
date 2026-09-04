const express = require('express');
const router = express.Router();
const { db } = require('../db/schema');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET / — List projects (filtered by ngo_id for NGO/field_worker roles)
router.get('/', authenticate, (req, res) => {
  let projects;
  if (req.user.role === 'ngo' || req.user.role === 'field_worker') {
    projects = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM beneficiaries WHERE project_id = p.id) as beneficiary_count,
        (SELECT COUNT(*) FROM evidence WHERE project_id = p.id) as evidence_count,
        (SELECT AVG(trust_score) FROM evidence WHERE project_id = p.id) as avg_trust_score,
        s.name as scheme_name
      FROM projects p
      LEFT JOIN schemes s ON p.scheme_id = s.id
      WHERE p.ngo_id = ?
      ORDER BY p.created_at DESC
    `).all(req.user.ngo_id);
  } else {
    projects = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM beneficiaries WHERE project_id = p.id) as beneficiary_count,
        (SELECT COUNT(*) FROM evidence WHERE project_id = p.id) as evidence_count,
        (SELECT AVG(trust_score) FROM evidence WHERE project_id = p.id) as avg_trust_score,
        s.name as scheme_name,
        n.name as ngo_name
      FROM projects p
      LEFT JOIN schemes s ON p.scheme_id = s.id
      LEFT JOIN ngos n ON p.ngo_id = n.id
      ORDER BY p.created_at DESC
    `).all();
  }
  res.json(projects);
});

// GET /:id — Project details
router.get('/:id', authenticate, (req, res) => {
  const project = db.prepare(`
    SELECT p.*,
      s.name as scheme_name,
      n.name as ngo_name,
      (SELECT COUNT(*) FROM beneficiaries WHERE project_id = p.id) as beneficiary_count,
      (SELECT COUNT(*) FROM evidence WHERE project_id = p.id) as evidence_count,
      (SELECT COUNT(*) FROM evidence WHERE project_id = p.id AND trust_status = 'verified') as verified_count,
      (SELECT COUNT(*) FROM evidence WHERE project_id = p.id AND trust_status = 'review') as review_count,
      (SELECT COUNT(*) FROM evidence WHERE project_id = p.id AND trust_status = 'suspicious') as suspicious_count
    FROM projects p
    LEFT JOIN schemes s ON p.scheme_id = s.id
    LEFT JOIN ngos n ON p.ngo_id = n.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// POST / — Create project
router.post('/', authenticate, (req, res) => {
  const { name, description, location, state, district, lat, lng, beneficiary_target, budget, start_date, end_date, scheme_id } = req.body;
  const ngo_id = req.user.ngo_id || req.body.ngo_id;

  // Generate unique project ID: DOSJE-PROJECT-YYYY-NNN
  const year = new Date().getFullYear();
  const count = db.prepare('SELECT COUNT(*) as c FROM projects').get().c;
  const id = `DOSJE-PROJECT-${year}-${String(count + 1).padStart(3, '0')}`;

  db.prepare(`INSERT INTO projects (id, ngo_id, name, description, location, state, district, lat, lng, beneficiary_target, budget, start_date, end_date, status, scheme_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`).run(
    id, ngo_id, name, description, location, state, district, lat || 0, lng || 0,
    beneficiary_target || 0, budget || 0, start_date, end_date, scheme_id, new Date().toISOString()
  );

  res.status(201).json({ id, message: 'Project created successfully' });
});

// PUT /:id — Update project
router.put('/:id', authenticate, (req, res) => {
  const { name, description, status, budget, beneficiary_target } = req.body;
  db.prepare('UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description), status = COALESCE(?, status), budget = COALESCE(?, budget), beneficiary_target = COALESCE(?, beneficiary_target) WHERE id = ?').run(
    name, description, status, budget, beneficiary_target, req.params.id
  );
  res.json({ success: true });
});

module.exports = router;
