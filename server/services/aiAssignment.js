const { db } = require('../db/schema');
const { v4: uuidv4 } = require('uuid');

async function assignInspection(options = {}) {
  const ngos = db.prepare("SELECT * FROM ngos WHERE status = 'active'").all();
  
  let bestNgo = null;
  let maxRisk = -1;

  for (const ngo of ngos) {
    if (options.ngo_id && ngo.id !== options.ngo_id) continue;
    
    // Calculate risk
    let risk_score = 0;
    
    const lastInsp = db.prepare("SELECT completed_at FROM inspections WHERE ngo_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 1").get(ngo.id);
    let daysSince = 30;
    if (lastInsp && lastInsp.completed_at) {
      daysSince = (new Date() - new Date(lastInsp.completed_at)) / (1000 * 60 * 60 * 24);
    }
    risk_score += Math.min(40, (daysSince / 30) * 40);

    const att = db.prepare("SELECT AVG(anomaly_score) as avg FROM attendance WHERE ngo_id = ? AND date >= date('now', '-7 days')").get(ngo.id);
    const avgAnomaly = att && att.avg ? att.avg : 0;
    risk_score += Math.min(30, avgAnomaly * 30);

    const alertsCount = db.prepare("SELECT COUNT(*) as c FROM alerts WHERE ngo_id = ? AND is_read = 0").get(ngo.id).c;
    risk_score += Math.min(20, alertsCount * 5);

    risk_score += Math.min(10, ((100 - ngo.compliance_score) / 100) * 10);

    if (risk_score > maxRisk) {
      maxRisk = risk_score;
      bestNgo = ngo;
    }
  }

  if (!bestNgo) throw new Error("No eligible NGOs found");

  const pmus = db.prepare("SELECT id FROM users WHERE role = 'pmu'").all();
  if (pmus.length === 0) throw new Error("No PMU inspectors available");
  
  // pick one with fewest pending
  let bestPmu = null;
  let minPending = Infinity;
  for (const pmu of pmus) {
    const pending = db.prepare("SELECT COUNT(*) as c FROM inspections WHERE inspector_id = ? AND status = 'pending'").get(pmu.id).c;
    if (pending < minPending) {
      minPending = pending;
      bestPmu = pmu.id;
    }
  }

  const priority = maxRisk > 70 ? 'high' : (maxRisk > 40 ? 'medium' : 'low');
  
  const id = uuidv4();
  db.prepare("INSERT INTO inspections (id, ngo_id, inspector_id, priority, scheduled_date, assigned_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, bestNgo.id, bestPmu, priority, new Date().toISOString(), new Date().toISOString());

  const alertId = uuidv4();
  db.prepare("INSERT INTO alerts (id, type, ngo_id, message, severity, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(alertId, 'compliance', bestNgo.id, `AI assigned inspection for ${bestNgo.name}`, priority, new Date().toISOString());

  const inspection = db.prepare("SELECT * FROM inspections WHERE id = ?").get(id);
  const inspector = db.prepare("SELECT id, name, email FROM users WHERE id = ?").get(bestPmu);

  return { inspection, ngo: bestNgo, inspector, risk_score: maxRisk };
}

module.exports = { assignInspection };
