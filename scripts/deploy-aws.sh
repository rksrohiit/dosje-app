#!/bin/bash
# ==============================================================================
# DoSJE Monitoring Platform — Automated AWS EC2 / Lightsail Deployment Script
# Supports: Ubuntu 22.04 LTS, Ubuntu 24.04 LTS, Debian 12, Amazon Linux 2023
# ==============================================================================

set -e

echo "=========================================================="
echo "🇮🇳 DoSJE Monitoring Platform — AWS Deployment Setup"
echo "=========================================================="

# 1. Update system packages
echo "📦 Updating system packages..."
if [ -f /etc/debian_version ]; then
  sudo apt-get update -y
  sudo apt-get install -y curl git ufw
elif [ -f /etc/redhat-release ]; then
  sudo dnf update -y
  sudo dnf install -y curl git
fi

# 2. Install Docker & Docker Compose if not present
if ! command -v docker &> /dev/null; then
  echo "🐳 Installing Docker Engine..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  rm get-docker.sh
fi

# 3. Clone or pull latest code
REPO_DIR="/opt/dosje-app"
if [ ! -d "$REPO_DIR" ]; then
  echo "📂 Cloning repository to $REPO_DIR..."
  sudo git clone https://github.com/rksrohiit/dosje-app.git "$REPO_DIR"
  sudo chown -R $USER:$USER "$REPO_DIR"
else
  echo "🔄 Pulling latest code..."
  cd "$REPO_DIR"
  git pull origin main
fi

cd "$REPO_DIR"

# 4. Generate .env configuration if not exists
if [ ! -f .env ]; then
  echo "🔑 Generating secure production environment file..."
  JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || date +%s%N | sha256sum | head -c 64)
  cat <<EOF > .env
NODE_ENV=production
PORT=5000
JWT_SECRET=$JWT_SECRET
EOF
fi

# 5. Build and launch with Docker Compose
echo "🚀 Building and launching DoSJE containers on AWS..."
docker compose down || true
docker compose up --build -d

# 6. Configure Firewall (ports 80, 443, 5000)
if command -v ufw &> /dev/null; then
  echo "🛡️ Configuring UFW firewall..."
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw allow 5000/tcp
  sudo ufw allow 22/tcp
  sudo ufw --force enable || true
fi

echo ""
echo "=========================================================="
echo "✅ DoSJE Monitoring Platform successfully deployed on AWS!"
echo "=========================================================="
PUBLIC_IP=$(curl -s https://checkip.amazonaws.com || curl -s ifconfig.me || echo "your-ec2-ip")
echo "🌐 Web Dashboard: http://${PUBLIC_IP}"
echo "🤖 MCP Remote SSE Endpoint: http://${PUBLIC_IP}:5000/sse"
echo "📊 Health Check: http://${PUBLIC_IP}:5000/api/dashboard/health"
echo "=========================================================="
