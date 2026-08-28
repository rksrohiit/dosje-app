const { db } = require('../db/schema');

/**
 * Evaluates NGO compliance and automatically triggers Grant Installment Hold or Release
 */
function evaluateGrantInstallments(ngoId) {
  const ngo = db.prepare('SELECT * FROM ngos WHERE id = ?').get(ngoId);
  if (!ngo) return null;

  const latestAttendance = db.prepare('SELECT anomaly_score FROM attendance WHERE ngo_id = ? ORDER BY date DESC LIMIT 1').get(ngoId);
  const anomalyScore = latestAttendance ? latestAttendance.anomaly_score : 0.1;

  const inspection = db.prepare('SELECT status, rating FROM reports WHERE ngo_id = ? ORDER BY created_at DESC LIMIT 1').get(ngoId);
  const inspectionRating = inspection ? inspection.rating : 4;

  let status = 'APPROVED';
  let reason = 'High compliance rating and verified audit reports.';
  let installmentAmount = 2500000; // ₹25 Lakhs standard installment

  if (ngo.compliance_score < 60 || anomalyScore > 0.7) {
    status = 'FROZEN';
    reason = 'Automated Hold: Compliance score below 60% or high attendance anomaly flagged.';
  } else if (ngo.compliance_score < 80 || inspectionRating < 3) {
    status = 'UNDER_REVIEW';
    reason = 'Manual Review Required: Moderate compliance score or pending audit clarification.';
  }

  return {
    ngo_id: ngo.id,
    ngo_name: ngo.name,
    scheme: ngo.scheme,
    compliance_score: ngo.compliance_score,
    anomaly_score: anomalyScore,
    status,
    reason,
    installment_amount: installmentAmount,
    evaluated_at: new Date().toISOString()
  };
}

function getAllGrantStatuses() {
  const ngos = db.prepare('SELECT id FROM ngos').all();
  return ngos.map(ngo => evaluateGrantInstallments(ngo.id));
}

module.exports = {
  evaluateGrantInstallments,
  getAllGrantStatuses
};
