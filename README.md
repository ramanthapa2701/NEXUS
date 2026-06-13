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