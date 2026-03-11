import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import Task from "../models/task.js";

export const getDashboardStats = async (req, res) => {
  try {

    const totalUsers = await User.countDocuments();

    const totalProjects = await Project.countDocuments();

    const totalTasks = await Task.countDocuments();

    const completedTasks = await Task.countDocuments({
      status: "done"
    });

    const pendingTasks = await Task.countDocuments({
      status: { $ne: "done" }
    });

    return res.status(200).json({
      totalUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks
    });

  } catch (error) {

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });

  }
};