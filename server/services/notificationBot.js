/**
 * WhatsApp & SMS Alert Bot Integration Service
 * Simulates real-time dispatch to Twilio / Meta WhatsApp Business API
 */

const notificationHistory = [];

async function sendWhatsAppAlert({ phone, recipientName, ngoName, type, message, actionUrl }) {
  const timestamp = new Date().toISOString();
  const alertPayload = {
    id: `wa_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    channel: 'WhatsApp',
    phone: phone || '+91 98765 43210',
    recipientName: recipientName || 'NGO Director',
    ngoName: ngoName || 'DoSJE Partner NGO',
    type: type || 'Anomaly Alert',
    message: message || 'High discrepancy detected in attendance records.',
    status: 'DELIVERED',
    timestamp,
    formattedMessage: `🇮🇳 *DoSJE Monitoring Bot Alert*\n\nDear *${recipientName}*,\n\nAn alert has been flagged for *${ngoName}*:\n\n*Type:* ${type}\n*Details:* ${message}\n\n👉 *View Details:* ${actionUrl || 'http://localhost:5173'}`
  };

  notificationHistory.unshift(alertPayload);
  console.log(`💬 [WhatsApp Bot] Alert sent to ${alertPayload.phone} (${recipientName}): ${message}`);
  return alertPayload;
}

async function sendSMSAlert({ phone, recipientName, message }) {
  const timestamp = new Date().toISOString();
  const smsPayload = {
    id: `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    channel: 'SMS',
    phone: phone || '+91 98765 43210',
    recipientName: recipientName || 'PMU Officer',
    message: message || 'DoSJE Alert: Inspection assigned.',
    status: 'DELIVERED',
    timestamp,
    formattedMessage: `[DoSJE Alert] ${message}. Login at dosje.gov.in`
  };

  notificationHistory.unshift(smsPayload);
  console.log(`📱 [SMS Bot] SMS sent to ${smsPayload.phone}: ${message}`);
  return smsPayload;
}

function getNotificationHistory() {
  return notificationHistory;
}

module.exports = {
  sendWhatsAppAlert,
  sendSMSAlert,
  getNotificationHistory
};
