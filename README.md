# NexusDesk — MSP Helpdesk & CRM Platform

A self-hosted helpdesk, CRM, and operations platform built for Managed Service Providers. Runs on Ubuntu with Node.js, PostgreSQL, and Redis.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-22%20LTS-green)
![PostgreSQL](https://img.shields.io/badge/postgresql-16-blue)
![Redis](https://img.shields.io/badge/redis-7-red)

---

## Features

**Helpdesk & Ticketing**
- Priority-based ticket queue (P1–P4) with SLA timers and auto-escalation
- Kanban board and list views with filters by status, priority, assignee
- Internal notes, client replies, and time tracking per ticket
- Ticket categories: Infrastructure, Network, Security, Hardware, Software, Onboarding, Backup/DR, Licensing, Compliance, and custom
- Email-to-ticket ingestion, client portal submissions, and monitoring alert auto-creation
- File attachments up to 25MB per ticket

**CRM & Client Management**
- Full client profiles with contacts, contracts, invoices, tickets, assets, and notes
- Account flags (VIP, SLA-Premium, HIPAA, At-Risk, Renewal, etc.) with custom flag creation
- Client health scoring (0–100) based on ticket volume, SLA compliance, and device status
- Primary/technical/billing contact designation with portal access control
- Custom fields per client, contact, ticket, or asset

**Billing & Invoicing**
- Invoice creation with line items, tax calculation, and recurring billing
- Payment tracking (Draft → Sent → Outstanding → Paid/Overdue)
- QuickBooks integration for automatic sync
- Revenue reporting and MRR tracking per client
- Time entry billing from ticket work logs

**Assets & Device Management**
- Hardware inventory with hostname, type, OS, IP, serial number
- Real-time status monitoring (online/offline/warning) via RMM integration
- CPU, memory, and disk usage tracking
- Warranty expiration alerts
- Asset-to-client and asset-to-ticket linking

**Integrations & API**
- REST API with JWT authentication and rate limiting
- Webhook support for incoming and outgoing events
- Built-in integrations: ConnectWise, Datto RMM, Microsoft 365, SentinelOne, Acronis, Duo Security, QuickBooks, Hudu, Slack, Auvik, IT Glue, Proofpoint
- API key management with multiple keys and revocation

**Security**
- AES-256 encryption at rest for all sensitive data
- MFA enforcement with Duo Security integration
- SSO/SAML support (Azure AD, Okta)
- Role-based access control (Admin, Manager, Technician, Dispatcher, Viewer)
- IP whitelisting, session management, and API rate limiting
- Full audit log with user, action, entity, IP, and severity tracking
- Fail2Ban and UFW firewall configuration
- HIPAA/compliance-ready with BAA support

**Reports & Analytics**
- Ticket volume trends, SLA compliance rates, and category breakdown
- Technician performance metrics (resolved count, avg resolution time)
- Revenue trends and invoice status breakdown
- Client health dashboard

---

## Requirements

- **OS:** Ubuntu 22.04 or 24.04 LTS
- **Node.js:** 22 LTS
- **PostgreSQL:** 16+
- **Redis:** 7+
- **RAM:** 4 GB minimum (8 GB recommended)
- **Disk:** 20 GB minimum
- **Domain:** Required for SSL

---

## Quick Install

SSH into your server as root and run:

```bash
git clone https://github.com/YOUR_USERNAME/nexusdesk.git /opt/nexusdesk
cd /opt/nexusdesk
chmod +x install.sh
sudo ./install.sh
```

The install script handles everything: system packages, Node.js, PostgreSQL, Redis, Nginx, firewall, SSL prep, and application setup.

---

## Manual Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/nexusdesk.git /opt/nexusdesk
cd /opt/nexusdesk
```

### 2. Run the server setup script

```bash
chmod +x deploy-nexusdesk.sh
sudo ./deploy-nexusdesk.sh
```

This installs all system dependencies (Node.js 22, PostgreSQL 16, Redis 7, Nginx) and configures the firewall, Fail2Ban, and SSH hardening.

### 3. Install Node.js dependencies

```bash
cd /opt/nexusdesk
npm install
```

### 4. Configure environment

```bash
nano .env
```

Edit the `.env` file with your settings. The deploy script auto-generates secure secrets, but you need to fill in:
- Your domain (`APP_URL`)
- SMTP settings for email notifications
- Integration API keys (ConnectWise, Datto, M365, etc.)

### 5. Initialize the database

```bash
# Run the schema
psql -U nexusdesk_user -d nexusdesk_db -f schema.sql

# Run migrations and seed data
npm run migrate
npm run seed
```

### 6. Set up SSL

Point your DNS A record to the server IP, then:

```bash
sudo certbot --nginx -d yourdomain.com -m admin@yourdomain.com --agree-tos
```

### 7. Start the application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list (survives reboots)
pm2 save

# Check status
pm2 status
```

### 8. Verify

Open `https://yourdomain.com` in your browser. Default admin credentials are created during seed.

---

## Project Structure

```
nexusdesk/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level views
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client functions
│   │   ├── store/           # State management
│   │   └── utils/           # Helper functions
│   ├── public/
│   └── package.json
├── src/                     # Node.js backend
│   ├── routes/              # Express route handlers
│   │   ├── auth.js
│   │   ├── tickets.js
│   │   ├── clients.js
│   │   ├── assets.js
│   │   ├── invoices.js
│   │   ├── integrations.js
│   │   └── reports.js
│   ├── middleware/           # Auth, rate limiting, validation
│   ├── services/            # Business logic
│   ├── integrations/        # Third-party API connectors
│   ├── db/
│   │   ├── migrate.js       # Database migrations
│   │   ├── seed.js          # Seed data
│   │   └── pool.js          # Connection pool
│   ├── websocket/           # Real-time notifications
│   ├── cron/                # Scheduled jobs (SLA checks, sync)
│   └── server.js            # Entry point
├── schema.sql               # Database schema
├── ecosystem.config.js      # PM2 configuration
├── deploy-nexusdesk.sh      # Server setup script
├── install.sh               # Quick install script
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | Secret for auth tokens | Yes |
| `APP_URL` | Public URL of your install | Yes |
| `SMTP_HOST` | Mail server hostname | Yes |
| `SMTP_PORT` | Mail server port | Yes |
| `SMTP_USER` | Mail username | Yes |
| `SMTP_PASS` | Mail password | Yes |
| `CONNECTWISE_API_KEY` | ConnectWise Manage API key | No |
| `DATTO_API_KEY` | Datto RMM API key | No |
| `M365_TENANT_ID` | Microsoft 365 tenant ID | No |
| `SENTINELONE_API_KEY` | SentinelOne API key | No |
| `QUICKBOOKS_CLIENT_ID` | QuickBooks OAuth client | No |
| `DUO_IKEY` | Duo Security integration key | No |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook | No |

### SLA Defaults

SLA response and resolution times are configured per priority level. Defaults:

| Priority | Response | Resolution |
|----------|----------|------------|
| P1 Critical | 15 min | 1 hour |
| P2 High | 1 hour | 4 hours |
| P3 Medium | 4 hours | 8 hours |
| P4 Low | 8 hours | 24 hours |

Modify in Settings → General → SLA Configuration, or edit `custom_field_definitions` in the database.

---

## API

Base URL: `https://yourdomain.com/api/v1`

Authentication via Bearer token:

```bash
curl -X POST https://yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@nexusdesk.io", "password": "your-password"}'
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tickets` | List tickets (filterable) |
| `POST` | `/tickets` | Create ticket |
| `GET` | `/tickets/:id` | Get ticket detail |
| `PUT` | `/tickets/:id` | Update ticket |
| `GET` | `/clients` | List clients |
| `POST` | `/clients` | Create client |
| `GET` | `/clients/:id` | Get client detail |
| `GET` | `/assets` | List assets |
| `POST` | `/assets` | Create asset |
| `GET` | `/invoices` | List invoices |
| `POST` | `/invoices` | Create invoice |
| `GET` | `/reports/tickets` | Ticket analytics |
| `GET` | `/reports/sla` | SLA compliance |
| `GET` | `/reports/revenue` | Revenue reports |

Full API documentation available at `https://yourdomain.com/api/docs` after install.

---

## Updating

```bash
cd /opt/nexusdesk
git pull origin main
npm install
npm run migrate
pm2 restart nexusdesk
```

---

## Backups

Automated daily database backups run at 2 AM via cron. Backups are stored in `/opt/nexusdesk/backups/` with 7-day retention.

Manual backup:

```bash
pg_dump -U nexusdesk_user nexusdesk_db | gzip > backup-$(date +%Y%m%d).sql.gz
```

Restore:

```bash
gunzip < backup-20260428.sql.gz | psql -U nexusdesk_user nexusdesk_db
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
