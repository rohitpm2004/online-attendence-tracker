import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    classCode: {
      type: String,
      unique: true,
      required: true
    },

    meetLink: {
      type: String,
      required: true
    },

    // 🔴 NEW — VERY IMPORTANT
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);
