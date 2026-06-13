# NEXUS — Daily Habits Tracker

A full-stack personal productivity app to track daily habits, log progress, and visualize completion with real-time progress bars.

🔗 **Live Demo**: https://nexusbyraman.vercel.app
🔗 **Backend API**: https://nexus-backend-8ldw.onrender.com

> Note: Backend is hosted on Render's free tier — first request after inactivity may take ~30-50 seconds.

---

## Features

- 🔐 User authentication (signup/login with JWT)
- ✅ Create numeric habits (e.g., Sleep 8hrs, Water 3L) or binary habits (e.g., Gym, Reading)
- 📊 Daily logging with auto-calculated completion percentage
- 📈 Visual progress bars for each habit
- 🗑️ Edit and delete habits

---

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Axios, React Router
**Backend:** Node.js, Express, JWT, bcrypt
**Database:** PostgreSQL (Neon)
**Deployment:** Vercel (frontend) + Render (backend)

---

## Project Structure
NEXUS/

├── frontend/    # React + Vite app

└── backend/     # Express REST API
---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/habits` | Get all habits |
| POST | `/api/habits` | Create habit |
| PUT | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| POST | `/api/habits/:id/log` | Log today's value |
| GET | `/api/habits/:id/logs` | Get habit history |

---

## Run Locally

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Author

**Roman Thapa**
GitHub: [@ramanthapa2701](https://github.com/ramanthapa2701)