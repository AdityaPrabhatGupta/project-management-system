import { Project } from "../models/project.js";
import Task from "../models/task.js";

export const createProject = async (req, res) => {
  try {
    const { title, description, status, members, priority, deadline } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,   // ← from auth middleware, not req.body
      status,
      members,
      priority,
      deadline,
    });

    return res.status(201).json({ message: "Project Created Successfully", project });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("createdBy", "name email")
      .populate("members",   "name email")   // ← was "assignedTo" (doesn't exist)
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "Projects Fetched Successfully", projects });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("createdBy", "name email")
      .populate("members",   "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });

    return res.status(200).json({ message: "Project fetched successfully", project });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, members, priority, deadline } = req.body;

    const updateData = {};
    if (title       !== undefined) updateData.title       = title;
    if (description !== undefined) updateData.description = description;
    if (status      !== undefined) updateData.status      = status;
    if (members     !== undefined) updateData.members     = members;
    if (priority    !== undefined) updateData.priority    = priority;
    if (deadline    !== undefined) updateData.deadline    = deadline;

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, { new: true })
      .populate("createdBy", "name email")
      .populate("members",   "name email");

    if (!updatedProject) return res.status(404).json({ message: "Project not found" });

    return res.status(200).json({ message: "Project updated successfully", updatedProject });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Project not found" });
    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getProjectProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const totalTasks     = await Task.countDocuments({ project: id });
    const completedTasks = await Task.countDocuments({ project: id, status: "done" });
    const progress = totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;
    return res.status(200).json({ totalTasks, completedTasks, progress: `${progress}%` });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};