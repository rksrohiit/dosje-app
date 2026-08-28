const nodemailer = require('nodemailer');

// Initialize SMTP transporter if env variables provided
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Sends real-time HTML email alert to DoSJE officials when an anomaly is detected.
 */
async function sendAnomalyAlertEmail(alertData) {
  const {
    ngoName = 'Monitored Institute',
    type = 'Attendance Anomaly',
    message = 'High discrepancy between reported and CCTV verified headcount.',
    severity = 'HIGH',
    location = 'Delhi, India',
    date = new Date().toLocaleString()
  } = alertData;

  const recipientEmail = process.env.ALERT_RECIPIENT || 'dosje-alerts@gov.in';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; border-top: 4px solid #FF9933; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; color: #fbbf24; }
        .header p { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-top: 12px; }
        .badge-high { background: #ffe4e6; color: #e11d48; border: 1px solid #f43f5e; }
        .content { padding: 24px; }
        .field { margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
        .field-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
        .field-value { font-size: 14px; font-weight: 600; color: #0f172a; }
        .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 13px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🇮🇳 Government of India</h1>
          <p>Department of Social Justice and Empowerment • Real-time Monitoring Portal</p>
          <span class="badge badge-high">⚠️ ${severity} SEVERITY ANOMALY ALERT</span>
        </div>
        <div class="content">
          <div class="field">
            <div class="field-label">Flagged Institute / NGO</div>
            <div class="field-value">${ngoName}</div>
          </div>
          <div class="field">
            <div class="field-label">Anomaly Category</div>
            <div class="field-value">${type}</div>
          </div>
          <div class="field">
            <div class="field-label">AI System Findings</div>
            <div class="field-value">${message}</div>
          </div>
          <div class="field">
            <div class="field-label">Timestamp & Geofence</div>
            <div class="field-value">📍 ${location} • ${date}</div>
          </div>
          <div style="text-align: center;">
            <a href="http://localhost:5173/analytics" class="btn">View Live Dashboard Alert</a>
          </div>
        </div>
        <div class="footer">
          Automated System Alert • Ministry of Social Justice & Empowerment, New Delhi
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: '"DoSJE AI Monitoring" <no-reply@dosje.gov.in>',
        to: recipientEmail,
        subject: `🚨 [${severity} ALERT] Anomaly Detected at ${ngoName}`,
        html: htmlContent,
      });
      console.log(`✉️ Email alert sent to ${recipientEmail}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send SMTP email alert:', error.message);
      return { success: false, error: error.message };
    }
  } else {
    console.log(`✉️ [SMTP Simulation] Email Alert for "${ngoName}" logged to console (No SMTP config).`);
    return { success: true, simulated: true };
  }
}

module.exports = { sendAnomalyAlertEmail };
