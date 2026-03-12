# 🗂️ Project Management System

A full-stack project management app with Kanban task board, real-time progress tracking, and role-based access control.

🔗 **Live Demo:** [project-management-system-2026.netlify.app](https://project-management-system-2026.netlify.app)

---

## ✨ Features

- 📊 Dashboard with live stats
- 🗂️ Create, edit & manage projects
- ✅ Kanban board — Todo → In Progress → Done
- 📈 Real-time progress bar
- 🔔 Team notice board
- 👤 Role-based access (Admin / Manager / Member)
- 🔐 JWT Authentication
- 📱 Fully responsive UI

---

## 🛠️ Tech Stack

**Frontend:** React.js, React Router, Axios  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Auth:** JWT, bcryptjs  
**Deployment:** Netlify (frontend), Render (backend)

---

## 🚀 Setup

```bash
# Clone
git clone https://github.com/your-username/project-management-system.git

# Backend
cd project-management-backend
npm install
# Create .env with MONGO_URI and JWT_SECRET
npm run dev

# Frontend
cd project-management-frontend
npm install
npm run dev
```

---

## 🔐 Roles

| Feature | Admin | Manager | Member |
|---------|-------|---------|--------|
| Create/Delete Project | ✅ | ❌ | ❌ |
| Create Task | ✅ | ✅ | ❌ |
| Update Task Status | ✅ | ✅ | ✅ |
| Float Notice | ✅ | ✅ | ❌ |

---

## 🙋‍♂️ Author

**Aditya Gupta** — B.Tech CSE  
⭐ Star this repo if it helped you!
