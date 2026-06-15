# InvestBridge - Global Investment Marketplace

**Verified. Secure. Confidential. Global.**

A full-stack investment marketplace connecting verified entrepreneurs with credible investors. Built from the InvestBridge Project Planning Document v1.0.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| Auth | JWT |

## Project Structure

```
insvestment/
├── backend/          # Express API + MongoDB models
│   └── src/
│       ├── models/   # All 18 database collections
│       ├── routes/   # REST API endpoints
│       └── middleware/
├── frontend/         # Next.js web application
│   └── app/          # Pages and routes
└── docker-compose.yml
```

## Database Schema

Implements all collections from the ereser.io schema:

- **User Management:** users, investor_profiles, founder_profiles, verifications
- **Project Zone:** projects, project_documents, project_milestones
- **Deal System:** deals, deal_messages, deal_documents, deal_payments
- **Trust & Security:** ratings, disputes, reports, audit_logs
- **Business Features:** subscriptions, notifications, saved_projects

## MVP Features

- User authentication (register/login) for investors, founders, and admins
- Profile creation and management
- Project listing, browsing, and filtering
- Document upload and verification workflow
- Deal rooms with secure messaging
- Admin approval dashboard
- Notifications system
- Saved projects for investors

## Quick Start

### 1. Start MongoDB

```bash
docker compose up -d
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed    # Creates demo data
npm run dev     # Starts API on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev     # Starts app on http://localhost:3000
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@investbridge.com | admin123 |
| Investor | investor@investbridge.com | investor123 |
| Founder | founder@investbridge.com | founder123 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/projects | Browse projects |
| POST | /api/projects | Create project (founder) |
| POST | /api/deals | Express investment interest |
| GET | /api/deals/:id | Deal room details |
| POST | /api/verifications | Submit KYC document |
| GET | /api/admin/stats | Admin dashboard stats |

## Deferred Features (Post-MVP)

Per the project document, these are planned for future releases:

- AI-powered smart matching
- Escrow payment system (Stripe/Wise)
- Mobile native apps
- Multi-language support
- Blockchain contracts

## License

Confidential - InvestBridge Global
