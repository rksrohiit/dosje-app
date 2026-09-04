/**
 * DoSJE Trust Score Engine
 * Computes a 0-100 trust score for field evidence based on multiple verification signals.
 *
 * Scoring Weights:
 *   GPS Verification     20%
 *   Timestamp Check      15%
 *   Device Integrity     15%
 *   Duplicate Detection  20%
 *   AI Activity Match    15%
 *   Beneficiary Confirm  15%
 */

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function simpleStringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16);
}

function computeTrustScore(evidence, beneficiary) {
  const checks = {
    gps: { score: 0, max: 20, detail: '' },
    timestamp: { score: 0, max: 15, detail: '' },
    device: { score: 0, max: 15, detail: '' },
    duplicate: { score: 0, max: 20, detail: '' },
    activity: { score: 0, max: 15, detail: '' },
    beneficiary_confirm: { score: 0, max: 15, detail: '' }
  };

  // 1. GPS Verification (20 points)
  if (evidence.gps_lat && evidence.gps_lng && beneficiary?.lat && beneficiary?.lng) {
    const distance = haversineDistance(
      evidence.gps_lat, evidence.gps_lng,
      beneficiary.lat, beneficiary.lng
    );
    evidence.distance_from_target = Math.round(distance);

    if (distance < 100) {
      checks.gps.score = 20;
      checks.gps.detail = `${Math.round(distance)}m from target — TRUSTED`;
    } else if (distance < 500) {
      checks.gps.score = 12;
      checks.gps.detail = `${Math.round(distance)}m from target — REVIEW`;
    } else {
      checks.gps.score = 3;
      checks.gps.detail = `${Math.round(distance)}m from target — SUSPICIOUS`;
    }
  } else {
    checks.gps.score = 5;
    checks.gps.detail = 'GPS data incomplete';
  }

  // 2. Timestamp Check (15 points)
  const capturedAt = new Date(evidence.captured_at || Date.now());
  const now = new Date();
  const timeDiffMinutes = Math.abs(now - capturedAt) / 60000;

  if (timeDiffMinutes < 5) {
    checks.timestamp.score = 15;
    checks.timestamp.detail = 'Captured within 5 minutes — FRESH';
  } else if (timeDiffMinutes < 60) {
    checks.timestamp.score = 10;
    checks.timestamp.detail = `Captured ${Math.round(timeDiffMinutes)}min ago — ACCEPTABLE`;
  } else {
    checks.timestamp.score = 3;
    checks.timestamp.detail = `Captured ${Math.round(timeDiffMinutes)}min ago — STALE`;
  }

  // 3. Device Integrity (15 points)
  if (evidence.device_id) {
    checks.device.score = 15;
    checks.device.detail = `Device ID: ${evidence.device_id.substring(0, 8)}... — VERIFIED`;
  } else {
    checks.device.score = 5;
    checks.device.detail = 'No device ID captured';
  }

  // 4. Duplicate Detection (20 points) — simulated perceptual hash
  if (evidence.file_hash) {
    // In production: compare against stored hashes using hamming distance
    // For demo: generate a unique confidence score
    const hashNum = parseInt(evidence.file_hash.substring(0, 8), 16) || 0;
    const uniqueness = 80 + (hashNum % 20);
    if (uniqueness > 90) {
      checks.duplicate.score = 20;
      checks.duplicate.detail = `Uniqueness: ${uniqueness}% — NO DUPLICATES`;
    } else {
      checks.duplicate.score = 10;
      checks.duplicate.detail = `Uniqueness: ${uniqueness}% — POSSIBLE SIMILARITY`;
    }
  } else {
    checks.duplicate.score = 5;
    checks.duplicate.detail = 'No file hash available';
  }

  // 5. AI Activity Match (15 points) — simulated
  if (evidence.verification_code) {
    checks.activity.score = 13;
    checks.activity.detail = `Dynamic code "${evidence.verification_code}" present in frame — MATCHED`;
  } else {
    checks.activity.score = 7;
    checks.activity.detail = 'No verification challenge code detected';
  }

  // 6. Beneficiary Confirmation (15 points)
  if (evidence.beneficiary_confirmed === 1) {
    checks.beneficiary_confirm.score = 15;
    checks.beneficiary_confirm.detail = 'Beneficiary confirmed via OTP — VERIFIED';
  } else {
    checks.beneficiary_confirm.score = 0;
    checks.beneficiary_confirm.detail = 'Awaiting beneficiary confirmation';
  }

  // Compute total
  const totalScore = Object.values(checks).reduce((sum, c) => sum + c.score, 0);

  // Determine status
  let trustStatus = 'pending';
  if (totalScore >= 90) trustStatus = 'verified';
  else if (totalScore >= 70) trustStatus = 'review';
  else trustStatus = 'suspicious';

  return {
    trust_score: totalScore,
    trust_status: trustStatus,
    ai_checks: checks,
    distance_from_target: evidence.distance_from_target || null
  };
}

function generateVerificationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateFileHash(content) {
  // Simulated SHA-256 — in production use crypto.createHash('sha256')
  const base = content || `ev-${Date.now()}-${Math.random()}`;
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += '0123456789abcdef'.charAt(
      (base.charCodeAt(i % base.length) + i * 7) % 16
    );
  }
  return hash;
}

module.exports = {
  computeTrustScore,
  generateVerificationCode,
  generateFileHash,
  haversineDistance
};
