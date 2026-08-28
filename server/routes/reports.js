const express = require('express');
const router = express.Router();
const { db } = require('../db/schema');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  const data = db.prepare(`
    SELECT r.*, n.name as ngo_name, u.name as inspector_name 
    FROM reports r 
    JOIN ngos n ON r.ngo_id = n.id 
    JOIN users u ON r.inspector_id = u.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(data);
});

router.get('/ngo/:ngo_id', authenticate, (req, res) => {
  const data = db.prepare('SELECT * FROM reports WHERE ngo_id = ? ORDER BY created_at DESC').all(req.params.ngo_id);
  res.json(data);
});

router.get('/:id', authenticate, (req, res) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  res.json(report || {});
});

module.exports = router;
