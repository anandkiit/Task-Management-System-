# TaskFlow — Task Management System

A production-ready full-stack Task Management System built with **Node.js + TypeScript** (Backend) and **Next.js + TypeScript** (Frontend).

---

## 📁 Project Structure

```
task-management/
├── backend/                  # Node.js + TypeScript API
│   ├── prisma/
│   │   └── schema.prisma     # Database schema (SQLite/PostgreSQL)
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   └── task.controller.ts
│   │   ├── middleware/       # Auth + Validation middleware
│   │   │   ├── auth.ts
│   │   │   └── validate.ts
│   │   ├── routes/           # Express route definitions
│   │   │   ├── auth.routes.ts
│   │   │   └── task.routes.ts
│   │   ├── types/            # TypeScript types & interfaces
│   │   │   └── index.ts
│   │   ├── utils/            # JWT helpers, response helpers
│   │   │   ├── jwt.ts
│   │   │   └── response.ts
│   │   └── index.ts          # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                 # Next.js 14 App Router
    ├── src/
    │   ├── app/
    │   │   ├── auth/
    │   │   │   ├── login/page.tsx
    │   │   │   └── register/page.tsx
    │   │   ├── dashboard/
    │   │   │   ├── layout.tsx    # Protected layout with sidebar
    │   │   │   └── page.tsx      # Main dashboard
    │   │   ├── globals.css
    │   │   ├── layout.tsx
    │   │   ├── page.tsx          # Redirect handler
    │   │   └── providers.tsx     # React Query + Auth + Toast
    │   ├── components/
    │   │   ├── ui/index.tsx      # Badge, Spinner, StatCard, EmptyState
    │   │   ├── TaskCard.tsx      # Individual task with actions menu
    │   │   └── TaskModal.tsx     # Create / Edit modal
    │   ├── hooks/
    │   │   ├── useAuth.tsx       # Auth context + provider
    │   │   ├── useDebounce.ts    # Debounce for search
    │   │   └── useTasks.ts       # React Query task hooks
    │   ├── lib/
    │   │   ├── api.ts            # Axios instance + token refresh interceptor
    │   │   ├── auth.service.ts   # Auth API calls + localStorage
    │   │   └── task.service.ts   # Task CRUD API calls
    │   └── types/
    │       └── index.ts          # Shared TypeScript types
    ├── .env.local.example
    ├── next.config.js
    ├── tailwind.config.js
    └── tsconfig.json
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env if needed (defaults work out of the box with SQLite)

# Generate Prisma client + create DB
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

The API will be running at **http://localhost:5000**

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api (already set)

# Start development server
npm run dev
```

The app will be running at **http://localhost:3000**

---

## 🔑 API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register a new user |
| POST | `/auth/login` | ❌ | Login and get tokens |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout (revoke refresh token) |
| GET | `/auth/me` | ✅ | Get current user info |

#### Register
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Refresh Token
```json
POST /api/auth/refresh
{
  "refreshToken": "<refresh_token>"
}
```

---

### Tasks — `/api/tasks`

All task endpoints require `Authorization: Bearer <accessToken>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks (paginated, filterable, searchable) |
| POST | `/tasks` | Create a new task |
| GET | `/tasks/stats` | Get task statistics |
| GET | `/tasks/:id` | Get single task |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/toggle` | Cycle task status (Pending → In Progress → Completed → Pending) |

#### GET /tasks Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 50) |
| `status` | string | Filter: `PENDING` / `IN_PROGRESS` / `COMPLETED` |
| `priority` | string | Filter: `LOW` / `MEDIUM` / `HIGH` |
| `search` | string | Search by task title |
| `sortBy` | string | `createdAt` / `updatedAt` / `dueDate` / `title` |
| `sortOrder` | string | `asc` / `desc` |

#### Create / Update Task Body
```json
{
  "title": "Write unit tests",
  "description": "Cover auth and task controllers",
  "priority": "HIGH",
  "dueDate": "2024-12-31"
}
```

---

## 🏗️ Architecture & Technical Decisions

### Backend

| Feature | Technology | Why |
|---------|------------|-----|
| Runtime | Node.js + TypeScript | Type safety, fast dev experience |
| Framework | Express.js | Lightweight, well-understood |
| ORM | Prisma | Type-safe DB access, easy migrations |
| Database | SQLite (dev) / PostgreSQL (prod) | SQLite for zero-setup dev |
| Auth | JWT (Access + Refresh) | Stateless, scalable |
| Password | bcrypt (12 rounds) | Industry standard |
| Validation | express-validator | Per-route input validation |
| Security | helmet, cors, rate-limit | Defense-in-depth |

### Token Strategy
- **Access Token**: Short-lived (15 min), stateless JWT — used for all API calls
- **Refresh Token**: Long-lived (7 days), stored in DB for revocation — used only to get new access tokens
- **Rotation**: Each refresh issues a new refresh token and invalidates the old one

### Frontend

| Feature | Technology |
|---------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Server State | TanStack React Query |
| Forms | React Hook Form + Zod |
| HTTP | Axios with interceptor for auto token refresh |
| Notifications | react-hot-toast |

### Token Refresh Flow (Frontend)
1. Request fails with 401
2. Axios interceptor catches it, queues any other failing requests
3. Posts to `/auth/refresh` with stored refresh token
4. On success: saves new tokens, retries all queued requests
5. On failure: clears storage, redirects to login

---

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT access tokens (15 min expiry)
- ✅ JWT refresh token rotation (invalidated on use)
- ✅ Rate limiting on all routes (100/15min) and auth routes (10/15min)
- ✅ HTTP security headers via Helmet
- ✅ CORS restricted to frontend URL
- ✅ Input validation + sanitization on all endpoints
- ✅ Tasks are user-scoped (users can only access their own tasks)
- ✅ SQL injection prevention via Prisma ORM

---

## 🗄️ Database Schema

```
User
  id          UUID (PK)
  email       String (unique)
  name        String
  password    String (bcrypt hashed)
  createdAt   DateTime
  updatedAt   DateTime

Task
  id          UUID (PK)
  title       String
  description String?
  status      PENDING | IN_PROGRESS | COMPLETED
  priority    LOW | MEDIUM | HIGH
  dueDate     DateTime?
  createdAt   DateTime
  updatedAt   DateTime
  userId      UUID (FK → User)

RefreshToken
  id          UUID (PK)
  token       String (unique)
  userId      UUID (FK → User)
  expiresAt   DateTime
  createdAt   DateTime
```

---

## 🌍 Production Deployment

### Switch to PostgreSQL

Update `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/taskflow"
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Run migration:
```bash
npx prisma migrate deploy
```

### Environment Variables (Production)

```env
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=<long-random-secret-256bit>
JWT_REFRESH_SECRET=<different-long-random-secret-256bit>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

---

## 📋 Assessment Checklist

### ✅ Part 1: Backend API (Node.js + TypeScript)

- [x] User Registration (`POST /auth/register`)
- [x] User Login (`POST /auth/login`)
- [x] User Logout (`POST /auth/logout`)
- [x] JWT Access Token (15 min expiry)
- [x] JWT Refresh Token (7 day, with rotation)
- [x] Password hashing with bcrypt
- [x] Task CRUD: `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id`
- [x] Task toggle: `PATCH /tasks/:id/toggle`
- [x] Pagination on `GET /tasks`
- [x] Filtering by status on `GET /tasks`
- [x] Search by title on `GET /tasks`
- [x] TypeScript throughout
- [x] Prisma ORM
- [x] Validation with proper HTTP status codes (400, 401, 404, 409)

### ✅ Part 2: Track A — Web Frontend (Next.js)

- [x] Login page
- [x] Registration page
- [x] Access token storage + Refresh token auto-refresh
- [x] Task list dashboard
- [x] Filtering by status
- [x] Search by title
- [x] Responsive design (mobile + desktop)
- [x] Create task UI + form
- [x] Edit task UI + form
- [x] Delete task with confirmation
- [x] Toggle task status
- [x] Toast notifications for all operations
