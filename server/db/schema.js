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
      role TEXT CHECK( role IN('admin','pmu','ngo','beneficiary','field_worker') ),
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

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      ngo_id TEXT,
      name TEXT,
      description TEXT,
      location TEXT,
      state TEXT,
      district TEXT,
      lat REAL,
      lng REAL,
      beneficiary_target INTEGER DEFAULT 0,
      budget REAL DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'active',
      scheme_id TEXT,
      created_at TEXT,
      FOREIGN KEY (ngo_id) REFERENCES ngos(id),
      FOREIGN KEY (scheme_id) REFERENCES schemes(id)
    );

    CREATE TABLE IF NOT EXISTS beneficiaries (
      id TEXT PRIMARY KEY,
      name TEXT,
      guardian_name TEXT,
      village TEXT,
      district TEXT,
      state TEXT,
      phone TEXT,
      aadhaar_last4 TEXT,
      project_id TEXT,
      ngo_id TEXT,
      lat REAL,
      lng REAL,
      status TEXT DEFAULT 'pending',
      services_received TEXT,
      verification_count INTEGER DEFAULT 0,
      last_verified_at TEXT,
      created_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (ngo_id) REFERENCES ngos(id)
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      beneficiary_id TEXT,
      worker_id TEXT,
      type TEXT DEFAULT 'photo',
      file_url TEXT,
      file_hash TEXT,
      gps_lat REAL,
      gps_lng REAL,
      gps_accuracy REAL,
      device_id TEXT,
      verification_code TEXT,
      distance_from_target REAL,
      trust_score INTEGER DEFAULT 0,
      trust_status TEXT DEFAULT 'pending',
      ai_checks TEXT,
      beneficiary_confirmed INTEGER DEFAULT 0,
      notes TEXT,
      captured_at TEXT,
      created_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id),
      FOREIGN KEY (worker_id) REFERENCES users(id)
    );
  `);
}

module.exports = { db, initDB };
