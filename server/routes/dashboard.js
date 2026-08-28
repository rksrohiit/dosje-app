const express = require('express');
const router = express.Router();
const { db } = require('../db/schema');
const { authenticate } = require('../middleware/auth');

router.get('/stats', authenticate, (req, res) => {
  const total_ngos = db.prepare('SELECT COUNT(*) as c FROM ngos').get().c;
  const active_projects = db.prepare("SELECT COUNT(*) as c FROM ngos WHERE status = 'active'").get().c;
  const inspections_today = db.prepare("SELECT COUNT(*) as c FROM inspections WHERE DATE(assigned_at) = DATE('now')").get().c;
  const alerts_count = db.prepare("SELECT COUNT(*) as c FROM alerts WHERE is_read = 0").get().c;
  const compliance_avg = db.prepare("SELECT ROUND(AVG(compliance_score), 1) as c FROM ngos").get().c;
  const live_cameras = db.prepare("SELECT SUM(cameras_online) as c FROM ngos").get().c;

  res.json({ total_ngos, active_projects, inspections_today, alerts_count, compliance_avg, live_cameras });
});

router.get('/map-data', authenticate, (req, res) => {
  const data = db.prepare('SELECT id, name, lat, lng, status, compliance_score, scheme FROM ngos').all();
  res.json(data);
});

router.get('/recent-activity', authenticate, (req, res) => {
  const insp = db.prepare(
    "SELECT id, ('Inspection: ' || status) as desc, assigned_at as created_at, 'inspection' as event_type FROM inspections ORDER BY assigned_at DESC LIMIT 5"
  ).all();

  const alerts = db.prepare(
    "SELECT id, message as desc, created_at, 'alert' as event_type FROM alerts ORDER BY created_at DESC LIMIT 5"
  ).all();

  const att = db.prepare(
    "SELECT id, ('Attendance submitted') as desc, created_at, 'attendance' as event_type FROM attendance ORDER BY created_at DESC LIMIT 5"
  ).all();

  const events = [...insp, ...alerts, ...att];
  events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json(events.slice(0, 10));
});

module.exports = router;
