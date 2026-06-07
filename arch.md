



# CentriDesk — Architecture Overview

## What Is This?

CentriDesk is an **internal IT operations web app** built for Centricity WealthTech. It is a self-hosted, single-tenant SaaS-style tool that manages:

- Software subscription renewals & vendor tracking
- IT software installation request approvals (multi-section policy form)
- Internal form tracking & status workflow
- Role-based access (Admin vs. Employee)
- In-app notifications (renewal alerts, form submissions, IT requests)

---

## Service Type

| Property | Value |
|---|---|
| Type | Monolithic web application (no microservices) |
| Runtime | Node.js (Next.js 14 App Router, SSR + API routes) |
| Database | MongoDB 7 via Prisma ORM |
| Cache | Redis 7 (notification cache, TTL-based) |
| Auth | NextAuth v4 (JWT sessions, credential provider) |
| Hosting target | Single server / Docker container |

---

## Stack

```
Browser
  └── Next.js 14 (App Router)
        ├── React 18 (UI, Tailwind CSS + Radix UI)
        ├── /app/(dashboard)/*   → protected pages (role-gated)
        ├── /app/forms/*         → public-facing forms (no auth)
        └── /app/api/*           → REST API routes (Next.js Route Handlers)
              └── Prisma v5
                    └── MongoDB 7
        Redis 7 (notification cache — TTL 15s–120s)
```

---

## Key Modules

### Pages (Dashboard — auth required)
| Route | Purpose |
|---|---|
| `/dashboard` | Home / overview |
| `/subscriptions` | Vendor subscription list + renewal tracking |
| `/it-request` | Admin: request table + edit modal / Employee: submit form |
| `/tracking` | Form submission tracker |
| `/system-request` | Forms library (all available forms) |
| `/form-links` | Shareable form URL directory |
| `/admin` | User management |

### Public Pages (no auth)
| Route | Purpose |
|---|---|
| `/forms/it-request` | Software installation approval form (8 sections) |

### API Routes
| Prefix | Purpose |
|---|---|
| `/api/auth` | NextAuth sign-in / session |
| `/api/subscriptions` | CRUD for vendor subscriptions |
| `/api/notifications` | Renewal alerts (within 14 days) |
| `/api/software-request` | IT request form submit + list |
| `/api/software-request/[id]` | IT request PATCH (edit) |
| `/api/it-request-notifications` | Unread IT notification feed |
| `/api/tracking` | Form submission tracking |
| `/api/form-notifications` | Form tracking notification feed |
| `/api/admin` | User admin CRUD |

---

## Data Models (Prisma / MongoDB)

```
User
  ├── role: ADMIN | USER
  ├── FormNotification[]
  └── ITRequestNotification[]

Subscription
  └── renewalDate → drives /api/notifications

SoftwareRequest          ← IT installation approval form
  ├── sections 1-3: requester + software + justification
  ├── sections 4-5: tech review + security review (IT team)
  ├── section 6:   approval matrix (JSON)
  ├── section 7:   installation status
  ├── section 8:   employee acknowledgement
  ├── versionControl (JSON)
  └── ITRequestNotification[]

FormTracking             ← generic form submission tracker
  └── FormNotification[]
```

---

## Auth Flow

```
/login → NextAuth credentials → bcrypt password check → JWT session cookie
Session checked on every protected route via getSessionUser() helper
Role stored in JWT token → used for role-gated UI rendering
```

---

## Notification Flow

```
Form submitted (POST /api/software-request)
  → creates ITRequestNotification rows for all ADMIN users
  → NotificationBell polls every 30s
  → clicking a notif → PATCH marks read → navigate to /it-request
```

---

## Deployment Topology

```
docker-compose up
┌─────────────────────────────────────┐
│  centridesk-app  (Next.js :3000)    │
├─────────────────────────────────────┤
│  centridesk-mongo (MongoDB  :27017) │  volume: mongo_data
├─────────────────────────────────────┤
│  centridesk-redis (Redis    :6379)  │  volume: redis_data
└─────────────────────────────────────┘
```

### Redis Cache Keys
| Key | TTL | Busted when |
|---|---|---|
| `renewals:<userId\|admin>` | 120s | — (auto-expire) |
| `it-notifs:<userId>` | 15s | PATCH marks read |
| `form-notifs:<userId>` | 15s | PATCH marks read |

### Quick Start
```bash
cp .env .env.local          # set NEXTAUTH_SECRET
docker compose up --build   # starts app + mongo + redis
# first run — seed the DB
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed
```
