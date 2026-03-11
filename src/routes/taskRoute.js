import express from "express";
import Task    from "../models/task.js";
import Group   from "../models/Group.js";
import Notice  from "../models/Notice.js";
import { ensureAuth as authenticate, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── helpers ──────────────────────────────────────────────────────────────────
const populate = (q) =>
  q
    .populate("assignedTo", "name email role")
    .populate("createdBy",  "name email role")
    .populate("group",      "name color")
    .populate("project",    "name");

// ── GET /api/tasks  — all tasks (filtered by role) ───────────────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const { project, status, group } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status)  filter.status  = status;
    if (group)   filter.group   = group;

    // Employees only see tasks assigned to them
    if (req.user.role === "employee") {
      filter.assignedTo = req.user._id;
    }

    const tasks = await populate(Task.find(filter)).sort({ deadline: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// ── GET /api/tasks/:id ────────────────────────────────────────────────────────
// ── GET /api/tasks/project/:projectId ────────────────────────────────────────
router.get("/project/:projectId", authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const filter = { project: projectId };

    if (req.user.role === "employee") {
      filter.assignedTo = req.user._id;
    }

    const tasks = await populate(Task.find(filter)).sort({ deadline: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch project tasks" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const task = await populate(Task.findById(req.params.id));
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task" });
  }
});

// ── POST /api/tasks  — admin only creates tasks ───────────────────────────────
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { title, description, project, group, assignedTo, status, priority, deadline, tags } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (!project)       return res.status(400).json({ message: "Project is required" });

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      project,
      group:      group      || null,
      assignedTo: assignedTo || [],
      createdBy:  req.user._id,
      status:     status   || "todo",
      priority:   priority || "medium",
      deadline:   deadline ? new Date(deadline) : null,
      tags:       tags     || [],
    });

    const populated = await populate(Task.findById(task._id));
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to create task" });
  }
});

// ── PUT /api/tasks/:id  — admin can edit everything ───────────────────────────
router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { title, description, project, group, assignedTo, status, priority, deadline, tags } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title)       task.title       = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (project)     task.project     = project;
    if (group !== undefined)  task.group  = group || null;
    if (assignedTo)  task.assignedTo  = assignedTo;
    if (status)      task.status      = status;
    if (priority)    task.priority    = priority;
    if (tags)        task.tags        = tags;

    // reset deadlineNoticed if deadline changes
    if (deadline !== undefined) {
      task.deadline       = deadline ? new Date(deadline) : null;
      task.deadlineNoticed = false;
    }

    await task.save();
    const populated = await populate(Task.findById(task._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" });
  }
});

// ── PATCH /api/tasks/:id/assign  — manager assigns users to a task ───────────
router.patch("/:id/assign", authenticate, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { assignedTo, group } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (group      !== undefined) task.group      = group || null;

    await task.save();
    const populated = await populate(Task.findById(task._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to assign task" });
  }
});

// ── PATCH /api/tasks/:id/status  — assignee or admin/manager can update status
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["todo","inProgress","done"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAssignee = task.assignedTo.map(String).includes(String(req.user._id));
    const isPrivileged = ["admin","manager"].includes(req.user.role);
    if (!isAssignee && !isPrivileged)
      return res.status(403).json({ message: "Not authorised" });

    task.status = status;
    await task.save();
    const populated = await populate(Task.findById(task._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// ── DELETE /api/tasks/:id  — admin only ──────────────────────────────────────
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

// ── POST /api/tasks/deadline-check  — called by cron / scheduler ─────────────
// Automatically floats a notice for tasks whose deadline is within 48 hours
router.post("/deadline-check", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const count = await floatDeadlineNotices();
    res.json({ message: `Floated ${count} deadline notice(s)` });
  } catch (err) {
    res.status(500).json({ message: "Deadline check failed" });
  }
});

export async function floatDeadlineNotices() {
  const now       = new Date();
  const in48h     = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Find tasks with deadline in next 48h that haven't been noticed yet
  const urgentTasks = await Task.find({
    deadline:        { $gte: now, $lte: in48h },
    deadlineNoticed: false,
    status:          { $ne: "done" },
  }).populate("assignedTo", "name _id").populate("project", "name");

  let count = 0;

  for (const task of urgentTasks) {
    const hoursLeft = Math.ceil((task.deadline - now) / (1000 * 60 * 60));
    const assigneeNames = task.assignedTo.map(u => u.name).join(", ") || "Unassigned";

    // Float one notice per urgent task
    await Notice.create({
      title:        `⏰ Deadline in ${hoursLeft}h: ${task.title}`,
      body:         `Assigned to: ${assigneeNames} · Project: ${task.project?.name || "—"}`,
      icon:         "⚠️",
      type:         "alert",
      pinned:       true,
      postedBy:     task.createdBy,
      postedByName: "System",
      taskRef:      task._id,
    });

    // Mark so we don't re-notice
    task.deadlineNoticed = true;
    await task.save();
    count++;
  }

  return count;
}

export default router;