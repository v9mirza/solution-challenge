# Smart Hospital Decision & Resource Allocation System

**Solution Challenge Project 2026**

A MERN-stack application (MongoDB, Express, React, Node.js) designed for real-time triage, dynamic prioritization, and capacity-aware bed allocation decisions.

This system functions as a decision-support platform, not a traditional static FIFO queue, enabling intelligent and responsive patient flow management.

---

## Contents

- [Project overview](#project-overview)
- [Current architecture](#current-architecture)
- [Roles, auth, and account model](#roles-auth-and-account-model)
- [Key capabilities](#key-capabilities)
- [API overview](#api-overview)
- [Run locally](#run-locally)
- [Workflow](#workflow)
- [Notes and roadmap](#notes-and-roadmap)

---

## Project overview

The system improves triage by combining:

- patient symptoms and vitals intake
- explainable urgency scoring
- bed suggestions (`icu` / `general` / `none`)
- real-time capacity inputs
- role-based actions for staff

Instead of FIFO, patients are continuously ranked based on urgency and context.

---

## Current architecture

### Stack

| Layer | Location | Notes |
| --- | --- | --- |
| API | `server/` | Express, JWT, Mongoose |
| Frontend | `client/` | Vite, React, React Router |

### Project layout

```text
solution-challenge/
├── client/src/          # pages, components, lib/api.js
├── server/src/          # routes, controllers, services, models, engine/
├── client/.env.example  # VITE_API_URL
└── server/.env.example  # PORT, MONGODB_URI, JWT_SECRET
```

### Single-capacity model (current)

The project now uses a **single system-wide capacity state** (no multi-hospital model):

- one `SystemState` document stores:
  - `icuTotal`, `icuOccupied`
  - `generalTotal`, `generalOccupied`
- staff updates this through `/api/capacity`

---

## Roles, auth, and account model

There are **2 roles**:

| Role | Purpose |
| --- | --- |
| `user` | patient-facing actions (intake + status view) |
| `staff` | operations, queue control, capacity management, staff governance |

### Auth flow

- shared login endpoint for both roles: `POST /api/auth/login`
- public signup endpoint creates `user` only: `POST /api/auth/register`
- JWT carries the role for route protection

### Staff account creation

Staff accounts are created by staff through protected endpoints:

- `POST /api/staff/users` (alias: `POST /api/admin/users`)

Public staff signup is intentionally not exposed.

---

## Key capabilities

### User features

- sign up and log in
- submit or update intake data (symptoms + vitals)
- view:
  - queue token
  - urgency score
  - suggested bed type
  - lifecycle status
  - staff note

### Staff features

1. **Queue management**
   - view prioritized patient queue
   - filter queue based on requirements
   - export queue reports in CSV format
2. **Capacity management**
   - update global capacity limits
   - built-in validation with auto-capping to prevent over-allocation
3. **Patient lifecycle management**
   - manage patient status through all stages:
     - waiting
     - in progress
     - admitted
     - discharged
     - cancelled
4. **Patient notes and prioritization**
   - add or update staff notes for patients
   - apply manual priority override with reason
   - clear priority override when no longer required
5. **Staff governance**
   - create new staff accounts
   - enable/disable staff users
   - reset passwords with force password change on next login
6. **Reporting and monitoring**
   - generate filtered reports
   - export data for analysis and record keeping

### Safety and validation

- capacity fields require non-negative integers
- occupied beds are auto-capped when totals are reduced
- disabled staff accounts cannot log in

---

## API overview

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### User intake/status

- `POST /api/patients/me/intake`
- `GET /api/patients/me`

### Staff queue operations

- `GET /api/patients`
- `GET /api/patients/export.csv`
- `PATCH /api/patients/:id/lifecycle`
- `PATCH /api/patients/:id/override`

Supported patient list query params:

- `search`
- `bedType` (`icu`, `general`, `none`)
- `lifecycleStatus`
- `minUrgency`

### Capacity

- `GET /api/capacity`
- `PATCH /api/capacity`

### Staff governance

- `GET /api/staff/users` (alias: `/api/admin/users`)
- `POST /api/staff/users` (alias: `/api/admin/users`)
- `PATCH /api/staff/users/:id/active`
- `POST /api/staff/users/:id/reset-password`

---

## Run locally

**Requirements**

- Node.js 18+
- MongoDB URI in `server/.env`

### 1) Server

```bash
cd server
cp .env.example .env
# set MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

Default API: `http://localhost:5000`

Optional migration script (legacy role normalization):

```bash
npm run migrate:roles
```

### 2) Client

```bash
cd client
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Default app URL: `http://localhost:5173`

### Demo credentials (development only)

Use these for local demo/testing only:

- **Patient**
  - Email: `patient1@test.com`
  - Password: `123456`
- **Staff**
  - Email: `staff1@test.com`
  - Password: `123456`

---

## Workflow

1. `user` submits intake data.
2. Engine computes urgency score and bed suggestion.
3. Staff dashboard displays urgency-ranked queue.
4. Staff can:
   - adjust lifecycle status
   - attach notes
   - apply manual override (with reason)
5. Capacity updates and queue operations continue in real-time workflow loops.

---

## Notes and roadmap

### Current state

- single-capacity model is active
- no multi-hospital routing in the current implementation

### Possible next upgrades

- richer audit timeline (who changed what and when)
- patient assignment timelines and SLA tracking
- notifications for critical threshold breaches
- analytics dashboards for throughput and wait-time trends
