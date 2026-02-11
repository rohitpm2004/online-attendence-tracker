import Attendance from "../models/Attendance.js";
import Class from "../models/Class.js";
import Branch from "../models/Branch.js";
import mongoose from "mongoose";
import { sendLowAttendanceMail } from "./mailer.js";

export const checkLowAttendance = async () => {
  console.log("🔍 Running low attendance scan...");

  // get all branches
  const branches = await Branch.find();

  for (const branch of branches) {

    const classes = await Class.find({ branch: branch._id });

    if (classes.length === 0) continue;

    const classIds = classes.map(c => c._id);

    // total class count
    const totalClasses = classes.length;

    // get attendance
    const attendance = await Attendance.find({
      class: { $in: classIds }
    }).populate("student");

    const map = {};

    attendance.forEach(a => {
      const s = a.student;
      if (!s) return;

      if (!map[s.email]) {
        map[s.email] = {
          name: s.fullName,
          email: s.email,
          attended: 1
        };
      } else {
        map[s.email].attended += 1;
      }
    });

    // calculate %
    for (const email in map) {
      const student = map[email];
      const percentage = Math.round((student.attended / totalClasses) * 100);

      if (percentage < 60) {
        await sendLowAttendanceMail(
          student.email,
          student.name,
          percentage,
          branch.name
        );
      }
    }
  }

  console.log("✅ Attendance scan complete");
};
