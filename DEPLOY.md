# DoSJE Monitoring Platform — Deployment Guide

## Overview of Deployment Options

| Method | Cost | Difficulty | Best For |
|--------|------|------------|----------|
| 🐳 Docker (local/VPS) | Free | ⭐⭐ | Full control |
| 🟣 Render | Free tier | ⭐ | Best free option |
| ☁️ VPS (DigitalOcean/AWS) | ~$5/mo | ⭐⭐⭐ | Production govt use |

---

## Option 1 — Docker Desktop (Local or VPS)

### Step 1: Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop/

### Step 2: Set up environment
```powershell
cd C:\Users\lenovo\.gemini\antigravity\scratch\dosje-app
copy .env.example .env
notepad .env    # Set a strong JWT_SECRET
```

### Step 3: Build and launch (one command!)
```powershell
docker-compose up --build -d
```

### Step 4: Open the app
```
http://localhost
```

### Useful Docker commands
```powershell
docker-compose logs -f                      # All logs
docker-compose logs -f server               # Server only
docker-compose down                         # Stop
docker-compose down -v                      # Stop + delete volumes
docker-compose up --build -d               # Rebuild after changes
docker-compose exec server node db/seed.js  # Re-seed DB
```

### What gets containerized
```
dosje_client (Nginx + React)  → port 80    http://localhost
dosje_server (Node.js API)    → internal   (proxied via Nginx)
sqlite_data  (Named volume)   → persisted across restarts
uploads_data (Named volume)   → persisted across restarts
```

---

## Option 2 — Render.com (Best Free Tier)

1. Go to **https://render.com** → Sign in
2. Click **New** → **Blueprint**
3. Connect your GitHub repo
4. Render detects `render.yaml` automatically
5. Deploys both services simultaneously ✅

> **Free tier note**: Render spins down after 15 min idle. First request after sleep takes ~30s.

---

## Option 3 — VPS (Production / Govt Use)

```bash
# On Ubuntu 22.04 VPS:
curl -fsSL https://get.docker.com | sh
git clone https://github.com/YOUR/dosje-app.git
cd dosje-app && cp .env.example .env && nano .env
docker-compose up --build -d

# Add SSL with Let's Encrypt:
apt install certbot python3-certbot-nginx -y
certbot --nginx -d dosje.yourdomain.gov.in
```

---

## CI/CD — GitHub Actions

The pipeline at `.github/workflows/ci-cd.yml` runs automatically:

| Trigger | What runs |
|---------|-----------|
| Push to `main` | API tests → Frontend build → Docker images pushed |
| Pull Request | Tests + build only (no push) |

Add these GitHub Secrets for Docker Hub push:
```
DOCKERHUB_USERNAME = your_username
DOCKERHUB_TOKEN    = your_access_token
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | **Change in production!** |
| `PORT` | Backend port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `VITE_API_URL` | Backend URL for cloud deploy |

---

## Deployment Files Added

```
dosje-app/
├── .github/workflows/ci-cd.yml   GitHub Actions pipeline
├── server/Dockerfile              Node.js container
├── server/.dockerignore
├── client/Dockerfile              Multi-stage: build + Nginx
├── client/.dockerignore
├── client/nginx.conf              SPA routing + API proxy + gzip
├── docker-compose.yml             Production orchestration
├── docker-compose.dev.yml         Dev with hot reload
├── render.yaml                    Render.com blueprint
├── .env.example                   Environment template
└── .gitignore
```
