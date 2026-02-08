// import Class from "../models/Class.js";
// import { v4 as uuidv4 } from "uuid";

// export const createClass = async (req, res) => {
//   try {
//     const { className, subject, meetLink, expiresAt } = req.body;

//     if (!className || !subject || !meetLink || !expiresAt) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const classCode = Math.floor(100000 + Math.random() * 900000).toString();

//     const newClass = await Class.create({
//       className,
//       subject,
//       meetLink,
//       classCode,
//       expiresAt: new Date(expiresAt),
//       teacher: req.user._id   // ✅ NOW EXISTS
//     });

//     res.status(201).json(newClass);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// export const getMyClasses = async (req, res) => {
//   try {
//     const classes = await Class.find({ teacher: req.user._id });
//     res.status(200).json(classes);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// // import Class from "../models/Class.js";

// export const getClassByCode = async (req, res) => {
//   try {
//     const { classCode } = req.params;

//     const foundClass = await Class.findOne({ classCode });

//     if (!foundClass) {
//       return res.status(404).json({ message: "Class not found" });
//     }

//     res.status(200).json({
//       className: foundClass.className,
//       subject: foundClass.subject,
//       expiresAt: foundClass.expiresAt
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateClass = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { className, subject, meetLink, expiresAt } = req.body;

//     const classDoc = await Class.findById(id);

//     if (!classDoc) {
//       return res.status(404).json({ message: "Class not found" });
//     }

//     // 🔐 ownership check
//     if (classDoc.teacher.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     classDoc.className = className || classDoc.className;
//     classDoc.subject = subject || classDoc.subject;
//     classDoc.meetLink = meetLink || classDoc.meetLink;
//     classDoc.expiresAt = expiresAt || classDoc.expiresAt;

//     await classDoc.save();

//     res.json({ message: "Class updated successfully", class: classDoc });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// import Attendance from "../models/Attendance.js";


// export const deleteClass = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const classDoc = await Class.findById(id);

//     if (!classDoc) {
//       return res.status(404).json({ message: "Class not found" });
//     }

//     // 🔐 Teacher ownership check
//     if (classDoc.teacher.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     // 🧹 Delete all attendance of this class
//     await Attendance.deleteMany({ class: id });

//     // 🗑 Delete class
//     await classDoc.deleteOne();

//     res.json({ message: "Class deleted successfully" });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


import Class from "../models/Class.js";
import Attendance from "../models/Attendance.js";

/* =======================================================
   CREATE CLASS  (FIXED TIMEZONE)
======================================================= */
export const createClass = async (req, res) => {
  try {
    const { className, subject, meetLink, expiresAt } = req.body;

    if (!className || !subject || !meetLink || !expiresAt) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Generate 6 digit class code
    const classCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔥 Convert browser local time -> proper UTC ISO
    const utcDate = new Date(expiresAt).toISOString();

    const newClass = await Class.create({
      className,
      subject,
      meetLink,
      classCode,
      expiresAt: utcDate,
      teacher: req.user._id
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =======================================================
   GET MY CLASSES
======================================================= */
export const getMyClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =======================================================
   GET CLASS BY CODE (FOR STUDENTS)
======================================================= */
export const getClassByCode = async (req, res) => {
  try {
    const { classCode } = req.params;

    const foundClass = await Class.findOne({ classCode });

    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({
      className: foundClass.className,
      subject: foundClass.subject,
      expiresAt: foundClass.expiresAt,
      meetLink: foundClass.meetLink
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =======================================================
   UPDATE CLASS  (FIXED TIMEZONE)
======================================================= */
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { className, subject, meetLink, expiresAt } = req.body;

    const classDoc = await Class.findById(id);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 🔐 Ownership check
    if (classDoc.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update fields
    if (className) classDoc.className = className;
    if (subject) classDoc.subject = subject;
    if (meetLink) classDoc.meetLink = meetLink;

    // 🔥 Convert time properly
    if (expiresAt) {
      classDoc.expiresAt = new Date(expiresAt).toISOString();
    }

    await classDoc.save();

    res.json({ message: "Class updated successfully", class: classDoc });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =======================================================
   DELETE CLASS
======================================================= */
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classDoc = await Class.findById(id);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 🔐 Teacher ownership check
    if (classDoc.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🧹 Delete attendance
    await Attendance.deleteMany({ class: id });
 
    // 🗑 Delete class
    await classDoc.deleteOne();

    res.json({ message: "Class deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
