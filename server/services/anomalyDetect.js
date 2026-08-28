const { db } = require('../db/schema');

function calculateAnomalyScore(ngo_id, reported_count, verified_count) {
  let base_score = 0;
  if (reported_count > verified_count) {
    base_score += ((reported_count - verified_count) / reported_count) * 0.5;
  }

  const last7 = db.prepare("SELECT AVG(reported_count) as avg FROM attendance WHERE ngo_id = ? AND date >= date('now', '-7 days')").get(ngo_id);
  const avg = last7 && last7.avg ? last7.avg : reported_count;

  if (reported_count > avg * 1.3) {
    base_score += 0.3;
  }
  if (reported_count < avg * 0.5) {
    base_score += 0.2;
  }

  return Math.min(base_score, 1.0);
}

function detectPatterns(ngo_id) {
  const records = db.prepare("SELECT reported_count, verified_count FROM attendance WHERE ngo_id = ? ORDER BY date DESC LIMIT 7").all(ngo_id);
  
  if (records.length < 7) return false;

  const allPerfect = records.every(r => r.reported_count === r.verified_count && r.reported_count > 0);
  return allPerfect; // possible suspicious perfect attendance
}

module.exports = { calculateAnomalyScore, detectPatterns };
