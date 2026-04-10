# 📁 Dynamic Attendance Management System — Project Structure

```
attendance-system/
│
├── 📁 frontend/                    # React + Vite + Tailwind (Client Side)
│   ├── src/
│   │   ├── AttendanceTracker.jsx   ← MAIN COMPONENT (yahan sab kuch hai)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── 📁 backend/                     # Node.js + Express + MongoDB (Server Side)
│   ├── models/
│   │   ├── Attendance.js           ← SCHEMA + 75% LOGIC (yahan formula hai)
│   │   └── User.js                 ← Student/Teacher/Admin model
│   ├── routes/
│   │   ├── attendance.js           ← GET /attendance/:id, POST /mark-attendance
│   │   └── auth.js                 ← Login/Register + JWT
│   ├── middleware/
│   │   └── auth.js                 ← JWT verify middleware
│   ├── .env                        ← MONGO_URI, JWT_SECRET (git ignore karo!)
│   ├── server.js                   ← Express app entry point
│   └── package.json
│
└── README.md
```

## 🚀 Setup Instructions

### Backend
```bash
cd backend
npm install express mongoose jsonwebtoken bcryptjs cors dotenv
cp .env.example .env   # MONGO_URI aur JWT_SECRET fill karo
node server.js
```

### Frontend
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm run dev
```

## 🔑 .env file (backend)
```
MONGO_URI=mongodb://localhost:27017/attendance_db
JWT_SECRET=apna_secret_yahan_likho_koi_bhi
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## 📡 API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | All | Login + JWT token |
| POST | `/api/auth/register` | Admin | Naaya user banao |
| GET | `/api/attendance/:studentId` | All | Student ka summary |
| POST | `/api/attendance/mark-attendance` | Teacher/Admin | Class mark karo |
| GET | `/api/attendance/class/:subject/:sem` | Teacher/Admin | Puri class ka data |

## 🧮 75% Formula (backend/models/Attendance.js)
```js
// Present = 1 credit, Late = 0.5, Absent = 0
const percentage = (classesAttended / totalClasses) * 100;
isBelowThreshold = percentage < 75;  // ← Yahi sab kuch decide karta hai!
```
