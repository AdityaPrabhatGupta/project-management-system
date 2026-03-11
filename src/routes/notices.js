import express from "express";
import Notice from "../models/Notice.js";
import { ensureAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ensureAuth ,async (req, res) => {
  try {
    const notices = await Notice.find()
      .sort({ pinned: -1, createdAt: -1 })
      .limit(20)
      .lean();
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notices" });
  }
});

router.post(
  "/",
  ensureAuth,
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { title, body, icon, type, pinned } = req.body;
      if (!title?.trim()) return res.status(400).json({ message: "Title is required" });

      const notice = await Notice.create({
        title: title.trim(),
        body:  body?.trim() || "",
        icon:  icon  || "📢",
        type:  type  || "notice",
        pinned: pinned || false,
        postedBy:     req.user._id,
        postedByName: req.user.name,
      });

      res.status(201).json(notice);
    } catch (err) {
      res.status(500).json({ message: "Failed to create notice" });
    }
  }
);

router.delete(
  "/:id",
  ensureAuth,
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const notice = await Notice.findById(req.params.id);
      if (!notice) return res.status(404).json({ message: "Notice not found" });

      if (
        req.user.role === "manager" &&
        notice.postedBy.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "Not authorised to delete this notice" });
      }

      await notice.deleteOne();
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete notice" });
    }
  }
);

router.patch(
  "/:id/pin",
  ensureAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const notice = await Notice.findById(req.params.id);
      if (!notice) return res.status(404).json({ message: "Not found" });
      notice.pinned = !notice.pinned;
      await notice.save();
      res.json(notice);
    } catch (err) {
      res.status(500).json({ message: "Failed to toggle pin" });
    }
  }
);

export default router;