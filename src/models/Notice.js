// models/Notice.js
import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true, maxlength: 80 },
    body:      { type: String, trim: true, maxlength: 300, default: "" },
    icon:      { type: String, default: "📢" },
    postedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postedByName: { type: String },
    type:      { type: String, enum: ["notice", "update", "alert", "success"], default: "notice" },
    pinned:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);