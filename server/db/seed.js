const { db, initDB } = require('./schema');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  initDB();

  db.exec(`
    DELETE FROM reports;
    DELETE FROM inspections;
    DELETE FROM attendance;
    DELETE FROM alerts;
    DELETE FROM vc_calls;
    DELETE FROM users;
    DELETE FROM ngos;
    DELETE FROM schemes;
  `);

  const insertScheme = db.prepare('INSERT INTO schemes (id, name, description, budget, beneficiary_count) VALUES (?, ?, ?, ?, ?)');
  insertScheme.run('s1', 'SMILE', 'Support for Marginalized Individuals for Livelihood and Enterprise', 10000000, 5000);
  insertScheme.run('s2', 'DAP', 'Disability Affairs Program', 15000000, 7500);
  insertScheme.run('s3', 'SHG', 'Self Help Groups for Women', 20000000, 10000);

  const adminPass = bcrypt.hashSync('Admin@123', 10);
  const pmuPass = bcrypt.hashSync('Pmu@123', 10);
  const ngoPass = bcrypt.hashSync('Ngo@123', 10);
  const benPass = bcrypt.hashSync('Ben@123', 10);

  const insertUser = db.prepare('INSERT INTO users (id, name, email, password, role, ngo_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertUser.run('u1', 'Rajesh Kumar', 'admin@dosje.gov.in', adminPass, 'admin', null, new Date().toISOString());
  insertUser.run('u2', 'Priya Sharma', 'inspector@pmu.gov.in', pmuPass, 'pmu', null, new Date().toISOString());
  insertUser.run('u3', 'Suresh Patel', 'manager@ngo1.org', ngoPass, 'ngo', 'ngo1', new Date().toISOString());
  insertUser.run('u4', 'Anita Devi', 'beneficiary@test.com', benPass, 'beneficiary', 'ngo1', new Date().toISOString());

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
    insertNgo.run(`ngo${i+1}`, city.name, i%3===0 ? 'SMILE' : (i%3===1 ? 'DAP' : 'SHG'), city.state, 'District 1', 'Main St', city.lat, city.lng, 'active', 70 + Math.floor(Math.random() * 30), 2, 4, 'Contact ' + i, '9876543210', new Date().toISOString());
  });

  const insertAttendance = db.prepare('INSERT INTO attendance (id, ngo_id, date, reported_count, verified_count, anomaly_score, submitted_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  
  const today = new Date();
  cities.forEach((_, i) => {
    for (let d = 0; d < 30; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const reported = 50 + Math.floor(Math.random() * 20);
      const verified = reported - Math.floor(Math.random() * (d % 7 === 0 ? 10 : 3)); // anomalies on some days
      const anomaly = (reported > verified * 1.2) ? 0.8 : 0.1;
      insertAttendance.run(uuidv4(), `ngo${i+1}`, date.toISOString().split('T')[0], reported, verified, anomaly, 'u3', new Date().toISOString());
    }
  });

  const insertInspection = db.prepare('INSERT INTO inspections (id, ngo_id, inspector_id, status, priority, assigned_at, scheduled_date, completed_at, checklist, notes, lat, lng, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertReport = db.prepare('INSERT INTO reports (id, inspection_id, ngo_id, inspector_id, title, findings, rating, recommendation, created_at, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  for(let i = 1; i <= 8; i++) {
    const status = i <= 5 ? 'completed' : (i === 6 ? 'in_progress' : 'pending');
    const id = `insp${i}`;
    insertInspection.run(id, `ngo${i}`, 'u2', status, 'high', new Date().toISOString(), new Date().toISOString(), status === 'completed' ? new Date().toISOString() : null, JSON.stringify([]), 'Notes here', 0, 0, '[]');
    
    if (status === 'completed') {
      insertReport.run(`rep${i}`, id, `ngo${i}`, 'u2', `Report ${i}`, 'All good', 4, 'Continue support', new Date().toISOString(), '[]');
    }
  }

  const insertAlert = db.prepare('INSERT INTO alerts (id, type, ngo_id, message, severity, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for(let i=1; i<=10; i++) {
    insertAlert.run(`alert${i}`, i%2===0 ? 'attendance' : 'compliance', `ngo${i}`, `Alert message ${i}`, i%3===0 ? 'high' : 'medium', 0, new Date().toISOString());
  }

  console.log('Database seeded successfully!');
}

seed();
