/**
 * AI Computer Vision Service
 * Simulated Face Detection & Automated CCTV Headcount Engine
 */

function detectFacesInCCTVFrame(cameraName, reportedHeadcount = 50) {
  // Simulates AI Object Detection / Face Count on CCTV Frame
  const randomVariance = Math.floor(Math.random() * 8) - 4;
  const detectedFaces = Math.max(15, Math.min(reportedHeadcount + randomVariance, 60));
  
  // Generate bounding box overlays for UI rendering
  const boundingBoxes = Array.from({ length: detectedFaces }, (_, i) => ({
    id: `face_${i + 1}`,
    x: Math.floor(10 + (i * 12) % 80),
    y: Math.floor(15 + (i * 9) % 70),
    width: 6 + Math.floor(Math.random() * 4),
    height: 8 + Math.floor(Math.random() * 4),
    confidence: (0.85 + Math.random() * 0.14).toFixed(2),
  }));

  const discrepancy = Math.abs(reportedHeadcount - detectedFaces);
  const isGhostBeneficiaryAlert = reportedHeadcount > (detectedFaces * 1.25);

  return {
    cameraName: cameraName || 'Main Dining Hall Camera',
    timestamp: new Date().toISOString(),
    reported_headcount: reportedHeadcount,
    cctv_detected_faces: detectedFaces,
    headcount_discrepancy: discrepancy,
    accuracy_confidence: '96.4%',
    ghost_beneficiary_alert: isGhostBeneficiaryAlert,
    bounding_boxes: boundingBoxes,
  };
}

module.exports = { detectFacesInCCTVFrame };
