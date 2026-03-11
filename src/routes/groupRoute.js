import express from "express";
import Group   from "../models/Group.js";
import { ensureAuth as authenticate, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

const populate = (q) =>
  q
    .populate("members",   "name email role")
    .populate("createdBy", "name email")
    .populate("project",   "name");

// ── GET /api/groups?project=<id> ─────────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    const groups = await populate(Group.find(filter)).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch groups" });
  }
});

// ── POST /api/groups  — admin or manager ─────────────────────────────────────
router.post("/", authenticate, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { name, project, members, description, color } = req.body;
    if (!name?.trim())  return res.status(400).json({ message: "Name is required" });
    if (!project)       return res.status(400).json({ message: "Project is required" });

    const group = await Group.create({
      name:        name.trim(),
      project,
      members:     members     || [],
      description: description || "",
      color:       color       || "#8b5cf6",
      createdBy:   req.user._id,
    });

    const populated = await populate(Group.findById(group._id));
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to create group" });
  }
});

// ── PUT /api/groups/:id  — admin or manager ───────────────────────────────────
router.put("/:id", authenticate, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { name, members, description, color } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (name)        group.name        = name.trim();
    if (description !== undefined) group.description = description;
    if (color)       group.color       = color;
    if (members)     group.members     = members;

    await group.save();
    const populated = await populate(Group.findById(group._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update group" });
  }
});

// ── PATCH /api/groups/:id/members  — add or remove a member ──────────────────
router.patch("/:id/members", authenticate, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { userId, action } = req.body; // action: "add" | "remove"
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (action === "add" && !group.members.map(String).includes(String(userId))) {
      group.members.push(userId);
    } else if (action === "remove") {
      group.members = group.members.filter(m => String(m) !== String(userId));
    }

    await group.save();
    const populated = await populate(Group.findById(group._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update members" });
  }
});

// ── DELETE /api/groups/:id  — admin only ─────────────────────────────────────
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete group" });
  }
});

export default router;