// import Class from "../models/Class.js";
// import Attendance from "../models/Attendance.js";
// import mongoose from "mongoose";
// import Branch from "../models/Branch.js";
 

// export const getBranchAnalytics = async (req, res) => {
//   try {
//     const { branchId } = req.params;
//     const teacherId = req.user._id;

//     /* ================= GET CLASSES ================= */

//     const classes = await Class.find({
//       branch: branchId,
//       teacher: teacherId
//     });

//     const classIds = classes.map(c => c._id);

//     /* ================= ATTENDANCE ================= */

//     const attendance = await Attendance.find({
//       class: { $in: classIds }
//     }).populate("student", "college");

//     const uniqueStudents = new Set();
//     const collegeMap = {};
//     const classJoinCount = {};
//     const dailyTrend = {};

//     attendance.forEach(a => {

//       // unique students
//       uniqueStudents.add(a.student._id.toString());

//       // college stats
//       const college = a.student?.college || "Unknown";
//       collegeMap[college] = (collegeMap[college] || 0) + 1;

//       // class activity
//       const classId = a.class.toString();
//       classJoinCount[classId] = (classJoinCount[classId] || 0) + 1;

//       // daily trend
//       const day = a.createdAt.toISOString().split("T")[0];
//       dailyTrend[day] = (dailyTrend[day] || 0) + 1;
//     });

//     /* ================= TOP COLLEGE ================= */

//     let topCollege = null;
//     let max = 0;

//     for (const c in collegeMap) {
//       if (collegeMap[c] > max) {
//         max = collegeMap[c];
//         topCollege = c;
//       }
//     }

//     /* ================= MOST ACTIVE CLASS ================= */

//     let activeClassId = null;
//     let activeMax = 0;

//     for (const cid in classJoinCount) {
//       if (classJoinCount[cid] > activeMax) {
//         activeMax = classJoinCount[cid];
//         activeClassId = cid;
//       }
//     }

//     const activeClass = classes.find(c => c._id.toString() === activeClassId);

//     /* ================= FORMAT COLLEGE PIE ================= */

//     const collegeStats = Object.keys(collegeMap).map(college => ({
//       college,
//       students: collegeMap[college]
//     }));

//     /* ================= FORMAT DAILY TREND ================= */

//     const trend = Object.keys(dailyTrend)
//       .sort()
//       .map(date => ({
//         date,
//         joins: dailyTrend[date]
//       }));

//     /* ================= RESPONSE ================= */

//     res.json({
//       branchName: classes[0]?.branch.name || "Branch",
//       totalClasses: classes.length,
//       totalStudents: uniqueStudents.size,
//       totalJoinings: attendance.length,

//       collegeStats,

//       topCollege,
//       mostActiveClass: activeClass?.className || "N/A",

//       dailyTrend: trend
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Analytics error" });
//   }
// };

import Class from "../models/Class.js";
import Attendance from "../models/Attendance.js";
import Branch from "../models/Branch.js";

export const getBranchAnalytics = async (req, res) => {
  try {
    const { branchId } = req.params;
    const teacherId = req.user._id;

    /* ================= GET BRANCH NAME ================= */

    const branch = await Branch.findById(branchId).select("name");

    /* ================= GET CLASSES ================= */

    const classes = await Class.find({
      branch: branchId,
      teacher: teacherId
    });

    const classIds = classes.map(c => c._id);

    if (classIds.length === 0) {
      return res.json({
        branchName: branch?.name || "Branch",
        totalClasses: 0,
        totalStudents: 0,
        totalJoinings: 0,
        collegeStats: [],
        topCollege: null,
        mostActiveClass: null,
        dailyTrend: []
      });
    }

    /* ================= ATTENDANCE ================= */

    const attendance = await Attendance.find({
      class: { $in: classIds }
    }).populate("student", "college");

    const uniqueStudents = new Set();
    const collegeStudentMap = {}; // ⭐ UNIQUE STUDENTS PER COLLEGE
    const classJoinCount = {};
    const dailyTrend = {};

    attendance.forEach(a => {

      if (!a.student) return;

      const studentId = a.student._id.toString();
      uniqueStudents.add(studentId);

      /* ===== UNIQUE COLLEGE STUDENTS ===== */

      const college = a.student.college || "Unknown";

      if (!collegeStudentMap[college]) {
        collegeStudentMap[college] = new Set();
      }

      collegeStudentMap[college].add(studentId);

      /* ===== CLASS ACTIVITY ===== */

      const classId = a.class.toString();
      classJoinCount[classId] = (classJoinCount[classId] || 0) + 1;

      /* ===== DAILY TREND ===== */

      const day = a.createdAt.toISOString().split("T")[0];
      dailyTrend[day] = (dailyTrend[day] || 0) + 1;
    });

    /* ================= TOP COLLEGE ================= */

    let topCollege = null;
    let max = 0;

    for (const college in collegeStudentMap) {
      const count = collegeStudentMap[college].size;
      if (count > max) {
        max = count;
        topCollege = college;
      }
    }

    /* ================= MOST ACTIVE CLASS ================= */

    let activeClassId = null;
    let activeMax = 0;

    for (const cid in classJoinCount) {
      if (classJoinCount[cid] > activeMax) {
        activeMax = classJoinCount[cid];
        activeClassId = cid;
      }
    }

    const activeClass = classes.find(c => c._id.toString() === activeClassId);

    /* ================= FORMAT COLLEGE PIE ================= */

    const collegeStats = Object.keys(collegeStudentMap).map(college => ({
      college,
      students: collegeStudentMap[college].size   // ⭐ UNIQUE STUDENTS
    }));

    /* ================= FORMAT DAILY TREND ================= */

    const trend = Object.keys(dailyTrend)
      .sort()
      .map(date => ({
        date,
        joins: dailyTrend[date]
      }));

    /* ================= RESPONSE ================= */

    res.json({
      branchName: branch?.name || "Branch",
      totalClasses: classes.length,
      totalStudents: uniqueStudents.size,
      totalJoinings: attendance.length,

      collegeStats,
      topCollege,
      mostActiveClass: activeClass?.className || "N/A",
      dailyTrend: trend
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics error" });
  }
};
