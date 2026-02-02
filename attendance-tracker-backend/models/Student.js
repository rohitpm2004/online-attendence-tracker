import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    group: {
      type: String,
      required: true
    },
    college: { 
      type: String,
      required: true
    },
    attendanceCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);


export default mongoose.model("Student", studentSchema);
