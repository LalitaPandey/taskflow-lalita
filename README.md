# TaskFlow

A task management app built with React, TypeScript, and Vite.

**Live Demo:** https://taskflow-git-main-lalitas-projects-3faede61.vercel.app

## Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Radix UI
- **Routing**: React Router v7
- **Data**: TanStack Query v5, React Hook Form, Zod
- **Backend**: json-server + json-server-auth (mock REST API with JWT)

---

## Quickstart with Docker

The fastest way to run the full app (frontend + backend) in one command:

```bash
git clone https://github.com/LalitaPandey/taskflow
cd taskflow
cp .env.example .env
docker compose up
```

App available at **http://localhost:3000**

Log in with:
- Email: `lalitapandey030@gmail.com`
- Password: `password123`

> Requires [Docker Desktop](https://www.docker.com/products/docker-desktop) to be installed and running.

---

## Running Locally (without Docker)

**Terminal 1 — API server (port 4000)**
```bash
npm run api
```

**Terminal 2 — Frontend (port 5173)**
```bash
npm run dev
```

Open `http://localhost:5173` and log in with:
- Email: `lalitapandey030@gmail.com`
- Password: `password123`

---

## Features

- JWT authentication (login / register)
- Projects list with create project
- Project detail with kanban board (To do / In progress / Done)
- Add task page — title, description, status, priority, assignee, due date
- Edit / delete tasks inline
- Filter tasks by status and assignee
- Responsive layout with left sidebar navigation

---

## Deployment

The app is split into two parts that must be deployed separately:

| Part | What it is | Where to deploy |
|---|---|---|
| Frontend | React + Vite app | Vercel |
| Backend | json-server API | Render |

---

### Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in the following settings:

| Field | Value |
|---|---|
| Name | `taskflow-api` |
| Branch | `main` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Instance Type | `Free` |

5. Click **Create Web Service**
6. Wait for the build to finish — Render will give you a URL like:
   ```
   https://taskflow-api.onrender.com
   ```
7. Copy that URL — you will need it in the next step

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up.

---

### Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project** → **Import Git Repository**
3. Select your `taskflow` repository
4. Confirm the build settings (Vercel auto-detects Vite):

| Field | Value |
|---|---|
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. Before clicking Deploy, scroll down to **Environment Variables** and add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-render-url.onrender.com` |

   Replace `https://your-render-url.onrender.com` with the actual URL from Render.

6. Click **Deploy**
7. Once deployed, Vercel gives you a live URL like:
   ```
   https://taskflow-xyz.vercel.app
   ```

---

### Update the API URL after deploying

If you deploy the backend after the frontend, or if the Render URL changes:

1. Go to **Vercel** → your project → **Settings** → **Environment Variables**
2. Update `VITE_API_URL` with the new Render URL
3. Go to **Deployments** → click **"..."** on the latest deployment → **Redeploy**

---

### Other platforms you can use for the backend

Besides Render, json-server can be deployed on any platform that runs Node.js:

| Platform | Free Tier | Notes |
|---|---|---|
| **Render** | Yes | Easiest setup, sleeps after 15 min inactivity |
| **Railway** | Yes (limited hours) | Fast deploys, no sleep |
| **Fly.io** | Yes | More control, slightly more setup |
| **Cyclic** | Yes | Simple Node.js deploys |

> Any platform that runs `node server.js` will work. Just make sure to set `VITE_API_URL` in Vercel to point to whichever backend URL you get.

---

### Environment Variables reference

**Frontend (Vercel)**

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | URL of the deployed backend API | `https://taskflow-api.onrender.com` |

If `VITE_API_URL` is not set, the frontend defaults to `http://localhost:4000` (local development).
