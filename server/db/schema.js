const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const isVercel = Boolean(process.env.VERCEL);
const dbPath = isVercel
  ? path.join('/tmp', 'database.sqlite')
  : path.join(__dirname, 'database.sqlite');

const db = new Database(dbPath);

function initDB() {
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT CHECK( role IN('admin','pmu','ngo','beneficiary') ),
      ngo_id TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS ngos (
      id TEXT PRIMARY KEY,
      name TEXT,
      scheme TEXT,
      state TEXT,
      district TEXT,
      address TEXT,
      lat REAL,
      lng REAL,
      status TEXT DEFAULT 'active',
      compliance_score INTEGER DEFAULT 85,
      cameras_online INTEGER DEFAULT 2,
      total_cameras INTEGER DEFAULT 4,
      contact_person TEXT,
      phone TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS inspections (
      id TEXT PRIMARY KEY,
      ngo_id TEXT,
      inspector_id TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      assigned_at TEXT,
      scheduled_date TEXT,
      completed_at TEXT,
      checklist TEXT,
      notes TEXT,
      lat REAL,
      lng REAL,
      photos TEXT,
      FOREIGN KEY (ngo_id) REFERENCES ngos(id),
      FOREIGN KEY (inspector_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      inspection_id TEXT,
      ngo_id TEXT,
      inspector_id TEXT,
      title TEXT,
      findings TEXT,
      rating INTEGER,
      recommendation TEXT,
      created_at TEXT,
      photos TEXT,
      FOREIGN KEY (inspection_id) REFERENCES inspections(id),
      FOREIGN KEY (ngo_id) REFERENCES ngos(id),
      FOREIGN KEY (inspector_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      ngo_id TEXT,
      date TEXT,
      reported_count INTEGER,
      verified_count INTEGER,
      anomaly_score REAL DEFAULT 0,
      submitted_by TEXT,
      created_at TEXT,
      FOREIGN KEY (ngo_id) REFERENCES ngos(id),
      FOREIGN KEY (submitted_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      type TEXT,
      ngo_id TEXT,
      message TEXT,
      severity TEXT DEFAULT 'medium',
      is_read INTEGER DEFAULT 0,
      created_at TEXT,
      FOREIGN KEY (ngo_id) REFERENCES ngos(id)
    );

    CREATE TABLE IF NOT EXISTS vc_calls (
      id TEXT PRIMARY KEY,
      initiated_by TEXT,
      target_user_id TEXT,
      target_ngo_id TEXT,
      started_at TEXT,
      ended_at TEXT,
      status TEXT DEFAULT 'initiated',
      notes TEXT,
      FOREIGN KEY (initiated_by) REFERENCES users(id),
      FOREIGN KEY (target_user_id) REFERENCES users(id),
      FOREIGN KEY (target_ngo_id) REFERENCES ngos(id)
    );

    CREATE TABLE IF NOT EXISTS schemes (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      budget REAL,
      beneficiary_count INTEGER
    );
  `);

  // Auto-seed if empty (e.g. cold start in serverless environment)
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount === 0) {
    try {
      const { seed } = require('./seed');
      seed();
    } catch (e) {
      console.log('Auto-seed skipped or failed:', e.message);
    }
  }
}

module.exports = { db, initDB };
