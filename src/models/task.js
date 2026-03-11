// src/models/Task.js
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    project:     { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    group:       { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    assignedTo:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status:      { type: String, enum: ["todo", "inProgress", "done"], default: "todo" },
    priority:    { type: String, enum: ["low", "medium", "high"], default: "medium" },
    deadline:    { type: Date },
    deadlineNoticed: { type: Boolean, default: false }, // tracks if 2-day notice was floated
    tags:        [{ type: String, trim: true }],
  },
  { timestamps: true }
);

TaskSchema.index({ deadline: 1, deadlineNoticed: 1 });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);