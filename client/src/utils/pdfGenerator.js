/**
 * Official DoSJE Government PDF Inspection Report Generator
 */

export const generateInspectionPDF = (reportData = {}) => {
  const {
    id = 'REP-2026-8849',
    ngoName = 'Delhi NGO - SMILE Scheme',
    scheme = 'SMILE',
    location = 'Delhi, India',
    inspectorName = 'Priya Sharma (PMU)',
    date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    rating = 4,
    findings = 'Physical inspection completed. Beneficiary presence verified against live CCTV face detection stream and Aadhaar biometric RD service.',
    gpsCoords = '28.6139° N, 77.2090° E',
    cctvFaceCount = 44,
    reportedCount = 48,
    fraudRiskScore = 28,
    biometricMatchScore = '96.8%',
    exifStatus = 'VERIFIED_GENUINE_ON_SITE',
    grantStatus = 'RELEASE APPROVED'
  } = reportData;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>DoSJE Official Inspection Report - ${id}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; background: #fff; line-height: 1.5; }
        .tricolor { height: 6px; width: 100%; display: flex; margin-bottom: 20px; border-radius: 3px; overflow: hidden; }
        .tricolor-saffron { background: #FF9933; width: 33.33%; }
        .tricolor-white { background: #FFFFFF; width: 33.34%; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
        .tricolor-green { background: #138808; width: 33.33%; }
        .header { text-align: center; border-bottom: 2px solid #003087; padding-bottom: 15px; margin-bottom: 20px; }
        .emblem { font-size: 32px; margin-bottom: 4px; }
        .gov-title { font-size: 18px; font-weight: 800; color: #003087; text-transform: uppercase; margin: 0; tracking-wide: 1px; }
        .dept-title { font-size: 13px; font-weight: 700; color: #475569; margin: 2px 0 0; }
        .report-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 12px; background: #f1f5f9; display: inline-block; padding: 4px 16px; border-radius: 20px; border: 1px solid #cbd5e1; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; }
        .card-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .card-value { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }
        .section-heading { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #003087; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin: 20px 0 10px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
        .table th, .table td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        .table th { background: #f1f5f9; font-weight: 700; color: #334155; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .badge-green { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .badge-rose { background: #ffe4e6; color: #9f1239; border: 1px solid #f43f5e; }
        .signature-block { margin-top: 40px; display: flex; justify-between: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        .qr-placeholder { width: 75px; height: 75px; border: 2px border-dashed #94a3b8; border-radius: 8px; display: flex; align-items: center; justify-center: center; font-size: 9px; font-weight: 700; color: #64748b; text-align: center; }
        .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="tricolor">
        <div class="tricolor-saffron"></div>
        <div class="tricolor-white"></div>
        <div class="tricolor-green"></div>
      </div>

      <div class="header">
        <div class="emblem">🇮🇳</div>
        <h1 class="gov-title">Government of India</h1>
        <p class="dept-title">Department of Social Justice and Empowerment</p>
        <span class="report-title">OFFICIAL GEO-TAGGED FIELD AUDIT REPORT</span>
      </div>

      <div class="grid">
        <div class="card">
          <div class="card-label">Report Reference ID</div>
          <div class="card-value">${id}</div>
        </div>
        <div class="card">
          <div class="card-label">Inspection Date</div>
          <div class="card-value">${date}</div>
        </div>
        <div class="card">
          <div class="card-label">Monitored Institute / NGO</div>
          <div class="card-value">${ngoName} (${scheme})</div>
        </div>
        <div class="card">
          <div class="card-label">PMU Field Inspector</div>
          <div class="card-value">${inspectorName}</div>
        </div>
      </div>

      <div class="section-heading">1. Verified Field Geofence & GPS Stamp</div>
      <div class="card">
        <div class="card-label">Physical GPS Coordinates</div>
        <div class="card-value">📍 ${gpsCoords} (${location})</div>
      </div>

      <div class="section-heading">2. AI Vision & Computer Vision Audit Matrix</div>
      <table class="table">
        <thead>
          <tr>
            <th>Audit Category</th>
            <th>System Value / Reading</th>
            <th>Verification Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CCTV Face Detection Count</td>
            <td>${cctvFaceCount} Verified Faces (Claimed: ${reportedCount})</td>
            <td><span class="badge badge-green">MATCHED WITHIN VARIANCE</span></td>
          </tr>
          <tr>
            <td>EXIF Photo Geofence Check</td>
            <td>GPS Radius: 38 meters from Registered Address</td>
            <td><span class="badge badge-green">${exifStatus}</span></td>
          </tr>
          <tr>
            <td>Aadhaar Biometric RD Audit</td>
            <td>UIDAI Match Score: ${biometricMatchScore}</td>
            <td><span class="badge badge-green">VERIFIED MATCH</span></td>
          </tr>
          <tr>
            <td>NGO Fraud Risk Index</td>
            <td>Score: ${fraudRiskScore} / 100</td>
            <td><span class="badge badge-green">LOW RISK TIER</span></td>
          </tr>
          <tr>
            <td>Grant Installment Trigger</td>
            <td>Installment ₹25,00,000 Disbursement</td>
            <td><span class="badge badge-green">${grantStatus}</span></td>
          </tr>
        </tbody>
      </table>

      <div class="section-heading">3. Inspector Remarks & Audit Findings</div>
      <div class="card" style="background: #ffffff; border: 1px solid #cbd5e1;">
        <p style="margin: 0; font-size: 12px; font-weight: 500; color: #1e293b;">${findings}</p>
      </div>

      <div class="signature-block">
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #0f172a;">${inspectorName}</div>
          <div style="font-size: 10px; color: #64748b;">Authorized PMU Field Inspector</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">Digital Hash: SHA256_8849F_DoSJE_VERIFIED</div>
        </div>
        <div class="qr-placeholder">
          VERIFIED<br>QR SEAL<br>🇮🇳 DoSJE
        </div>
      </div>

      <div class="footer">
        Confidential Document • Ministry of Social Justice & Empowerment, Shastri Bhawan, New Delhi
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};
