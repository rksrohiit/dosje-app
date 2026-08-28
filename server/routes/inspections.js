const express = require('express');
const router = express.Router();
const { db } = require('../db/schema');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { assignInspection } = require('../services/aiAssignment');

router.get('/', authenticate, (req, res) => {
  if (req.user.role === 'admin') {
    const data = db.prepare('SELECT * FROM inspections').all();
    return res.json(data);
  } else if (req.user.role === 'pmu') {
    const data = db.prepare('SELECT * FROM inspections WHERE inspector_id = ?').all(req.user.id);
    return res.json(data);
  }
  return res.status(403).json({ error: 'Forbidden' });
});

router.get('/:id', authenticate, (req, res) => {
  const data = db.prepare('SELECT * FROM inspections WHERE id = ?').get(req.params.id);
  res.json(data || {});
});

router.post('/assign', authenticate, authorize('admin'), (req, res) => {
  const { ngo_id, inspector_id, priority, scheduled_date } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO inspections (id, ngo_id, inspector_id, priority, scheduled_date, assigned_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, ngo_id, inspector_id, priority, scheduled_date, new Date().toISOString());
  res.json({ id });
});

router.post('/ai-assign', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await assignInspection();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/start', authenticate, authorize('pmu'), (req, res) => {
  const { lat, lng } = req.body;
  db.prepare("UPDATE inspections SET status = 'in_progress', lat = ?, lng = ? WHERE id = ? AND inspector_id = ?")
    .run(lat, lng, req.params.id, req.user.id);
  res.json({ success: true });
});

router.put('/:id/complete', authenticate, authorize('pmu'), (req, res) => {
  const { checklist, notes, rating, findings, lat, lng, photos } = req.body;
  
  db.prepare("UPDATE inspections SET status = 'completed', completed_at = ?, checklist = ?, notes = ?, lat = ?, lng = ?, photos = ? WHERE id = ? AND inspector_id = ?")
    .run(new Date().toISOString(), JSON.stringify(checklist), notes, lat, lng, JSON.stringify(photos), req.params.id, req.user.id);
  
  const inspection = db.prepare("SELECT * FROM inspections WHERE id = ?").get(req.params.id);
  
  const reportId = uuidv4();
  db.prepare('INSERT INTO reports (id, inspection_id, ngo_id, inspector_id, title, findings, rating, recommendation, created_at, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(reportId, inspection.id, inspection.ngo_id, inspection.inspector_id, 'Inspection Report', findings, rating, 'N/A', new Date().toISOString(), JSON.stringify(photos));

  if (req.io) {
    req.io.to('dashboard').emit('inspection_completed', { id: inspection.id, ngo_id: inspection.ngo_id });
  }

  res.json({ success: true, reportId });
});

module.exports = router;
