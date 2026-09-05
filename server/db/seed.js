const { db, initDB } = require('./schema');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { generateFileHash } = require('../services/trustEngine');

module.exports = { seed };

function seed() {
  initDB();

  db.exec(`
    DELETE FROM evidence;
    DELETE FROM beneficiaries;
    DELETE FROM projects;
    DELETE FROM reports;
    DELETE FROM inspections;
    DELETE FROM attendance;
    DELETE FROM alerts;
    DELETE FROM vc_calls;
    DELETE FROM users;
    DELETE FROM ngos;
    DELETE FROM schemes;
  `);

  // ─── Schemes ──────────────────────────────────────────────────────────────
  const insertScheme = db.prepare('INSERT INTO schemes (id, name, description, budget, beneficiary_count) VALUES (?, ?, ?, ?, ?)');
  insertScheme.run('s1', 'SMILE', 'Support for Marginalized Individuals for Livelihood and Enterprise', 10000000, 5000);
  insertScheme.run('s2', 'DAP', 'Disability Affairs Program', 15000000, 7500);
  insertScheme.run('s3', 'SHG', 'Self Help Groups for Women', 20000000, 10000);

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminPass = bcrypt.hashSync('Admin@123', 10);
  const pmuPass = bcrypt.hashSync('Pmu@123', 10);
  const ngoPass = bcrypt.hashSync('Ngo@123', 10);
  const benPass = bcrypt.hashSync('Ben@123', 10);
  const workerPass = bcrypt.hashSync('Worker@123', 10);

  const insertUser = db.prepare('INSERT INTO users (id, name, email, password, role, ngo_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertUser.run('u1', 'Rajesh Kumar', 'admin@dosje.gov.in', adminPass, 'admin', null, new Date().toISOString());
  insertUser.run('u2', 'Priya Sharma', 'inspector@pmu.gov.in', pmuPass, 'pmu', null, new Date().toISOString());
  insertUser.run('u3', 'Suresh Patel', 'manager@ngo1.org', ngoPass, 'ngo', 'ngo1', new Date().toISOString());
  insertUser.run('u4', 'Anita Devi', 'beneficiary@test.com', benPass, 'beneficiary', 'ngo1', new Date().toISOString());
  insertUser.run('u5', 'Ramesh Yadav', 'worker@ngo1.org', workerPass, 'field_worker', 'ngo1', new Date().toISOString());

  // ─── NGOs ─────────────────────────────────────────────────────────────────
  const cities = [
    { name: 'Delhi NGO', lat: 28.6139, lng: 77.2090, state: 'Delhi' },
    { name: 'Mumbai Support', lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
    { name: 'Chennai Aid', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
    { name: 'Kolkata Care', lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
    { name: 'Hyderabad Hope', lat: 17.3850, lng: 78.4867, state: 'Telangana' },
    { name: 'Pune Relief', lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
    { name: 'Jaipur Trust', lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
    { name: 'Lucknow Vision', lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
    { name: 'Bhopal Outreach', lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },
    { name: 'Ahmedabad Society', lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  ];

  const insertNgo = db.prepare('INSERT INTO ngos (id, name, scheme, state, district, address, lat, lng, status, compliance_score, cameras_online, total_cameras, contact_person, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

  cities.forEach((city, i) => {
    insertNgo.run(`ngo${i + 1}`, city.name, i % 3 === 0 ? 'SMILE' : (i % 3 === 1 ? 'DAP' : 'SHG'), city.state, 'District 1', 'Main St', city.lat, city.lng, 'active', 70 + Math.floor(Math.random() * 30), 2, 4, 'Contact ' + i, '9876543210', new Date().toISOString());
  });

  // ─── Attendance ───────────────────────────────────────────────────────────
  const insertAttendance = db.prepare('INSERT INTO attendance (id, ngo_id, date, reported_count, verified_count, anomaly_score, submitted_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

  const today = new Date();
  cities.forEach((_, i) => {
    for (let d = 0; d < 30; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const reported = 50 + Math.floor(Math.random() * 20);
      const verified = reported - Math.floor(Math.random() * (d % 7 === 0 ? 10 : 3));
      const anomaly = (reported > verified * 1.2) ? 0.8 : 0.1;
      insertAttendance.run(uuidv4(), `ngo${i + 1}`, date.toISOString().split('T')[0], reported, verified, anomaly, 'u3', new Date().toISOString());
    }
  });

  // ─── Inspections & Reports ────────────────────────────────────────────────
  const insertInspection = db.prepare('INSERT INTO inspections (id, ngo_id, inspector_id, status, priority, assigned_at, scheduled_date, completed_at, checklist, notes, lat, lng, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertReport = db.prepare('INSERT INTO reports (id, inspection_id, ngo_id, inspector_id, title, findings, rating, recommendation, created_at, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

  for (let i = 1; i <= 8; i++) {
    const status = i <= 5 ? 'completed' : (i === 6 ? 'in_progress' : 'pending');
    const id = `insp${i}`;
    insertInspection.run(id, `ngo${i}`, 'u2', status, 'high', new Date().toISOString(), new Date().toISOString(), status === 'completed' ? new Date().toISOString() : null, JSON.stringify([]), 'Notes here', 0, 0, '[]');

    if (status === 'completed') {
      insertReport.run(`rep${i}`, id, `ngo${i}`, 'u2', `Report ${i}`, 'All good', 4, 'Continue support', new Date().toISOString(), '[]');
    }
  }

  // ─── Alerts ───────────────────────────────────────────────────────────────
  const insertAlert = db.prepare('INSERT INTO alerts (id, type, ngo_id, message, severity, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (let i = 1; i <= 10; i++) {
    insertAlert.run(`alert${i}`, i % 2 === 0 ? 'attendance' : 'compliance', `ngo${i}`, `Alert message ${i}`, i % 3 === 0 ? 'high' : 'medium', 0, new Date().toISOString());
  }

  // ─── Projects (NEW) ──────────────────────────────────────────────────────
  const insertProject = db.prepare('INSERT INTO projects (id, ngo_id, name, description, location, state, district, lat, lng, beneficiary_target, budget, start_date, end_date, status, scheme_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

  insertProject.run('proj-001', 'ngo1', 'Rural Education Support 2026', 'Providing educational support to underprivileged children including books, uniforms, and mid-day meals in Delhi NCR.', 'Dwarka, New Delhi', 'Delhi', 'South West Delhi', 28.5921, 77.0460, 150, 500000, '2026-09-01', '2026-12-31', 'active', 's1', new Date().toISOString());

  insertProject.run('proj-002', 'ngo1', 'Skill Development Program', 'Vocational training for women in tailoring, computer literacy, and handicrafts. Partnered with local polytechnics.', 'Rohini, New Delhi', 'Delhi', 'North West Delhi', 28.7495, 77.0565, 75, 300000, '2026-08-15', '2027-02-28', 'active', 's3', new Date().toISOString());

  insertProject.run('proj-003', 'ngo2', 'Urban Shelter Initiative', 'Night shelter operations and rehabilitation for homeless persons in Mumbai suburban areas.', 'Andheri, Mumbai', 'Maharashtra', 'Mumbai Suburban', 19.1197, 72.8464, 200, 800000, '2026-07-01', '2027-06-30', 'active', 's1', new Date().toISOString());

  // ─── Beneficiaries (NEW) ─────────────────────────────────────────────────
  const insertBeneficiary = db.prepare('INSERT INTO beneficiaries (id, name, guardian_name, village, district, state, phone, aadhaar_last4, project_id, ngo_id, lat, lng, status, services_received, verification_count, last_verified_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

  const beneficiaries = [
    { id: 'ben-1001', name: 'Anita Devi', guardian: 'Ram Prasad', village: 'Dwarka Sector 12', district: 'South West Delhi', state: 'Delhi', phone: '9876543201', aadhaar: '4523', project: 'proj-001', lat: 28.5935, lng: 77.0480, status: 'verified', services: ['Books', 'Uniform', 'Mid-Day Meal'], verifications: 3, lastVerified: '2026-08-28T10:30:00Z' },
    { id: 'ben-1002', name: 'Ravi Kumar', guardian: 'Shanti Devi', village: 'Dwarka Sector 7', district: 'South West Delhi', state: 'Delhi', phone: '9876543202', aadhaar: '7891', project: 'proj-001', lat: 28.5890, lng: 77.0510, status: 'verified', services: ['Books', 'Mid-Day Meal'], verifications: 2, lastVerified: '2026-08-25T14:15:00Z' },
    { id: 'ben-1003', name: 'Sunita Sharma', guardian: 'Mohan Sharma', village: 'Dwarka Sector 19', district: 'South West Delhi', state: 'Delhi', phone: '9876543203', aadhaar: '3456', project: 'proj-001', lat: 28.5950, lng: 77.0420, status: 'pending', services: [], verifications: 0, lastVerified: null },
    { id: 'ben-1004', name: 'Priya Singh', guardian: 'Arun Singh', village: 'Palam Colony', district: 'South West Delhi', state: 'Delhi', phone: '9876543204', aadhaar: '6789', project: 'proj-001', lat: 28.5810, lng: 77.0890, status: 'verified', services: ['Books', 'Uniform'], verifications: 1, lastVerified: '2026-08-20T09:00:00Z' },
    { id: 'ben-1005', name: 'Meera Gupta', guardian: 'Raj Gupta', village: 'Rohini Sector 3', district: 'North West Delhi', state: 'Delhi', phone: '9876543205', aadhaar: '2345', project: 'proj-002', lat: 28.7510, lng: 77.0580, status: 'verified', services: ['Tailoring Kit', 'Training Certificate'], verifications: 4, lastVerified: '2026-08-27T11:45:00Z' },
    { id: 'ben-1006', name: 'Geeta Rani', guardian: 'Sunil Yadav', village: 'Rohini Sector 16', district: 'North West Delhi', state: 'Delhi', phone: '9876543206', aadhaar: '8901', project: 'proj-002', lat: 28.7480, lng: 77.0540, status: 'pending', services: [], verifications: 0, lastVerified: null },
    { id: 'ben-1007', name: 'Kamla Devi', guardian: 'Bhagwan Das', village: 'Rohini Sector 11', district: 'North West Delhi', state: 'Delhi', phone: '9876543207', aadhaar: '5678', project: 'proj-002', lat: 28.7520, lng: 77.0600, status: 'verified', services: ['Computer Training'], verifications: 2, lastVerified: '2026-08-22T16:30:00Z' },
    { id: 'ben-1008', name: 'Lakshmi Bai', guardian: 'Vijay Kumar', village: 'Dwarka Sector 23', district: 'South West Delhi', state: 'Delhi', phone: '9876543208', aadhaar: '1234', project: 'proj-001', lat: 28.5870, lng: 77.0440, status: 'rejected', services: [], verifications: 1, lastVerified: '2026-08-18T10:00:00Z' },
    { id: 'ben-1009', name: 'Pooja Verma', guardian: 'Sanjay Verma', village: 'Andheri East', district: 'Mumbai Suburban', state: 'Maharashtra', phone: '9876543209', aadhaar: '9012', project: 'proj-003', lat: 19.1200, lng: 72.8470, status: 'verified', services: ['Night Shelter', 'Food Kit'], verifications: 5, lastVerified: '2026-08-29T08:00:00Z' },
    { id: 'ben-1010', name: 'Sita Ram', guardian: 'Hari Ram', village: 'Andheri West', district: 'Mumbai Suburban', state: 'Maharashtra', phone: '9876543210', aadhaar: '3457', project: 'proj-003', lat: 19.1185, lng: 72.8450, status: 'pending', services: [], verifications: 0, lastVerified: null },
  ];

  beneficiaries.forEach(b => {
    insertBeneficiary.run(b.id, b.name, b.guardian, b.village, b.district, b.state, b.phone, b.aadhaar, b.project, b.project.startsWith('proj-001') || b.project.startsWith('proj-002') ? 'ngo1' : 'ngo2', b.lat, b.lng, b.status, JSON.stringify(b.services), b.verifications, b.lastVerified, new Date().toISOString());
  });

  // ─── Evidence (NEW) ──────────────────────────────────────────────────────
  const insertEvidence = db.prepare('INSERT INTO evidence (id, project_id, beneficiary_id, worker_id, type, file_url, file_hash, gps_lat, gps_lng, gps_accuracy, device_id, verification_code, distance_from_target, trust_score, trust_status, ai_checks, beneficiary_confirmed, notes, captured_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

  const evidenceItems = [
    { id: 'ev-001', project: 'proj-001', ben: 'ben-1001', score: 95, status: 'verified', code: 'X7P92', dist: 45, confirmed: 1, lat: 28.5937, lng: 77.0482 },
    { id: 'ev-002', project: 'proj-001', ben: 'ben-1002', score: 88, status: 'review', code: 'A8K47', dist: 120, confirmed: 1, lat: 28.5895, lng: 77.0515 },
    { id: 'ev-003', project: 'proj-001', ben: 'ben-1001', score: 92, status: 'verified', code: 'M3R56', dist: 30, confirmed: 1, lat: 28.5933, lng: 77.0478 },
    { id: 'ev-004', project: 'proj-001', ben: 'ben-1004', score: 78, status: 'review', code: 'K9L23', dist: 250, confirmed: 0, lat: 28.5830, lng: 77.0870 },
    { id: 'ev-005', project: 'proj-002', ben: 'ben-1005', score: 96, status: 'verified', code: 'T5W81', dist: 22, confirmed: 1, lat: 28.7512, lng: 77.0582 },
    { id: 'ev-006', project: 'proj-002', ben: 'ben-1007', score: 45, status: 'suspicious', code: null, dist: 850, confirmed: 0, lat: 28.7600, lng: 77.0700 },
    { id: 'ev-007', project: 'proj-001', ben: 'ben-1003', score: 82, status: 'review', code: 'P2N67', dist: 180, confirmed: 0, lat: 28.5960, lng: 77.0430 },
    { id: 'ev-008', project: 'proj-001', ben: 'ben-1002', score: 97, status: 'verified', code: 'R4J19', dist: 15, confirmed: 1, lat: 28.5891, lng: 77.0511 },
    { id: 'ev-009', project: 'proj-002', ben: 'ben-1005', score: 91, status: 'verified', code: 'B6H34', dist: 40, confirmed: 1, lat: 28.7508, lng: 77.0575 },
    { id: 'ev-010', project: 'proj-003', ben: 'ben-1009', score: 55, status: 'suspicious', code: 'G1C88', dist: 620, confirmed: 0, lat: 19.1250, lng: 72.8520 },
    { id: 'ev-011', project: 'proj-001', ben: 'ben-1001', score: 94, status: 'verified', code: 'W8F52', dist: 38, confirmed: 1, lat: 28.5936, lng: 77.0481 },
    { id: 'ev-012', project: 'proj-001', ben: 'ben-1004', score: 89, status: 'review', code: 'N3V76', dist: 95, confirmed: 1, lat: 28.5815, lng: 77.0885 },
  ];

  const aiChecksTemplate = JSON.stringify({
    gps: { score: 18, max: 20, detail: 'Within trusted range' },
    timestamp: { score: 15, max: 15, detail: 'Captured within 5 minutes' },
    device: { score: 15, max: 15, detail: 'Device verified' },
    duplicate: { score: 18, max: 20, detail: 'No duplicates found' },
    activity: { score: 13, max: 15, detail: 'Verification code matched' },
    beneficiary_confirm: { score: 15, max: 15, detail: 'Confirmed via OTP' }
  });

  evidenceItems.forEach(ev => {
    const daysAgo = Math.floor(Math.random() * 14);
    const capturedDate = new Date(today);
    capturedDate.setDate(capturedDate.getDate() - daysAgo);

    insertEvidence.run(
      ev.id, ev.project, ev.ben, 'u5', 'photo',
      `https://dosje-evidence.s3.amazonaws.com/${ev.id}.jpg`,
      generateFileHash(ev.id),
      ev.lat, ev.lng, 5 + Math.random() * 10,
      'device-ngo1-worker-001',
      ev.code, ev.dist, ev.score, ev.status,
      aiChecksTemplate, ev.confirmed,
      'Field verification visit completed',
      capturedDate.toISOString(),
      new Date().toISOString()
    );
  });

  console.log('Database seeded successfully!');
}

if (require.main === module) {
  seed();
  process.exit(0);
}

module.exports = { seed };
