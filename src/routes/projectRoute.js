import express from "express";
import {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
  getProjectProgress
} from "../controllers/projectController.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { ensureAuth } from "../middleware/authMiddleware.js";
import { getProjectById } from "../controllers/projectController.js";

const router = express.Router();

router.post("/", ensureAuth, allowRoles("admin"), createProject);
router.get("/", ensureAuth, getAllProjects);
router.put("/:id", ensureAuth, updateProject);
router.delete("/:id", ensureAuth, allowRoles("admin"), deleteProject);
router.get("/:id/progress", ensureAuth, getProjectProgress);
router.get("/:id", ensureAuth, getProjectById);
export default router;