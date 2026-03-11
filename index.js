import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import noticeRoutes from "./src/routes/notices.js"; 
import userRoutes from "./src/routes/userRoute.js";
import projectRoutes from "./src/routes/projectRoute.js";
import taskRoutes from "./src/routes/taskRoute.js";
import dashboardRoutes from "./src/routes/dashboardRoute.js";

import { initialiseDatabase } from "./src/config/index.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

app.use(express.json());

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notices", noticeRoutes);
initialiseDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Started on port ${PORT}`);
});