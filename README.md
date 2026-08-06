# 📚 Sambandh - Nepal Policy Co-Creation Platform

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-blue.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Codefest Nepal 2026** - A collaborative platform for policy co-creation in Nepal

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Database Seeding](#-database-seeding)
- [Testing](#-testing)
- [Contributing](#-contributing)


---

## 🌟 Overview

**Sambandh** (meaning "Connection" in Nepali) is a policy co-creation platform designed for Codefest Nepal 2026. It bridges the gap between citizens, experts, and government officers in Nepal's policy-making process.

### 🎯 Purpose

- **Citizens**: View finalized policies and provide feedback through approve/disapprove votes
- **Experts**: Review policy drafts, provide comments, and suggest improvements
- **Officers**: Create, edit, and finalize policy drafts with expert collaboration

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with httpOnly cookies
- Three user roles: Officer, Expert, Citizen
- Role-based access control (RBAC)

### 📝 Policy Drafting
- Create, edit, and manage policy drafts
- Version history tracking
- Status workflow: Draft → Under Review → Finalized
- Sector and district categorization

### 💬 Expert Collaboration
- Threaded comments on drafts
- Real-time discussions
- Version history with edit tracking

### 🗳️ Public Feedback
- One-tap approve/disapprove on finalized policies
- Real-time sentiment tracking
- Anonymous feedback with phone verification (mock)
- **"What neighbors think"** — per-district approve/disapprove breakdown on
  the feedback summary (no login needed to view on the public policy page)

### 🗳️ District Priorities Board
On `/policies`, citizens can vote for their top 3 priority sectors (phone +
district, no login) and watch the live community ranking — overall and
per-district. One vote per phone; ranked scoring (3/2/1 points).

### 📊 Project Tracking Board
A public transparency dashboard at `/tracking` (no login required) showing
every provincial capital project from the seeded `projects` ledger:

- KPI cards (total projects, capital, avg completion, cost overrun, jobs)
- Status-mix pie, capital by province/sector, sector completion health charts
- Filterable ledger table (province × sector × status)

Data is sourced from the MoF Red Book and provincial budget statements
(FY 2078/79–2080/81).

### 🎥 Live Meetings
- Integrated video meetings using Jitsi Meet
- Instant meeting creation for draft discussions
- No account required for participants

### 📊 Policy Simulation Lab
A single unified page (`/simulator`, and `/drafts/:id/simulate` for draft-linked
runs) that produces a complete six-section report in one run:

1. **Projected outcomes** — estimated jobs, spending efficiency, completion
   likelihood and overrun risk, benchmarked against sector-wide historical averages
2. **Historical context** — execution trends (FY 2078/79–2080/81) for the sector,
   aggregation donut charts (delivery status mix, capital budget by sector and by
   province), nearest-neighbour precedents, and the draft budget as a share of the
   province's capital budget (FY 2080/81)
3. **Community consensus** — live participation data for the linked draft: expert
   comments (role counts + Nepali/English sentiment), public approve/disapprove
   votes, district breakdown, and an overall consensus label
4. **Health systems analysis** (Health & Nutrition sector) — policy success
   probability (logistic regression trained with gradient descent), per-program
   coverage gains per crore, forecast insurance claims from the claimant profile,
   plus an expert-consensus layer
5. **Matched historical precedents** — closest projects in the provincial ledger
6. **Detailed insights** — strengths, risks and recommendations, plus a narrative
   report summary

Draft-linked runs are **sector-bound**: the simulation always evaluates the
draft's own sector (enforced client-side and server-side), so a health draft
cannot be run against roads precedents. Standalone lab runs remain free-form.

All estimates are calibrated to published Nepali data — MoF Red Book /
provincial budget statements, NDHS 2022, NHSS-IP and CBS statistics — and the
UI attributes every estimate to its reference dataset and sources.

### 🗄️ Simulation Data
The engines run on real MongoDB collections, seeded from the deterministic
generators (which remain as a dev fallback when the collections are empty):

```bash
cd server && npm run seed:sim -- --reset
```

Seeds two collections:
- `projects` — 224 provincial capital projects (FY 2078/79–2080/81),
  anchored to provincial capital budgets (MoF Red Book FY 2080/81)
- `healthrecords` — 822 health ML training records (198 policy-success,
  224 budget-outcome, 400 claims) anchored to NDHS 2022 / NHIF / CBS

The policy-impact engine reads its nearest-neighbour ledger from `projects`
and the ML models train on `healthrecords` at first use — so model metadata
(e.g. `sampleSize`) reflects exactly what is stored.

### 🌐 Internationalization
- English/Nepali language toggle
- Full UI translation support
- Nepali font rendering with Noto Sans Devanagari

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime |
| Express.js | 4.18.2 | Web framework |
| MongoDB | 8.x | Database |
| Mongoose | 8.0.3 | ODM |
| JWT | 9.0.2 | Authentication |
| Bcrypt | 2.4.3 | Password hashing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.8 | Build tool |
| Tailwind CSS | 4.x | Styling |
| React Router | 6.20.1 | Routing |
| React Query | 5.12.2 | Data fetching |
| i18next | 23.7.6 | Internationalization |
| Axios | 1.6.2 | HTTP client |

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
  ```bash
  node --version
  # Should output: v18.0.0 or higher
  ```

- **npm** (v9 or higher)
  ```bash
  npm --version
  # Should output: v9.0.0 or higher
  ```

- **MongoDB** (v6 or higher)
  ```bash
  mongod --version
  # Should output: v6.0.0 or higher
  ```

- **Git** (for cloning)
  ```bash
  git --version
  ```

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/sambandh.git
cd sambandh
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (root, client, server)
npm run install-all

# OR install individually
npm install
cd client && npm install
cd server && npm install
```

### Step 3: Setup Environment Variables

Create `.env` files in both `server/` and `client/` directories.

**Server `.env`** (`/server/.env`):
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/sambandh

# JWT
JWT_SECRET=your-super-secret-jwt-key-2026
JWT_EXPIRE=7d

# Client URL (CORS)
CLIENT_URL=http://localhost:5173
```

**Client `.env`** (`/client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sambandh
```

### Step 4: Start MongoDB

#### Option A: Local MongoDB
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account and cluster
3. Get connection string
4. Replace `MONGO_URI` in `.env`

### Step 5: Seed the Database

```bash
# From root directory
npm run seed

# From server directory
cd server
npm run seed            # app demo data (users, drafts, comments, feedback)
npm run seed:sim        # simulation data (projects ledger + health ML records)
```

The simulation engines fall back to embedded generators when `projects` /
`healthrecords` are empty, so `seed:sim` is optional in development — but run
it for DB-backed authenticity in demos and presentations.

### Step 6: Start the Application

```bash
# From root directory (starts both client and server)
npm run dev

# OR start separately
cd client && npm run dev  # Frontend: http://localhost:5173
cd server && npm run dev  # Backend: http://localhost:5000
```

---

## 🎯 Test Accounts

After seeding the database, you can use these test accounts:

### Government Officers
| Email | Password | Department |
|-------|----------|------------|
| `ram.sharma@moi.gov.np` | `password123` | Ministry of Infrastructure |
| `sita.adhikari@mof.gov.np` | `password123` | Ministry of Finance |

### Verified Experts
| Email | Password | Specialization |
|-------|----------|----------------|
| `krishna.poudel@nast.gov.np` | `password123` | Economics |
| `gita.sharma@nast.gov.np` | `password123` | Agriculture |

### Citizens
| Email | Password | District |
|-------|----------|----------|
| `bishnu.ghimire@gmail.com` | `password123` | Pokhara |
| `nisha.thapa@yahoo.com` | `password123` | Biratnagar |

---

## 🔧 Environment Variables

### Server (`server/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/sambandh` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `CLIENT_URL` | Client URL for CORS | `http://localhost:5173` |

### Client (`client/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_APP_NAME` | App name | `Sambandh` |

---

## 📁 Project Structure

```
sambandh/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── api/                     # API calls and endpoints
│   │   ├── components/              # Reusable components
│   │   │   ├── common/              # Navbar, Footer, LanguageToggle
│   │   │   ├── layout/              # ProtectedRoute
│   │   │   ├── drafts/              # Draft components
│   │   │   └── feedback/            # Feedback components
│   │   ├── context/                 # AuthContext, ThemeContext
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/                   # Page components
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── public/              # Home, Policies
│   │   │   ├── dashboard/           # Dashboard
│   │   │   ├── drafts/              # Draft CRUD pages
│   │   │   ├── feedback/            # Feedback page
│   │   │   └── simulator/           # Unified Simulation Lab page
│   │   ├── locales/                 # i18n translation files
│   │   ├── styles/                  # Global CSS
│   │   ├── App.jsx                  # Main App component
│   │   ├── main.jsx                 # Entry point
│   │   └── i18n.js                  # i18n configuration
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
├── server/                          # Node.js Backend
│   ├── services/                  # Business services
│   │   ├── simulationModel.js     # Ledger-based policy impact model (calibrated to MoF Red Book)
│   │   ├── liveInsights.js        # Community consensus from comments + feedback
│   │   ├── reportBuilder.js       # Narrative report summary
│   │   ├── simulatorService.js    # Unified orchestration (policy + consensus + health ML)
│   │   ├── healthModel.js         # Health ML orchestration + tagging + consensus
│   │   └── ml/                    # Trained ML models (pure JS)
│   │       ├── core.js            # Gradient descent, normalization, metrics
│   │       ├── data.js            # Health datasets anchored to NDHS 2022 / CBS
│   │       ├── logisticRegression.js
│   │       ├── budgetModel.js
│   │       └── claimsModel.js
│   ├── controllers/               # Business logic
│   │   ├── authController.js
│   │   ├── draftController.js
│   │   ├── commentController.js
│   │   ├── feedbackController.js
│   │   ├── meetingController.js
│   │   ├── simulatorController.js
│   │   └── healthMlController.js
│   ├── models/                      # Mongoose models
│   │   ├── User.js
│   │   ├── Draft.js
│   │   ├── Comment.js
│   │   └── Feedback.js
│   ├── routes/                    # API routes
│   │   ├── authRoutes.js
│   │   ├── draftRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── meetingRoutes.js
│   │   ├── simulatorRoutes.js
│   │   └── healthMlRoutes.js
│   ├── middleware/                  # Middleware
│   │   ├── auth.js                 # JWT verification
│   │   ├── roleCheck.js            # RBAC
│   │   ├── validation.js           # Request validation
│   │   └── errorHandler.js         # Error handling
│   ├── seed/                        # Database seeding
│   │   └── seed.js
│   ├── config/                      # Configuration
│   ├── server.js                    # Main server file
│   ├── package.json
│   └── .env
│
├── package.json                     # Root package.json
└── README.md                        # This file
```

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Draft Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/drafts` | Get all drafts | Yes |
| GET | `/api/drafts/:id` | Get single draft | Yes |
| POST | `/api/drafts` | Create draft | Officer only |
| PATCH | `/api/drafts/:id` | Update draft | Officer/Expert |
| PATCH | `/api/drafts/:id/finalize` | Finalize draft | Officer only |

### Comment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/drafts/:draftId/comments` | Get comments | Yes |
| POST | `/api/drafts/:draftId/comments` | Add comment | Officer/Expert |

### Feedback Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/drafts/:draftId/feedback` | Submit feedback | Citizen only |
| GET | `/api/drafts/:draftId/feedback/summary` | Get feedback summary | Yes |
| GET | `/api/drafts/:draftId/feedback/summary/districts` | Get per-district sentiment breakdown | Yes |

### Priority Endpoints (public — no login)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/priorities` | Save/update a citizen priority vote (phone, district, up to 3 sectors) | No |
| GET | `/api/priorities/ranking?district=` | Community ranking (3/2/1 points), optional district filter | No |

### Project Tracking Endpoints (public — no login)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects?province=&sector=&status=&year=` | Filterable project ledger | No |
| GET | `/api/projects/stats` | Aggregates: totals, status mix, by-province, by-sector | No |

### Meeting Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/meetings/drafts/:id` | Create meeting | Yes |
| GET | `/api/meetings/drafts/:id` | Get meeting link | Yes |

### Simulator Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/simulate` | Unified simulation: projections, historical trend, community consensus (for linked drafts) and health ML analysis (for the health sector) | Yes |
| GET | `/api/simulate/metadata` | Model metadata & ledger size | Yes |

### Health ML Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ml/health/simulate` | Run health policy ML analysis (legacy, folded into `/api/simulate`) | Yes |
| GET | `/api/ml/health/metadata` | Get model metadata & training stats | Yes |

### Simulation Data Sources

All engines report their reference data through the API responses and UI footers:

| Source | Used for |
|--------|----------|
| MoF Red Book & provincial budget statements, FY 2080/81 | Provincial capital allocations (Rs crore) anchoring the development ledger |
| NDHS 2022 | Provincial immunization coverage, stunting and health baselines |
| NHSS-IP 2022–2030 (MoHP) | Health programme structure and coverage targets |
| NHIF claims benchmarks | Insurance claim incidence and cost baselines |
| Census 2021 (CBS) | Population, remoteness and household profiles |

Training records are reconstructed deterministically around these anchors so
model behaviour is reproducible and interpretable while reflecting real
provincial differences.

---

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"citizen","phone":"9841234567"}'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Current User
```bash
# Save cookie from login first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Use cookie to get user info
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### Get All Drafts
```bash
curl -X GET http://localhost:5000/api/drafts \
  -b cookies.txt
```

### Create Draft (Officer Only)
```bash
curl -X POST http://localhost:5000/api/drafts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Policy","sector":"development","currentVersionText":"Policy content here","district":"Kathmandu"}' \
  -b cookies.txt
```

### Submit Feedback (Citizen Only)
```bash
curl -X POST http://localhost:5000/api/drafts/YOUR_DRAFT_ID/feedback \
  -H "Content-Type: application/json" \
  -d '{"phone":"9841234567","reaction":"approve"}' \
  -b cookies.txt
```

---

## 🗄️ Database Seeding

### Seed Database
```bash
npm run seed            # app demo data (users, drafts, comments, feedback)
npm run seed:sim        # simulation data (projects ledger + health ML records)
npm run seed:priorities # demo district-priority votes (idempotent, upserts by phone)
```

### Seed Output Example
```
📡 Connected to MongoDB
🗑️  Cleared existing data
✅ Created 6 users
✅ Created 3 drafts
✅ Created 2 comments
✅ Created 5 feedback entries
🎉 Database Seeded Successfully!

📊 Summary:
   Users: 6
   Drafts: 3
   Comments: 2
   Feedback: 5
```

---

## 🚀 Common Commands

```bash
# Install all dependencies
npm run install-all

# Start development (client + server)
npm run dev

# Start only client
npm run client

# Start only server
npm run server

# Seed database
npm run seed

# Build client for production
npm run client-build

# Start server in production
npm run start

# Clean install (delete node_modules)
npm run clean
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"

# Start MongoDB (macOS)
brew services start mongodb-community

# Start MongoDB (Ubuntu)
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Node Version Issues
```bash
# Check Node version
node --version

# Use nvm to switch version
nvm install 18
nvm use 18
```

### Dependency Issues
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ESLint for JavaScript
- Use Prettier for formatting
- Follow React best practices
- Write meaningful comments

---

## 🎯 Quick Start Summary

```bash
# 1. Clone
git clone https://github.com/yourusername/sambandh.git
cd sambandh

# 2. Install
npm run install-all

# 3. Setup MongoDB
# Start MongoDB or use Atlas

# 4. Configure .env files
# Copy .env.example to .env and update values

# 5. Seed database
npm run seed

# 6. Run app
npm run dev

# 7. Open browser
# http://localhost:5173
```
