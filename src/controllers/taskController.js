import Task from "../models/task.js";
import { Project } from "../models/project.js";
import { User } from "../models/user.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, createdBy, project, teamMembers } = req.body;

    if (!title || !createdBy || !project) {
      return res.status(400).json({
        message: "Title, createdBy and project ID are required"
      });
    }

    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const user = await User.findById(createdBy);

    if (!user) {
      return res.status(404).json({
        message: "Creator user not found"
      });
    }

    const task = await Task.create({
      title,
      description,
      createdBy,
      project,
      teamMembers
    });

    return res.status(201).json({
      message: "Task assigned to project successfully",
      task
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};


export const getAllTasks = async (req, res) => {
  try {

    const tasks = await Task.find()
      .populate("createdBy", "name email")
      .populate("teamMembers", "name email")
      .populate("project", "title description");

    return res.status(200).json({
      message: "Tasks Fetched Successfully",
      tasks
    });

  } catch (error) {

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });

  }
};


export const updateTask = async (req, res) => {
  try {

    const { id } = req.params;
    const body = req.body;

    const allowedFields = ["title", "description", "teamMembers"];

    const updateData = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("teamMembers", "name email")
      .populate("project", "title");

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    return res.status(200).json({
      message: "Task Updated Successfully",
      updatedTask
    });

  } catch (error) {

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });

  }
};

export const deleteTask = async (req, res) => {
  try {

    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    return res.status(200).json({
      message: "Task Deleted Successfully"
    });

  } catch (error) {

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });

  }
};


export const getTasksByProject = async (req, res) => {
  try {

    const { projectId } = req.params;

    const tasks = await Task.find({ project: projectId })
      .populate("createdBy", "name email")
      .populate("teamMembers", "name email")
      .populate("project", "title");

    return res.status(200).json({
      message: "Project Tasks Fetched Successfully",
      tasks
    });

  } catch (error) {

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });

  }
};

export const getMyTasks = async (req, res) => {
  try {

    const userId = req.user._id;

    const tasks = await Task.find({
      teamMembers: userId
    })
      .populate("project", "title")
      .populate("createdBy", "name email");

    return res.status(200).json({
      message: "User tasks fetched successfully",
      tasks
    });

  } catch (error) {

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });

  }
};
export const filterTasks = async (req, res) => {
  try {

    const { status, project } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (project) {
      filter.project = project;
    }

    const tasks = await Task.find(filter)
      .populate("createdBy", "name email")
      .populate("teamMembers", "name email")
      .populate("project", "title");

    return res.status(200).json({
      message: "Filtered tasks fetched successfully",
      tasks
    });

  } catch (error) {

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });

  }
};
export const updateTaskStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["todo", "in-progress", "done"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value"
      });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
    .populate("createdBy", "name email")
    .populate("teamMembers", "name email")
    .populate("project", "title");

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    return res.status(200).json({
      message: "Task status updated successfully",
      task
    });

  } catch (error) {

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });

  }
};
