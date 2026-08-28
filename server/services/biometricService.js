/**
 * Aadhaar Biometric & Iris Verification Service
 * Simulates UIDAI L1 Registered Device (RD) Service Interface
 */

function verifyAadhaarBiometric({ aadhaarNumber, mode = 'FINGERPRINT', scanData = null }) {
  const isMatch = true; // Simulated high match rate for valid beneficiaries
  const matchScore = (94.5 + Math.random() * 5).toFixed(1);
  const rdDeviceId = 'RD_MANTRA_MFS100_884920';

  const maskedAadhaar = aadhaarNumber
    ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}`
    : 'XXXX-XXXX-8921';

  return {
    verificationId: `bio_${Date.now()}`,
    aadhaarRef: maskedAadhaar,
    mode: mode, // 'FINGERPRINT' | 'IRIS'
    rdDeviceId,
    matchScore: `${matchScore}%`,
    status: 'VERIFIED_MATCH',
    uidaiTimestamp: new Date().toISOString(),
    details: {
      name: 'Anita Devi',
      schemeId: 'SMILE_2024_DELHI',
      biometricHash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    }
  };
}

module.exports = { verifyAadhaarBiometric };
