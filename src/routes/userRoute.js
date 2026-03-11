import express from "express";
import {
  createUser,
  getAllUsers,
  loginUser,
  deleteUser,
  updateUserRole,
  getMe,
} from "../controllers/userController.js";

import { ensureAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login",    loginUser);
router.get("/me",        ensureAuth, getMe);
router.get("/",          ensureAuth, getAllUsers);
router.put("/:id/role",  ensureAuth, allowRoles("admin"), updateUserRole);
router.delete("/:id",    ensureAuth, allowRoles("admin"), deleteUser);

export default router;