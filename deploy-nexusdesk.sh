#!/bin/bash
# ════════════════════════════════════════════════════════════════
#  NexusDesk MSP Platform — DigitalOcean VPS Deployment Script
#  Target: Ubuntu 24.04 LTS
#  Stack: Nginx + Node.js 22 + PostgreSQL 16 + Redis 7
# ════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Configuration (EDIT THESE) ──
DOMAIN="nexusdesk.yourdomain.com"
APP_USER="nexusdesk"
APP_DIR="/opt/nexusdesk"
DB_NAME="nexusdesk_db"
DB_USER="nexusdesk_user"
DB_PASS="$(openssl rand -base64 24)"  # Auto-generated secure password
ADMIN_EMAIL="admin@yourdomain.com"

echo "════════════════════════════════════════════"
echo "  NexusDesk MSP Platform — Server Setup"
echo "════════════════════════════════════════════"
echo ""
echo "Domain:    $DOMAIN"
echo "App Dir:   $APP_DIR"
echo "DB Name:   $DB_NAME"
echo ""

# ══════════════════════════════════════
# 1. SYSTEM UPDATE & BASE PACKAGES
# ══════════════════════════════════════
echo "[1/9] Updating system packages..."
apt update && apt upgrade -y
apt install -y \
  curl wget gnupg2 software-properties-common \
  build-essential git ufw fail2ban \
  ca-certificates lsb-release apt-transport-https \
  unzip htop nano

# ══════════════════════════════════════
# 2. CREATE APPLICATION USER
# ══════════════════════════════════════
echo "[2/9] Creating application user..."
if ! id "$APP_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$APP_USER"
  echo "User $APP_USER created"
fi
mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"

# ══════════════════════════════════════
# 3. INSTALL NODE.JS 22 LTS
# ══════════════════════════════════════
echo "[3/9] Installing Node.js 22 LTS..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
echo "Node.js $(node -v) installed"
echo "npm $(npm -v) installed"

# Install PM2 process manager
npm install -g pm2

# ══════════════════════════════════════
# 4. INSTALL POSTGRESQL 16
# ══════════════════════════════════════
echo "[4/9] Installing PostgreSQL 16..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg
apt update
apt install -y postgresql-16 postgresql-client-16

# Configure PostgreSQL
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql <<EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOF

echo "PostgreSQL 16 configured with database: $DB_NAME"

# ══════════════════════════════════════
# 5. INSTALL REDIS 7
# ══════════════════════════════════════
echo "[5/9] Installing Redis 7..."
apt install -y redis-server

# Secure Redis
sed -i 's/^# requirepass .*/requirepass nexusdesk_redis_secret/' /etc/redis/redis.conf
sed -i 's/^bind .*/bind 127.0.0.1 ::1/' /etc/redis/redis.conf
sed -i 's/^# maxmemory .*/maxmemory 256mb/' /etc/redis/redis.conf
sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

systemctl restart redis-server
systemctl enable redis-server
echo "Redis 7 installed and secured"

# ══════════════════════════════════════
# 6. INSTALL & CONFIGURE NGINX
# ══════════════════════════════════════
echo "[6/9] Installing Nginx..."
apt install -y nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/nexusdesk <<NGINX
# Rate limiting zone
limit_req_zone \$binary_remote_addr zone=api:10m rate=30r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

server {
    listen 80;
    server_name $DOMAIN;

    # Redirect HTTP to HTTPS (enabled after certbot)
    # return 301 https://\$host\$request_uri;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Static files
    location /static/ {
        alias $APP_DIR/public/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API routes with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
    }

    # Login rate limiting
    location /api/auth/ {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket support (real-time notifications)
    location /ws {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # Frontend (React SPA)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Block common attacks
    location ~ /\. { deny all; }
    location ~* \.(env|git|svn|htaccess)$ { deny all; }

    # Max upload size (for attachments)
    client_max_body_size 25M;
}
NGINX

ln -sf /etc/nginx/sites-available/nexusdesk /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
systemctl enable nginx
echo "Nginx configured for $DOMAIN"

# ══════════════════════════════════════
# 7. SSL WITH LET'S ENCRYPT
# ══════════════════════════════════════
echo "[7/9] Setting up SSL..."
apt install -y certbot python3-certbot-nginx

echo ""
echo "  Run this AFTER your DNS is pointed to this server:"
echo "  sudo certbot --nginx -d $DOMAIN -m $ADMIN_EMAIL --agree-tos --non-interactive"
echo ""
echo "  Auto-renewal is handled by systemd timer (certbot.timer)"
echo ""

# ══════════════════════════════════════
# 8. FIREWALL & SECURITY
# ══════════════════════════════════════
echo "[8/9] Configuring firewall and security..."

# UFW Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
echo "UFW firewall enabled"

# Fail2Ban configuration
cat > /etc/fail2ban/jail.local <<F2B
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 7200

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
F2B

systemctl restart fail2ban
systemctl enable fail2ban
echo "Fail2Ban configured"

# SSH Hardening
sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config
systemctl restart sshd

# Kernel security tweaks
cat >> /etc/sysctl.conf <<SYSCTL
# NexusDesk security hardening
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
kernel.randomize_va_space = 2
SYSCTL
sysctl -p

# ══════════════════════════════════════
# 9. APPLICATION SCAFFOLD
# ══════════════════════════════════════
echo "[9/9] Setting up application scaffold..."

# Create app structure
sudo -u "$APP_USER" bash <<SCAFFOLD
cd $APP_DIR
mkdir -p src public/static config logs uploads backups

# Create .env file
cat > .env <<ENV
# NexusDesk Environment Configuration
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis
REDIS_URL=redis://:nexusdesk_redis_secret@127.0.0.1:6379

# Security
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
BCRYPT_ROUNDS=12

# Application
APP_URL=https://$DOMAIN
APP_NAME=NexusDesk
ADMIN_EMAIL=$ADMIN_EMAIL

# API Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# File Uploads
UPLOAD_DIR=$APP_DIR/uploads
MAX_FILE_SIZE=25000000

# Logging
LOG_LEVEL=info
LOG_DIR=$APP_DIR/logs

# Integrations (add your keys)
CONNECTWISE_API_KEY=
DATTO_API_KEY=
M365_TENANT_ID=
M365_CLIENT_ID=
M365_CLIENT_SECRET=
SENTINELONE_API_KEY=
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=
DUO_IKEY=
DUO_SKEY=
DUO_HOST=
ACRONIS_API_KEY=
SLACK_WEBHOOK_URL=

# Email (SMTP)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=$ADMIN_EMAIL
ENV

chmod 600 .env

# Create package.json
cat > package.json <<PKG
{
  "name": "nexusdesk",
  "version": "2.4.1",
  "description": "NexusDesk MSP Helpdesk & CRM Platform",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "cd client && npm run build",
    "migrate": "node src/db/migrate.js",
    "seed": "node src/db/seed.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.21.0",
    "pg": "^8.13.0",
    "redis": "^4.7.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "helmet": "^8.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.4.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.0",
    "ws": "^8.18.0",
    "dotenv": "^16.4.0",
    "winston": "^3.14.0",
    "uuid": "^10.0.0",
    "joi": "^17.13.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.0",
    "jest": "^29.7.0"
  }
}
PKG
SCAFFOLD

# ── PM2 Ecosystem File ──
sudo -u "$APP_USER" cat > "$APP_DIR/ecosystem.config.js" <<PM2
module.exports = {
  apps: [{
    name: 'nexusdesk',
    script: './src/server.js',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '$APP_DIR/logs/pm2-error.log',
    out_file: '$APP_DIR/logs/pm2-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000
  }]
};
PM2

# Set PM2 to start on boot
pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER"

# ══════════════════════════════════════
# SETUP AUTOMATED BACKUPS
# ══════════════════════════════════════
cat > /etc/cron.d/nexusdesk-backup <<CRON
# NexusDesk daily database backup at 2 AM
0 2 * * * $APP_USER pg_dump -U $DB_USER $DB_NAME | gzip > $APP_DIR/backups/db-\$(date +\%Y\%m\%d).sql.gz

# Cleanup backups older than 7 days
0 3 * * * $APP_USER find $APP_DIR/backups/ -name "*.sql.gz" -mtime +7 -delete

# Log rotation
0 4 * * 0 $APP_USER find $APP_DIR/logs/ -name "*.log" -mtime +30 -delete
CRON

chmod 644 /etc/cron.d/nexusdesk-backup

# ══════════════════════════════════════
# DONE — SUMMARY
# ══════════════════════════════════════
echo ""
echo "════════════════════════════════════════════════════════"
echo "  NexusDesk Server Setup Complete!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  Stack Installed:"
echo "    • Ubuntu 24.04 LTS"
echo "    • Node.js $(node -v) with PM2"
echo "    • PostgreSQL 16"
echo "    • Redis 7"
echo "    • Nginx (reverse proxy)"
echo "    • UFW Firewall + Fail2Ban"
echo ""
echo "  Database Credentials (SAVE THESE):"
echo "    • DB Name:     $DB_NAME"
echo "    • DB User:     $DB_USER"
echo "    • DB Password:  $DB_PASS"
echo ""
echo "  Next Steps:"
echo "    1. Point DNS A record for $DOMAIN to this server IP"
echo "    2. Run: sudo certbot --nginx -d $DOMAIN -m $ADMIN_EMAIL --agree-tos"
echo "    3. cd $APP_DIR && npm install"
echo "    4. npm run migrate && npm run seed"
echo "    5. pm2 start ecosystem.config.js"
echo "    6. Configure integration API keys in $APP_DIR/.env"
echo ""
echo "  Config file: $APP_DIR/.env"
echo "  Logs:        $APP_DIR/logs/"
echo "  Backups:     $APP_DIR/backups/ (daily at 2 AM)"
echo ""
echo "════════════════════════════════════════════════════════"
