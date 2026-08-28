const express = require('express');
const router = express.Router();
const { db } = require('../db/schema');
const { authenticate } = require('../middleware/auth');

router.get('/attendance', authenticate, (req, res) => {
  const data = db.prepare('SELECT date, SUM(reported_count) as total_reported, SUM(verified_count) as total_verified FROM attendance GROUP BY date ORDER BY date DESC LIMIT 30').all();
  res.json(data);
});

router.get('/anomalies', authenticate, (req, res) => {
  const data = db.prepare('SELECT a.*, n.name as ngo_name FROM attendance a JOIN ngos n ON a.ngo_id = n.id WHERE a.anomaly_score > 0.5 ORDER BY a.date DESC').all();
  res.json(data);
});

router.get('/compliance', authenticate, (req, res) => {
  const data = db.prepare('SELECT id, name, compliance_score FROM ngos ORDER BY compliance_score DESC').all();
  res.json(data);
});

router.get('/alerts', authenticate, (req, res) => {
  const { is_read, severity, type } = req.query;
  let query = 'SELECT * FROM alerts WHERE 1=1';
  let params = [];
  
  if (is_read !== undefined) {
    query += ' AND is_read = ?';
    params.push(is_read);
  }
  if (severity) {
    query += ' AND severity = ?';
    params.push(severity);
  }
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  query += ' ORDER BY created_at DESC';
  
  const data = db.prepare(query).all(...params);
  res.json(data);
});

router.put('/alerts/:id/read', authenticate, (req, res) => {
  db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/overview', authenticate, (req, res) => {
  const total_ngos = db.prepare('SELECT COUNT(*) as c FROM ngos').get().c;
  const active_ngos = db.prepare("SELECT COUNT(*) as c FROM ngos WHERE status = 'active'").get().c;
  const pending_inspections = db.prepare("SELECT COUNT(*) as c FROM inspections WHERE status = 'pending'").get().c;
  const completed_inspections = db.prepare("SELECT COUNT(*) as c FROM inspections WHERE status = 'completed'").get().c;
  const total_alerts = db.prepare('SELECT COUNT(*) as c FROM alerts').get().c;
  const unread_alerts = db.prepare('SELECT COUNT(*) as c FROM alerts WHERE is_read = 0').get().c;
  const avg_compliance = db.prepare('SELECT AVG(compliance_score) as avg FROM ngos').get().avg;

  res.json({
    total_ngos, active_ngos, pending_inspections, completed_inspections, total_alerts, unread_alerts, avg_compliance
  });
});

module.exports = router;
