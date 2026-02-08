import mongoose from "mongoose";
import Student from "../models/Student.js";
import Class from "../models/Class.js";
import Attendance from "../models/Attendance.js";
import XLSX from "xlsx";
import fs from "fs";

/* =====================================================
   MARK ATTENDANCE
===================================================== */
export const markAttendance = async (req, res) => {
  try {
    const { fullName, email, group, college, classCode } = req.body;

    if (!fullName || !email || !group || !college || !classCode) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔍 Find class
    const foundClass = await Class.findOne({ classCode });
    if (!foundClass) {
      return res.status(404).json({ message: "Invalid class link" });
    }

    // 👤 Find or create student
    let student = await Student.findOne({ email });

    if (!student) {
      student = await Student.create({
        fullName,
        email,
        group,
        college
      });
    } else {
      student.fullName = fullName;
      student.group = group;
      student.college = college;
      await student.save();
    }

    // 🚫 Check if student already joined THIS class
    const alreadyJoined = await Attendance.findOne({
      student: student._id,
      class: foundClass._id
    });

    if (alreadyJoined) {
      return res.status(200).json({
        message: "Attendance already marked for this class",
        meetLink: foundClass.meetLink
      });
    }

    // ✅ First time joining this class
    const attendanceDoc = await Attendance.create({
      student: student._id,
      class: foundClass._id
    });
    console.log("Attendance created:", attendanceDoc);

    res.status(200).json({
      message: "Attendance marked successfully",
      meetLink: foundClass.meetLink
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}; 


/* =====================================================
   GET RAW CLASS ATTENDANCE
===================================================== */
export const getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;

    const attendance = await Attendance.find({ class: classId })
      .populate("student", "fullName email group college")
      .sort({ createdAt: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   EXPORT ATTENDANCE (EXCEL)
===================================================== */
// export const exportAttendance = async (req, res) => {
//   try {
//     const { classId } = req.params;

//     const attendance = await Attendance.find({ class: classId })
//       .populate("student", "fullName email group college")
//       .sort({ createdAt: 1 });

//     if (!attendance.length) {
//       return res.status(404).json({ message: "No attendance data found" });
//     }

//     const data = attendance.map((record, index) => ({
//       SNo: index + 1,
//       FullName: record.student.fullName,
//       Email: record.student.email,
//       Group: record.student.group,
//       College: record.student.college,
//       Date: record.createdAt.toLocaleDateString(),
//       Time: record.createdAt.toLocaleTimeString()
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

//     const filePath = `attendance_${classId}.xlsx`;
//     XLSX.writeFile(workbook, filePath);

//     res.download(filePath, () => fs.unlinkSync(filePath));
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const exportAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { college } = req.query; // 👈 important

    let attendance = await Attendance.find({ class: classId })
      .populate("student", "fullName email group college")
      .sort({ createdAt: 1 });

    // 🔥 FILTER BY COLLEGE
    if (college) {
      attendance = attendance.filter(
        (record) => record.student && record.student.college === college
      );
    }

    if (!attendance.length) {
      return res.status(404).json({ message: "No attendance data found" });
    }

    const data = attendance.map((record, index) => ({
      SNo: index + 1,
      FullName: record.student.fullName,
      Email: record.student.email,
      Group: record.student.group,
      College: record.student.college,
      Date: record.createdAt.toLocaleDateString(),
      Time: record.createdAt.toLocaleTimeString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const filePath = `attendance_${college || "all"}.xlsx`;
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, () => fs.unlinkSync(filePath));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   ATTENDANCE SUMMARY (MEET STYLE)
===================================================== */
export const getAttendanceSummary = async (req, res) => {
  try {
    const { classId } = req.params;

    // total sessions = unique dates
    const totalDays = await Attendance.aggregate([
      { $match: { class: new mongoose.Types.ObjectId(classId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          }
        }
      }
    ]);

    const totalClasses = totalDays.length;

    const attendance = await Attendance.find({ class: classId })
      .populate("student", "fullName email group college");

    const map = {};

    attendance.forEach((a) => {
      const s = a.student;
      if (!s) return;

      if (!map[s.email]) {
        map[s.email] = {
          fullName: s.fullName,
          email: s.email,
          group: s.group,
          college: s.college,
          attendedSessions: 1
        };
      } else {
        map[s.email].attendedSessions += 1;
      }
    });

    const summary = Object.values(map).map((s) => ({
      ...s,
      totalClasses,
      percentage:
        totalClasses === 0
          ? 0
          : Math.round((s.attendedSessions / totalClasses) * 100)
    }));

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GROUP WISE ATTENDANCE
===================================================== */
export const getGroupWiseAttendance = async (req, res) => {
  try {
    const { classId } = req.params;

    const attendance = await Attendance.find({ class: classId })
      .populate("student", "fullName email group");

    const groupWise = {};

    attendance.forEach((a) => {
      const s = a.student;
      if (!s) return;

      if (!groupWise[s.group]) {
        groupWise[s.group] = {};
      }

      if (!groupWise[s.group][s.email]) {
        groupWise[s.group][s.email] = {
          fullName: s.fullName,
          email: s.email,
          attendanceCount: 1
        };
      } else {
        groupWise[s.group][s.email].attendanceCount += 1;
      }
    });

    const formatted = {};
    for (const g in groupWise) {
      formatted[g] = Object.values(groupWise[g]);
    }

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   COLLEGE → GROUP WISE ATTENDANCE
===================================================== */
export const getCollegeGroupWiseAttendance = async (req, res) => {
  try {
    const { classId } = req.params;

    const attendance = await Attendance.find({ class: classId })
      .populate("student", "fullName email group college");

    const collegeWise = {};

    attendance.forEach((a) => {
      const s = a.student;
      if (!s) return;

      if (!collegeWise[s.college]) {
        collegeWise[s.college] = {};
      }

      if (!collegeWise[s.college][s.group]) {
        collegeWise[s.college][s.group] = {};
      }

      if (!collegeWise[s.college][s.group][s.email]) {
        collegeWise[s.college][s.group][s.email] = {
          fullName: s.fullName,
          email: s.email,
          attendanceCount: 1
        };
      } else {
        collegeWise[s.college][s.group][s.email].attendanceCount += 1;
      }
    });

    const formatted = {};
    for (const college in collegeWise) {
      formatted[college] = {};
      for (const group in collegeWise[college]) {
        formatted[college][group] = Object.values(
          collegeWise[college][group]
        );
      }
    }

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getOverallAttendanceSummary = async (req, res) => {
//   try {
//     const attendance = await Attendance.find()
//       .populate("student", "fullName email group college")
//       .populate("class", "className");

//     const map = {};

//     attendance.forEach((record) => {
//       const s = record.student;
//       const c = record.class;

//       if (!s || !c) return;

//       if (!map[s.email]) {
//         map[s.email] = {
//           fullName: s.fullName,
//           email: s.email,
//           group: s.group,
//           college: s.college,
//           totalClassesJoined: 1,
//           classes: [c.className]
//         };
//       } else {
//         // prevent duplicate class names
//         if (!map[s.email].classes.includes(c.className)) {
//           map[s.email].classes.push(c.className);
//           map[s.email].totalClassesJoined += 1;
//         }
//       }
//     });

//     // 🔽 SORT BY COLLEGE NAME (A → Z)
//     const sortedResult = Object.values(map).sort((a, b) =>
//       (a.college || "").localeCompare(b.college || "")
//     );

//     res.status(200).json(sortedResult);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
 
// export const exportOverallAttendanceExcel = async (req, res) => {
//   try {
//     const attendance = await Attendance.find()
//       .populate("student", "fullName email group college")
//       .populate("class", "className");

//     // 🧠 Step 1: Collect unique DATE + CLASS headers
//     const headersSet = new Set();

//     attendance.forEach((r) => {
//       if (!r.student || !r.class) return;

//       const date = r.createdAt.toISOString().split("T")[0];
//       const header = `${date} - ${r.class.className}`;
//       headersSet.add(header);
//     });

//     const dynamicHeaders = Array.from(headersSet).sort();

//     // 🧠 Step 2: Build student map
//     const map = {};

//     attendance.forEach((r) => {
//       const s = r.student;
//       const c = r.class;
//       if (!s || !c) return;

//       const date = r.createdAt.toISOString().split("T")[0];
//       const header = `${date} - ${c.className}`;

//       if (!map[s.email]) {
//         map[s.email] = {
//           FullName: s.fullName,
//           Email: s.email,
//           Group: s.group,
//           College: s.college,
//           attended: new Set()
//         };
//       }

//       map[s.email].attended.add(header);
//     });
//     // total number of classes in system
// const totalClassesCount = await Class.countDocuments();

// const rows = Object.values(map)
//   .sort((a, b) => (a.College || "").localeCompare(b.College || ""))
//   .map((student) => {

//     const row = {
//       FullName: student.FullName,
//       Email: student.Email,
//       Group: student.Group,
//       College: student.College
//     };

//     let totalJoinings = 0;

//     dynamicHeaders.forEach((h) => {
//       if (student.attended.has(h)) {
//         row[h] = 1;
//         totalJoinings++;
//       } else {
//         row[h] = "";
//       }
//     });

//     row["Total Joinings"] = totalJoinings;
//     row["Total Classes"] = totalClassesCount; // ✅ ALWAYS 7

//     return row;
//   });

      
//     rows.sort((a, b) =>
//       (a.College || "").localeCompare(b.College || "")
//     );

//     // 🧠 Step 4: Create Excel
//     const worksheet = XLSX.utils.json_to_sheet(rows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Overall Attendance");

//     const filePath = "overall_attendance.xlsx";
//     XLSX.writeFile(workbook, filePath);

//     res.download(filePath, () => fs.unlinkSync(filePath));

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };
export const getOverallAttendanceSummary = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const attendance = await Attendance.find()
      .populate({
        path: "class",
        match: { teacher: teacherId }, // ✅ teacher isolation
        select: "className"
      })
      .populate("student", "fullName email group college");

    // ❗ remove records of other teachers
    const filtered = attendance.filter(a => a.class && a.student);

    const map = {};

    filtered.forEach(record => {
      const s = record.student;
      const c = record.class;

      if (!map[s.email]) {
        map[s.email] = {
          fullName: s.fullName,
          email: s.email,
          group: s.group,
          college: s.college,
          classes: new Set()
        };
      }

      map[s.email].classes.add(c.className);
    });

    const result = Object.values(map)
      .map(s => ({
        fullName: s.fullName,
        email: s.email,
        group: s.group,
        college: s.college,
        totalClassesJoined: s.classes.size,
        classes: [...s.classes]
      }))
      .sort((a, b) =>
        (a.college || "").localeCompare(b.college || "")
      );

    res.status(200).json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// export const exportOverallAttendanceExcel = async (req, res) => {
//   try {
//     const teacherId = req.user._id;

//     const attendance = await Attendance.find()
//       .populate({
//         path: "class",
//         match: { teacher: teacherId }, // ✅ teacher isolation
//         select: "className"
//       })
//       .populate("student", "fullName email group college");

//     // ❗ keep only this teacher's data
//     const filtered = attendance.filter(a => a.class && a.student);

//     // ================= HEADERS =================
//     const headersSet = new Set();

//     filtered.forEach(r => {
//       const date = r.createdAt.toISOString().split("T")[0];
//       headersSet.add(`${date} - ${r.class.className}`);
//     });

//     const dynamicHeaders = [...headersSet].sort();

//     // ================= STUDENT MAP =================
//     const map = {};

//     filtered.forEach(r => {
//       const s = r.student;
//       const header = `${r.createdAt.toISOString().split("T")[0]} - ${r.class.className}`;

//       if (!map[s.email]) {
//         map[s.email] = {
//           FullName: s.fullName,
//           Email: s.email,
//           Group: s.group,
//           College: s.college,
//           attended: new Set()
//         };
//       }

//       map[s.email].attended.add(header);
//     });

//     // total classes ONLY for this teacher
//     const totalClassesCount = await Class.countDocuments({
//       teacher: teacherId
//     });

//     const rows = Object.values(map)
//       .sort((a, b) => (a.College || "").localeCompare(b.College || ""))
//       .map(student => {
//         const row = {
//           FullName: student.FullName,
//           Email: student.Email,
//           Group: student.Group,
//           College: student.College
//         };

//         let totalJoinings = 0;

//         dynamicHeaders.forEach(h => {
//           if (student.attended.has(h)) {
//             row[h] = 1;
//             totalJoinings++;
//           } else {
//             row[h] = "";
//           }
//         });

//         row["Total Joinings"] = totalJoinings;
//         row["Total Classes"] = totalClassesCount;

//         return row;
//       });

//     const worksheet = XLSX.utils.json_to_sheet(rows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Overall Attendance");

//     const filePath = `overall_attendance_${teacherId}.xlsx`;
//     XLSX.writeFile(workbook, filePath);

//     res.download(filePath, () => fs.unlinkSync(filePath));

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };


export const exportOverallAttendanceExcel = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const selectedCollege = req.query.college; // ⭐ NEW

    const attendance = await Attendance.find()
      .populate({
        path: "class",
        match: { teacher: teacherId },
        select: "className"
      })
      .populate("student", "fullName email group college");

    const filtered = attendance.filter(a => a.class && a.student);

    const map = {};

    filtered.forEach(r => {
      const s = r.student;

      // ⭐ FILTER BY COLLEGE
      if (selectedCollege && s.college !== selectedCollege) return;

      const date = r.createdAt.toISOString().split("T")[0];
      const header = `${date} - ${r.class.className}`;

      if (!map[s.email]) {
        map[s.email] = {
          FullName: s.fullName,
          Email: s.email,
          Group: s.group,
          College: s.college,
          classes: new Set()
        };
      }

      map[s.email].classes.add(header);
    });

    const rows = Object.values(map).map(student => ({
      FullName: student.FullName,
      Email: student.Email,
      Group: student.Group,
      College: student.College,
      TotalClassesJoined: student.classes.size,
      Classes: Array.from(student.classes).join(", ")
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const fileName = selectedCollege
      ? `${selectedCollege}_attendance.xlsx`
      : `overall_attendance.xlsx`;

    XLSX.writeFile(workbook, fileName);
    res.download(fileName, () => fs.unlinkSync(fileName));

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
