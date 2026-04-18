# Smart Hospital Decision & Resource Allocation System

**Solution Challenge Project**

A MERN-stack app (**MongoDB**, **Express**, **React**, **Node.js**) for intelligent prioritization and hospital resource allocation—not a simple FIFO queue.

---

## Contents

- [Project overview](#project-overview)
- [Tech stack & layout](#tech-stack--layout)
- [Users, roles, login & sign-up](#users-roles-login--sign-up)
- [Run locally](#run-locally)
- [Core objectives & features](#core-objectives--features)
- [System workflow](#system-workflow)
- [Impact & future scope](#impact--future-scope)

---

## Project overview

This project is a **real-time decision system** that optimizes how hospitals prioritize patients and use limited resources.

Traditional tools often use static, first-come-first-served queues and ignore urgency and live capacity. That can delay critical cases and waste beds.

This system uses a **dynamic decision engine** that continuously weighs patient severity and hospital capacity.

**This is not a queue manager.**  
**It is a decision engine for prioritization and allocation.**

---

## Tech stack & layout

| Layer    | Location        | Notes                          |
| -------- | --------------- | ------------------------------ |
| API      | `server/`       | Express, JWT, Mongoose         |
| Frontend | `client/`       | Vite, React, React Router      |

```
solution-challenge/
├── client/src/          # pages, components, lib/api.js
├── server/src/          # routes, controllers, services, models, engine/
├── client/.env.example  # VITE_API_URL
└── server/.env.example  # PORT, MONGODB_URI, JWT_SECRET
```

---

## Users, roles, login & sign-up

### How many kinds of users?

The database supports **three roles**:

| Role       | Purpose |
| ---------- | ------- |
| **patient** | Submit symptoms, see status / token / queue-related data |
| **staff**   | Operate one hospital: patient list, bed counts |
| **admin**   | Broader access (e.g. all hospitals in the API) |

There is **one shared login** (`POST /api/auth/login`). The **JWT** stores `role` and, for staff, `hospitalId`. The API enforces **RBAC** (e.g. patient-only routes vs staff/admin routes).

### Who can sign up on the website?

**Only patients.**

- The **Sign up** page calls `POST /api/auth/register`.
- That endpoint **always** creates a user with role **`patient`**.
- You can have **many patient accounts** (each needs a unique email and password).

### How do staff or admin accounts exist?

They are **not** created through the public sign-up flow.

Create them **in MongoDB** (manual insert, script, or a future “admin creates user” feature):

- Set `role` to `staff` or `admin`.
- For **staff**, set **`hospitalId`** to a real hospital document’s `_id`. Without it, hospital/dashboard APIs may return **403** or empty data.

### Summary

| Role    | Typical creation |
| ------- | ---------------- |
| Patient | **Sign up** in the app (or insert in DB) |
| Staff   | **Insert/seed** in DB + `hospitalId` |
| Admin   | **Insert/seed** in DB |

After any account exists, use **Log in** with that email and password; the app redirects by role (e.g. patient → portal, staff/admin → dashboard).

---

## Run locally

**Requirements:** Node.js 18+, MongoDB (optional for API start; DB features need `MONGODB_URI`).

1. **Server**

   ```bash
   cd server
   cp .env.example .env
   # Edit .env: MONGODB_URI, JWT_SECRET
   npm install
   npm run dev
   ```

   API default: `http://localhost:5000` — health: `GET /api/health`

2. **Client**

   ```bash
   cd client
   cp .env.example .env
   # VITE_API_URL=http://localhost:5000/api
   npm install
   npm run dev
   ```

   App default: `http://localhost:5173`

---

## Core objectives & features

### Core objectives

- Prioritize by **urgency**, not only arrival time  
- Allocate resources **efficiently and fairly**  
- Keep decisions **consistent and explainable**  

### Key functionalities

1. **Intelligent priority engine** — Severity, waiting time, resource pressure, optional AI-assisted urgency, explainable output  
2. **Smart bed allocation** — ICU / general, condition + availability, avoid over-allocation  
3. **Dynamic queue** — Non-FIFO ordering, emergency rules, reshuffling as state changes  
4. **Live analytics (minimal)** — Bed/ICU load, basic flow, simple response-time style metrics  
5. **User & patient management** — Profiles, symptoms, **RBAC**  
6. **Lightweight tokens** — Patient token id, queue tracking  

### Role capabilities (product view)

- **Patient:** submit symptoms and details; view priority status, assigned hospital, queue-related status  
- **Staff:** manage queue context, update bed availability, view decisions (as implemented in API/UI)  
- **Admin (evolving):** system-wide configuration and monitoring (roadmap)  

---

## System workflow

1. Patient enters data (symptoms and details)  
2. System calculates **priority score**  
3. Patient enters the **dynamic priority queue**  
4. System assigns **hospital** and **bed** (ICU / general) where applicable  
5. System **updates continuously** as patients, conditions, and resources change  

---

## Key advantages

- Real-time adaptability  
- Fairer, optimized prioritization  
- Less manual sorting under pressure  
- Transparent, explainable rules  
- Scalable to multiple hospitals  

---

## Impact & future scope

### Potential impact

- Faster help for critical patients  
- Better use of beds and ICU capacity  
- More consistent decisions under load  

### Future scope

- Overload prediction  
- Multi-hospital / multi-city rollout  
- AI-based demand forecasting  

---

## Conclusion

This project moves healthcare workflow from **static and reactive** to **dynamic and intelligent**, so the right patient gets the right level of care with clearer, data-driven prioritization.
