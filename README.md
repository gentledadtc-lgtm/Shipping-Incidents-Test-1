# INCIDENTS - Test 1

A full-stack shipping incident reporting web application built with React, Node.js/Express, and SQLite.

## Tech Stack

- **Frontend:** React 18 + Vite + React Router v6
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`)

## Features

- **Dashboard** — Overview with incident statistics and recent activity
- **Incident History** — Searchable, filterable table of all reported incidents
- **Report New Incident** — Form to submit a new shipping incident
- **Incident Details** — Full detail view for any incident
- **Edit / Delete** — Update or remove existing incidents
- **Filters** — Filter by severity, status, incident type, and date range
- **Persistent Storage** — All data stored in a local SQLite database with seed data included

## Project Structure

```
shipping-incidents-test-1/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── db/
│   │   │   └── database.js   # SQLite setup + seed data
│   │   ├── routes/
│   │   │   └── incidents.js  # CRUD routes
│   │   └── server.js         # Express entry point
│   ├── .env.example
│   └── package.json
├── frontend/                 # React application
│   ├── src/
│   │   ├── api/
│   │   │   └── incidents.js  # API helper functions
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── IncidentDetail.jsx
│   │   │   ├── IncidentForm.jsx
│   │   │   ├── IncidentList.jsx
│   │   │   └── Navbar.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json              # Root — runs both servers
└── README.md
```

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd shipping-incidents-test-1
```

### 2. Install all dependencies

Install root dependencies and both backend and frontend packages in one command:

```bash
npm install
npm run install:all
```

Or install each separately:

```bash
# Root (concurrently)
npm install

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

## Running the Application

### Development mode (recommended)

From the project root, run both servers concurrently:

```bash
npm run dev
```

This starts:
- **Backend API** at `http://localhost:3001`
- **Frontend Dev Server** at `http://localhost:5173`

Open your browser to **http://localhost:5173**

### Run servers separately

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/incidents` | List all incidents (supports filters) |
| GET | `/api/incidents/stats` | Get dashboard statistics |
| GET | `/api/incidents/:id` | Get a single incident |
| POST | `/api/incidents` | Create a new incident |
| PUT | `/api/incidents/:id` | Update an incident |
| DELETE | `/api/incidents/:id` | Delete an incident |

### Filter Query Parameters

`GET /api/incidents?search=&severity=&status=&incident_type=&date_from=&date_to=`

## Database

The SQLite database is created automatically at `backend/data/incidents.db` on first run.
Ten sample incidents are seeded automatically when the database is empty.

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust as needed:

```bash
cp backend/.env.example backend/.env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
