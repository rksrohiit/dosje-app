const { db } = require('../db/schema');

/**
 * AI Fraud Risk Indexing Engine
 * Computes multi-variable risk score for NGOs (0-100)
 */
function calculateNgoFraudRisk(ngoId) {
  const ngo = db.prepare('SELECT * FROM ngos WHERE id = ?').get(ngoId);
  if (!ngo) return null;

  // 1. Attendance Variance Factor (35% weight)
  const attendanceRecords = db.prepare('SELECT reported_count, verified_count, anomaly_score FROM attendance WHERE ngo_id = ? ORDER BY date DESC LIMIT 14').all(ngoId);
  let totalVariance = 0;
  attendanceRecords.forEach(a => {
    if (a.reported_count > a.verified_count) {
      totalVariance += (a.reported_count - a.verified_count) / a.reported_count;
    }
  });
  const avgVariance = attendanceRecords.length > 0 ? totalVariance / attendanceRecords.length : 0.1;
  const attendanceScore = Math.min(avgVariance * 100 * 2.5, 100);

  // 2. Compliance Score Deficit (25% weight)
  const complianceDeficit = 100 - (ngo.compliance_score || 85);

  // 3. Inspection Audit Failures (25% weight)
  const inspectionReports = db.prepare('SELECT rating FROM reports WHERE ngo_id = ?').all(ngoId);
  let lowRatingCount = 0;
  inspectionReports.forEach(r => { if (r.rating < 3) lowRatingCount++; });
  const auditFailureScore = Math.min(lowRatingCount * 30, 100);

  // 4. CCTV Camera Offline Penalty (15% weight)
  const cameraOfflinePenalty = ((ngo.total_cameras - ngo.cameras_online) / ngo.total_cameras) * 100;

  // Calculate Weighted Fraud Risk Score
  const fraudRiskScore = Math.round(
    attendanceScore * 0.35 +
    complianceDeficit * 0.25 +
    auditFailureScore * 0.25 +
    cameraOfflinePenalty * 0.15
  );

  let riskTier = 'LOW';
  let recommendedAction = 'Routine Monitoring';
  if (fraudRiskScore >= 75) {
    riskTier = 'CRITICAL';
    recommendedAction = 'Freeze Grant Disbursement & Trigger Emergency Unannounced Inspection';
  } else if (fraudRiskScore >= 50) {
    riskTier = 'HIGH';
    recommendedAction = 'Dispatch PMU Inspector & Require CCTV Live Stream Audit';
  } else if (fraudRiskScore >= 30) {
    riskTier = 'MODERATE';
    recommendedAction = 'Require Biometric Attendance Resubmission';
  }

  return {
    ngo_id: ngo.id,
    ngo_name: ngo.name,
    scheme: ngo.scheme,
    state: ngo.state,
    compliance_score: ngo.compliance_score,
    fraud_risk_score: Math.min(fraudRiskScore, 99),
    riskTier,
    recommendedAction,
    breakdown: {
      attendance_variance_pct: (avgVariance * 100).toFixed(1) + '%',
      compliance_deficit: complianceDeficit + '%',
      audit_failure_score: auditFailureScore,
      cctv_offline_penalty: cameraOfflinePenalty.toFixed(0) + '%',
    }
  };
}

function getAllNgoFraudRisks() {
  const ngos = db.prepare('SELECT id FROM ngos').all();
  return ngos.map(ngo => calculateNgoFraudRisk(ngo.id)).sort((a, b) => b.fraud_risk_score - a.fraud_risk_score);
}

module.exports = { calculateNgoFraudRisk, getAllNgoFraudRisks };
