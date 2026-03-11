import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", ensureAuth, getDashboardStats);

export default router;