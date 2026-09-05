#!/bin/bash
set -e

IP="16.176.150.64"
DOMAIN="16.176.150.64.nip.io"
EMAIL="admin@dosje.gov.in"

echo "=========================================================="
echo "?? Securing DoSJE Platform with Let's Encrypt (HTTPS)"
echo "=========================================================="
echo ""

echo "?? 1. Stopping current Docker containers..."
sudo docker-compose down || true

echo "?? 2. Installing Certbot..."
sudo apt-get update -y
sudo apt-get install -y certbot

echo "?? 3. Requesting SSL Certificate for $DOMAIN..."
# Run certbot in standalone mode to spin up a temporary webserver on port 80 to verify domain ownership
sudo certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos -m $EMAIL

echo "??  4. Switching Nginx configuration to HTTPS..."
cp client/nginx.https.conf client/nginx.conf

echo "?? 5. Rebuilding and starting secure Docker containers..."
# Use both docker-compose files to expose port 443 and mount the certs
sudo docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

echo ""
echo "=========================================================="
echo "? SUCCESS! Your site is now secure."
echo "?? Access it here: https://$DOMAIN"
echo "=========================================================="
