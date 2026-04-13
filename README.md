# TaskFlow

A task management app built with React, TypeScript, and Vite.

**Live Demo:** https://taskflow-git-main-lalitas-projects-3faede61.vercel.app

## Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Radix UI
- **Routing**: React Router v7
- **Data fetching**: TanStack Query v5
- **Forms**: React Hook Form + Zod validation
- **Backend**: json-server + json-server-auth (mock REST API with JWT)

---

## Quickstart with Docker

```bash
git clone https://github.com/LalitaPandey/taskflow
cd taskflow
cp .env.example .env
docker compose up
```

App available at **http://localhost:3000**

Log in with:
- Email: `test@example.com`
- Password: `password123`

> Requires [Docker Desktop](https://www.docker.com/products/docker-desktop) to be installed and running.

---

## Running Locally (without Docker)

**Terminal 1 — API server (port 4000)**
```bash
npm install
npm run api
```

**Terminal 2 — Frontend (port 3000)**
```bash
npm run dev
```

Open `http://localhost:3000` and log in with the seed credentials above.

---

## Features

- JWT authentication (login / register)
- Projects list with create project
- Project detail with kanban board (To do / In progress / Done)
- Add / edit / delete tasks with title, description, status, priority, assignee, due date
- Filter tasks by status and assignee
- Responsive layout with sidebar navigation
- Loading, error, and empty states throughout

---

## Architecture

The app is a single monorepo. Frontend and backend run as separate processes (or Docker services) and communicate over HTTP.

```
taskflow/
├── src/                  # React frontend (Vite)
│   ├── components/       # Reusable UI components (shadcn/Radix primitives)
│   ├── pages/            # Route-level page components
│   ├── hooks/            # Data-fetching hooks (TanStack Query)
│   ├── lib/              # Axios client, utils
│   └── types/            # Shared TypeScript types
├── server.js             # json-server + json-server-auth entry point
├── db.json               # Seed data (acts as the database)
├── Dockerfile            # Frontend container (Vite dev server)
├── Dockerfile.api        # Backend container (Node / json-server)
└── docker-compose.yml    # Wires both services together
```

**Why json-server?** It gives a real REST API with auth, CRUD, and filtering with zero backend boilerplate — right for a frontend-focused project where the API shape matters but the persistence layer does not.

**State management**: Server state lives in TanStack Query (caching, invalidation, loading states). No global client state store was needed — component-local state covers UI concerns like modals and filters.

**Component structure**: Pages own data fetching via custom hooks. UI components are presentational and receive data as props, keeping them testable and reusable.

---

## What's Missing / Known Limitations

- **No pagination** — all projects and tasks are fetched in a single request. This would need cursor-based pagination for large datasets.
- **No real database** — `db.json` is ephemeral inside Docker. Data resets on container rebuild. A production version would use PostgreSQL or SQLite with migrations.
- **No tests** — unit and integration tests were not added in this scope.
- **JWT secret is library-managed** — json-server-auth uses an internal fixed secret. A production API would use a configurable secret via environment variable.
- **No drag-and-drop** — kanban columns are visual only; task status is updated via the edit form.
- **Single user** — multi-user collaboration (assigning tasks across users) is partially wired in the data model but not fully built out in the UI.

---

## Environment Variables

Copy `.env.example` to `.env` before running locally or with Docker.

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000` |

---

## Deployment

| Part | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-detected Vite config |
| Backend | Render | `node server.js`, free tier sleeps after 15 min |

Set `VITE_API_URL` in Vercel environment variables to point to your Render backend URL.
