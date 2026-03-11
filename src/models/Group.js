// src/models/Group.js
import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, maxlength: 80 },
    project:     { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    members:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, trim: true, maxlength: 300, default: "" },
    color:       { type: String, default: "#8b5cf6" }, // display colour for UI
  },
  { timestamps: true }
);

export default mongoose.models.Group || mongoose.model("Group", GroupSchema);