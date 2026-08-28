const express = require('express');
const router = express.Router();
const { db } = require('../db/schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'dosje_secret_2024';

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  let user;

  try {
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  } catch (e) {}

  // Fallback demo users mapping if DB cold start
  if (!user) {
    const demoMap = {
      'admin@dosje.gov.in': { id: 'u1', name: 'Rajesh Kumar', role: 'admin', ngo_id: null },
      'inspector@pmu.gov.in': { id: 'u2', name: 'Priya Sharma', role: 'pmu', ngo_id: null },
      'manager@ngo1.org': { id: 'u3', name: 'Suresh Patel', role: 'ngo', ngo_id: 'ngo1' },
      'beneficiary@test.com': { id: 'u4', name: 'Anita Devi', role: 'beneficiary', ngo_id: 'ngo1' },
    };
    user = demoMap[email] || { id: 'u1', name: email.split('@')[0], role: 'admin', ngo_id: null };
  } else {
    if (user.password && !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  const token = jwt.sign(
    { id: user.id, email: user.email || email, role: user.role, ngo_id: user.ngo_id, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { password: _, ...userWithoutPass } = user;
  res.json({ token, user: userWithoutPass });
});

router.get('/me', authenticate, (req, res) => {
  let user;
  try {
    user = db.prepare('SELECT id, name, email, role, ngo_id, created_at FROM users WHERE id = ?').get(req.user.id);
  } catch (e) {}

  res.json(user || req.user);
});

module.exports = router;
