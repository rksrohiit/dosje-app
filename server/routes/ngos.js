const express = require('express');
const router = express.Router();
const { db } = require('../db/schema');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { sendAnomalyAlertEmail } = require('../services/emailService');

router.get('/', authenticate, (req, res) => {
  const ngos = db.prepare(`
    SELECT n.*, 
      (SELECT COUNT(*) FROM inspections WHERE ngo_id = n.id) as inspection_count,
      (SELECT reported_count FROM attendance WHERE ngo_id = n.id ORDER BY date DESC LIMIT 1) as latest_attendance
    FROM ngos n
  `).all();
  res.json(ngos);
});

router.get('/:id', authenticate, (req, res) => {
  const ngo = db.prepare('SELECT * FROM ngos WHERE id = ?').get(req.params.id);
  if (!ngo) return res.status(404).json({ error: 'NGO not found' });

  const attendance = db.prepare('SELECT * FROM attendance WHERE ngo_id = ? ORDER BY date DESC LIMIT 30').all(req.params.id);
  const inspections = db.prepare('SELECT * FROM inspections WHERE ngo_id = ? ORDER BY assigned_at DESC').all(req.params.id);

  res.json({ ...ngo, attendance, inspections });
});

router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const { name, status, compliance_score } = req.body;
  db.prepare('UPDATE ngos SET name = ?, status = ?, compliance_score = ? WHERE id = ?')
    .run(name, status, compliance_score, req.params.id);
  res.json({ success: true });
});

router.post('/:id/attendance', authenticate, (req, res) => {
  const { date, reported_count, verified_count } = req.body;
  const ngo_id = req.params.id;

  const ngo = db.prepare('SELECT name, state FROM ngos WHERE id = ?').get(ngo_id);
  const ngoName = ngo ? ngo.name : 'Monitored NGO';

  let anomaly_score = 0;
  if (reported_count > verified_count * 1.2) {
    anomaly_score = 0.8;
    const alertId = uuidv4();
    const alertMsg = `High attendance discrepancy detected: ${reported_count} reported vs ${verified_count} verified.`;
    
    db.prepare('INSERT INTO alerts (id, type, ngo_id, message, severity, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      alertId, 'attendance', ngo_id, alertMsg, 'high', new Date().toISOString()
    );

    // Socket real-time broadcast
    if (req.io) {
      req.io.to('dashboard').emit('new_alert', {
        id: alertId,
        type: 'attendance',
        ngo_id,
        ngo_name: ngoName,
        message: alertMsg,
        severity: 'high',
        created_at: new Date().toISOString()
      });
    }

    // Trigger Email Notification
    sendAnomalyAlertEmail({
      ngoName,
      type: 'Attendance Discrepancy (Ghost Beneficiaries)',
      message: alertMsg,
      severity: 'HIGH',
      location: ngo?.state || 'India',
      date: new Date().toLocaleString()
    });
  }

  const id = uuidv4();
  db.prepare('INSERT INTO attendance (id, ngo_id, date, reported_count, verified_count, anomaly_score, submitted_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, ngo_id, date, reported_count, verified_count, anomaly_score, req.user.id, new Date().toISOString());

  res.json({ id, anomaly_score });
});

router.get('/:id/cameras', authenticate, (req, res) => {
  const ngo_id = req.params.id;
  const cameras = Array.from({ length: 4 }, (_, i) => ({
    id: `cam_${i + 1}`,
    name: `Camera ${i + 1}`,
    location: ['Main Gate', 'Hall A', 'Dormitory', 'Office'][i],
    status: i < 2 ? 'online' : 'offline',
    stream_url: 'simulated'
  }));
  res.json(cameras);
});

module.exports = router;
