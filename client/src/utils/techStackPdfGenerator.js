/**
 * Official DoSJE Platform Technology Stack PDF Generator
 */

export const generateTechStackPDF = () => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>DoSJE Monitoring Platform - Complete Technology Stack Specification</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; background: #fff; line-height: 1.5; }
        .tricolor { height: 6px; width: 100%; display: flex; margin-bottom: 20px; border-radius: 3px; overflow: hidden; }
        .tricolor-saffron { background: #FF9933; width: 33.33%; }
        .tricolor-white { background: #FFFFFF; width: 33.34%; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
        .tricolor-green { background: #138808; width: 33.33%; }
        .header { text-align: center; border-bottom: 2px solid #003087; padding-bottom: 15px; margin-bottom: 20px; }
        .emblem { font-size: 32px; margin-bottom: 4px; }
        .gov-title { font-size: 18px; font-weight: 800; color: #003087; text-transform: uppercase; margin: 0; }
        .dept-title { font-size: 13px; font-weight: 700; color: #475569; margin: 2px 0 0; }
        .document-title { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 12px; background: #f1f5f9; display: inline-block; padding: 4px 16px; border-radius: 20px; border: 1px solid #cbd5e1; }
        
        .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #003087; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin: 22px 0 10px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
        .table th, .table td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        .table th { background: #f1f5f9; font-weight: 700; color: #334155; width: 28%; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; margin-right: 4px; }
        .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 10px; }
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
        <p class="dept-title">Department of Social Justice and Empowerment (DoSJE)</p>
        <span class="document-title">FULL-STACK SYSTEM TECHNOLOGY ARCHITECTURE SPECIFICATION</span>
      </div>

      <p style="font-size: 11px; color: #475569; margin-bottom: 15px; text-align: center;">
        Comprehensive Technical Document detailing all Frameworks, Libraries, AI Models, Protocols, Databases, and Deployment Infrastructure.
      </p>

      <!-- Section 1 -->
      <div class="section-title">1. Frontend Architecture & User Interface</div>
      <table class="table">
        <tr>
          <th>Core UI Framework</th>
          <td><strong>React 18.2.0</strong> (Functional Components, Custom Context Hooks, Concurrent Rendering)</td>
        </tr>
        <tr>
          <th>Build Tool & Bundler</th>
          <td><strong>Vite 5.4</strong> (Lightning-fast HMR server, Rollup production chunk optimization)</td>
        </tr>
        <tr>
          <th>CSS & Design System</th>
          <td><strong>Tailwind CSS v3.4</strong> (Utility-first responsive design, Govt Tricolor theme palette, Dark CCTV HUD overlays)</td>
        </tr>
        <tr>
          <th>Icons & Assets</th>
          <td><strong>Lucide React</strong> (Vector iconography for controls, alerts, and metrics)</td>
        </tr>
        <tr>
          <th>Client Navigation</th>
          <td><strong>React Router DOM v6.22</strong> (Single-page app routing, Layout wrappers, Private route authentication guards)</td>
        </tr>
      </table>

      <!-- Section 2 -->
      <div class="section-title">2. Real-Time Communication & WebRTC Video Conferencing</div>
      <table class="table">
        <tr>
          <th>Peer-to-Peer Video Stream</th>
          <td><strong>Native Browser WebRTC RTCPeerConnection API</strong> (MediaDevices getUserMedia API, low-latency encrypted streaming)</td>
        </tr>
        <tr>
          <th>STUN Infrastructure</th>
          <td><strong>Google STUN Servers</strong> (<code>stun:stun.l.google.com:19302</code> for NAT traversal)</td>
        </tr>
        <tr>
          <th>Signaling Engine</th>
          <td><strong>Socket.IO Client & Server v4.7</strong> (WebSocket signaling for WebRTC session handshake, live CCTV updates, and instant anomaly push alerts)</td>
        </tr>
      </table>

      <!-- Section 3 -->
      <div class="section-title">3. Backend API Server & Database Architecture</div>
      <table class="table">
        <tr>
          <th>Server Runtime</th>
          <td><strong>Node.js v20 LTS</strong> (Asynchronous event-driven I/O engine)</td>
        </tr>
        <tr>
          <th>API Framework</th>
          <td><strong>Express.js v4.18</strong> (RESTful routes for Auth, NGOs, Inspections, Analytics, Reports, and Bot dispatches)</td>
        </tr>
        <tr>
          <th>Database Engine</th>
          <td><strong>Better-SQLite3 v9.4</strong> (High-speed embedded relational database with Foreign Keys, 10 NGO seeders, 300 attendance logs, and audit tables)</td>
        </tr>
        <tr>
          <th>Authentication & Security</th>
          <td><strong>JSON Web Tokens (JWT) + Bcrypt.js</strong> (Bearer token authentication, 24h expiration, role-based authorization: Admin, PMU, NGO, Beneficiary)</td>
        </tr>
      </table>

      <!-- Section 4 -->
      <div class="section-title">4. Artificial Intelligence & Security Systems</div>
      <table class="table">
        <tr>
          <th>AI CCTV Headcount Engine</th>
          <td><strong>Computer Vision Face Detection HUD</strong> (Real-time face bounding box overlay, automated face count vs register claim discrepancy auditing)</td>
        </tr>
        <tr>
          <th>EXIF Geofence Fraud Check</th>
          <td><strong>Haversine Distance Metadata Engine</strong> (EXIF extraction analyzing GPS coordinates, timestamp, and 500m geofence radius)</td>
        </tr>
        <tr>
          <th>NGO Fraud Risk Engine</th>
          <td><strong>Multi-Variable ML Risk Classifier</strong> (Scoring attendance variance 35%, compliance 25%, audit failures 25%, CCTV downtime 15%)</td>
        </tr>
        <tr>
          <th>Aadhaar Biometric Audit</th>
          <td><strong>UIDAI L1 RD Service Simulator</strong> (Handheld fingerprint & iris retinal match score verification)</td>
        </tr>
        <tr>
          <th>Field Safety SOS Signal</th>
          <td><strong>Inspector Emergency Distress Dispatch</strong> (Live GPS coordinates transmission to Police Dial 112 & PMU Control Rooms)</td>
        </tr>
        <tr>
          <th>Financial Grant Engine</th>
          <td><strong>Automated Fund Hold/Release Trigger</strong> (Auto-freezes or approves ₹25 Lakhs grant installments based on compliance scores)</td>
        </tr>
      </table>

      <!-- Section 5 -->
      <div class="section-title">5. Progressive Web App (PWA) & Offline Capabilities</div>
      <table class="table">
        <tr>
          <th>PWA Manifest</th>
          <td><strong>manifest.json</strong> (Standalone display mode, portrait orientation, theme color #003087, 192x192 & 512x512 app icons)</td>
        </tr>
        <tr>
          <th>Service Worker</th>
          <td><strong>sw.js</strong> (Offline app shell caching, static asset pre-caching, network fallback)</td>
        </tr>
        <tr>
          <th>PWA Install Banner</th>
          <td><strong>PWAInstallPrompt.jsx</strong> (Captures beforeinstallprompt browser event for 1-click mobile app installation)</td>
        </tr>
        <tr>
          <th>Browser Push Alerts</th>
          <td><strong>HTML5 Notification API</strong> (Native OS push notification banners on high-severity anomaly dispatches)</td>
        </tr>
      </table>

      <!-- Section 6 -->
      <div class="section-title">6. Maps, Data Visualizations & Multi-Lingual Support</div>
      <table class="table">
        <tr>
          <th>Geographic Map Component</th>
          <td><strong>Leaflet.js 1.9 & React-Leaflet 4.2</strong> (Interactive India map displaying NGO locations colored by compliance rating)</td>
        </tr>
        <tr>
          <th>Data Visualization</th>
          <td><strong>Recharts 2.12</strong> (Interactive Line Charts for 30-day attendance trends, Bar Charts, and Anomaly Pie Charts)</td>
        </tr>
        <tr>
          <th>Route Optimizer & Calendar</th>
          <td><strong>TSP Shortest-Path Router</strong> (Calculates 24% travel reduction for inspectors + .ics iCal file exporter for Google Calendar)</td>
        </tr>
        <tr>
          <th>Multi-Lingual i18n</th>
          <td><strong>Custom LanguageContext & Translations</strong> (1-Click English ↔ Hindi (हिन्दी) switcher with persistent localStorage state)</td>
        </tr>
        <tr>
          <th>Email & WhatsApp Bots</th>
          <td><strong>Nodemailer + Bot Dispatcher</strong> (Official DoSJE HTML email alerts + Twilio/Meta WhatsApp & SMS notification streams)</td>
        </tr>
      </table>

      <!-- Section 7 -->
      <div class="section-title">7. Cloud Deployment & CI/CD Infrastructure</div>
      <table class="table">
        <tr>
          <th>Containerization</th>
          <td><strong>Docker & Docker Compose</strong> (Multi-stage production build configuration)</td>
        </tr>
        <tr>
          <th>Cloud Hosting</th>
          <td><strong>Render.com Blueprint (render.yaml)</strong> + <strong>Vercel Serverless (vercel.json)</strong></td>
        </tr>
        <tr>
          <th>CI/CD Pipeline</th>
          <td><strong>GitHub Actions (.github/workflows/ci-cd.yml)</strong> + <strong>GitHub Repo</strong> (https://github.com/rksrohiit/dosje-app.git)</td>
        </tr>
      </table>

      <div class="footer">
        DoSJE Platform Technology Specification • Government of India • System Architecture Version 4.0
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
