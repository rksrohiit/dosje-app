# 🇮🇳 DoSJE Monitoring Platform — Amazon Cloud (AWS) & MCP Deployment Guide

This guide provides end-to-end instructions for deploying the **DoSJE Monitoring Platform** on **Amazon Web Services (AWS)** and connecting it with the **Model Context Protocol (MCP)** for AI assistant integrations (Claude Desktop, Cursor, Antigravity, custom LLMs).

---

## 🏛️ Part 1: Amazon Cloud (AWS) Hosting Options

| Deployment Option | AWS Service | Cost | Setup Time | Best For |
|---|---|---|---|---|
| **Option A (Recommended)** | **AWS App Runner** | Free tier eligible / ~$5/mo | 5 mins | Fully managed container, auto-HTTPS, zero maintenance |
| **Option B (Lowest Cost)** | **AWS Lightsail** | $3.50 / month | 5 mins | Dedicated cloud server with fixed pricing and 1-line script |
| **Option C (Production VPS)**| **AWS EC2 (t3/t4g.small)** | Free tier (t2.micro) / ~$10/mo | 10 mins | Full Linux root control, custom domains, Let's Encrypt SSL |
| **Option D (GovCloud/Enterprise)** | **AWS ECS + Fargate** | Pay-as-you-go | 15 mins | Enterprise serverless containers with auto-scaling |

---

## 🚀 Option A: Deploy on AWS App Runner (Fastest & Simplest)

AWS App Runner directly builds and runs containerized web applications from your GitHub repository with automatic SSL and zero server configuration.

### Step 1: Open AWS App Runner
1. Sign in to the **[AWS Management Console](https://console.aws.amazon.com/)**.
2. Search for **App Runner** in the top search bar.
3. Select your AWS Region (e.g., `ap-south-1` for Mumbai, India or `ap-southeast-1` for Singapore).
4. Click **Create service**.

### Step 2: Connect Source Code Repository
1. Select **Source code repository** ➡️ **GitHub**.
2. Click **Add new** to authorize AWS to access your GitHub account.
3. Select repository: **`rksrohiit/dosje-app`**.
4. Branch: **`main`**.
5. Deployment trigger: Select **Automatic** (deploys automatically whenever you push code).

### Step 3: Configure Build Settings
- Choose **Use a configuration file**.
- App Runner will automatically detect `apprunner.yaml` located in the root repository.
  *(Alternatively, if configuring manually in the console: Runtime: `Nodejs 20`, Build command: `npm --prefix client ci && npm --prefix client run build && npm --prefix server ci && npm install`, Start command: `node server/index.js`, Port: `5000`).*

### Step 4: Environment Variables
Add the following under **Environment variables**:
- `NODE_ENV` = `production`
- `PORT` = `5000`
- `JWT_SECRET` = `generate_any_secure_random_64_char_key`

### Step 5: Review & Deploy
Click **Create & Deploy**. In ~3–5 minutes, AWS App Runner will output your live URL:
```
https://xyz123abc.ap-south-1.awsapprunner.com
```

---

## ⚡ Option B: Deploy on AWS Lightsail ($3.50 / Month)

AWS Lightsail is Amazon's pre-configured cloud VPS offering fixed, predictable billing.

### Step 1: Create Instance
1. Go to **[AWS Lightsail Console](https://lightsail.aws.amazon.com/)**.
2. Click **Create instance**.
3. Select instance location: **Mumbai (`ap-south-1`)**.
4. Select platform: **Linux/Unix** ➡️ OS Only: **Ubuntu 22.04 LTS**.
5. Choose plan: **$3.50/month** (512 MB RAM, 1 vCPU, 20 GB SSD) or **$5/month** (1 GB RAM).
6. Give it a name: `dosje-app-server` and click **Create instance**.

### Step 2: Open Ports in Lightsail Firewall
1. Click your instance name ➡️ **Networking** tab.
2. Under **IPv4 Firewall**, click **Add rule**:
   - Add **HTTP (Port 80)**
   - Add **HTTPS (Port 443)**
   - Add **Custom TCP (Port 5000)** (for direct API/MCP access)

### Step 3: One-Line Deployment Script
Click the terminal icon (Connect using SSH) or SSH from your terminal, then run:

```bash
curl -fsSL https://raw.githubusercontent.com/rksrohiit/dosje-app/main/scripts/deploy-aws.sh | bash
```

The script will automatically:
1. Install Docker and Docker Compose
2. Clone the repository to `/opt/dosje-app`
3. Generate production secrets in `.env`
4. Build and start the fullstack containers
5. Configure the local UFW firewall

Your platform is now live at: `http://<your-lightsail-public-ip>`

---

## ☁️ Option C: Deploy on AWS EC2 with Custom Domain & Free SSL

### Step 1: Launch EC2 Instance
1. Go to **EC2 Console** ➡️ **Launch Instance**.
2. Name: `dosje-production`.
3. AMI: **Ubuntu Server 22.04 LTS (HVM)**.
4. Instance type: `t4g.small` (ARM Graviton) or `t3.small` (x86).
5. Key pair: Select or create your `.pem` key pair.
6. Network settings: Check **Allow SSH (22)**, **Allow HTTP (80)**, and **Allow HTTPS (443)**.
7. Click **Launch Instance**.

### Step 2: Run Deployment on EC2
Connect via SSH:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

Clone and start the application:
```bash
git clone https://github.com/rksrohiit/dosje-app.git
cd dosje-app
sudo bash scripts/deploy-aws.sh
```

### Step 3: Configure Free Let's Encrypt SSL with Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.dosje.gov.in
```

---

## 🤖 Part 2: Connect DoSJE with Model Context Protocol (MCP)

The DoSJE platform includes a **built-in MCP Server** that implements the official Anthropic Model Context Protocol specification (`protocolVersion: 2024-11-05`).

### 🛠️ 8 Live MCP Tools Exposed to AI Agents

1. `dosje_list_projects`: Query welfare schemes (SMILE, DAP, SHG), budgets, and progress.
2. `dosje_create_project`: Register a new social welfare project with unique ID and coordinates.
3. `dosje_list_beneficiaries`: Search beneficiaries with masked Aadhaar DPDP privacy.
4. `dosje_get_beneficiary_status`: Retrieve PM-AJAY 5-stage progress and verified entitlements ledger.
5. `dosje_query_field_evidence`: Inspect tamper-proof field photos, GPS proximity, and SHA-256 hashes.
6. `dosje_calculate_trust_score`: Run the 6-signal Trust Engine (GPS, time, device, hash, code, OTP).
7. `dosje_get_compliance_stats`: Fetch national compliance leaderboard and attendance anomalies.
8. `dosje_trigger_ai_inspection`: Dispatch automated unannounced inspections based on risk score.

---

### How to Connect MCP to AI Assistants

#### 1. Claude Desktop (Mac / Windows)
Open your Claude Desktop configuration file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following configuration:

##### Local Stdio Mode:
```json
{
  "mcpServers": {
    "dosje-monitoring": {
      "command": "node",
      "args": [
        "C:\\Users\\lenovo\\.gemini\\antigravity\\scratch\\dosje-app\\server\\mcp\\index.js"
      ],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

##### Remote AWS Cloud Mode:
```json
{
  "mcpServers": {
    "dosje-cloud-aws": {
      "serverUrl": "https://<your-aws-apprunner-url>/sse"
    }
  }
}
```

---

#### 2. Cursor IDE
In Cursor IDE:
1. Go to **Cursor Settings** ➡️ **Features** ➡️ **MCP**.
2. Click **+ Add New MCP Server**.
3. Set:
   - **Name**: `dosje-monitoring`
   - **Type**: `command`
   - **Command**: `node server/mcp/index.js`
4. Or for remote AWS:
   - **Type**: `sse`
   - **URL**: `https://<your-aws-domain>/sse`

---

#### 3. Google Antigravity / Gemini Assistant
Add the configuration to `~/.gemini/config/mcp_config.json`:
```json
{
  "mcpServers": {
    "dosje-monitoring": {
      "command": "node",
      "args": [
        "C:\\Users\\lenovo\\.gemini\\antigravity\\scratch\\dosje-app\\server\\mcp\\index.js"
      ]
    }
  }
}
```

---

### 💬 Sample Prompts to Try with Your AI Assistant Once Connected

Once connected via MCP, you can converse naturally with Claude / Cursor / Antigravity about your platform:

- *"List all active DoSJE projects under the SMILE scheme and tell me their total allocated budget."*
- *"Check the verification status and entitlement ledger for beneficiary BEN-1001."*
- *"Audit the recent field verification evidence for suspicious records where GPS proximity exceeded 100 meters."*
- *"Run the Trust Score engine for a field inspection captured at latitude 28.59, longitude 77.04 with challenge code X7P92."*
- *"Trigger an AI inspection assignment for the NGO with the lowest compliance rating."*
