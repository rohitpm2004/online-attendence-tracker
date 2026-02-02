import express from "express";
import { markAttendance } from "../controllers/attendanceController.js";
import { getClassAttendance ,exportAttendance,getAttendanceSummary,getGroupWiseAttendance,exportOverallAttendanceExcel,  getCollegeGroupWiseAttendance ,getOverallAttendanceSummary
 } from "../controllers/attendanceController.js";
import protect from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/mark", markAttendance);
router.get("/class/:classId", protect, getClassAttendance);
router.get("/export/:classId", protect, exportAttendance);
router.get("/summary/:classId", protect, getAttendanceSummary);
router.get("/group-wise/:classId", protect, getGroupWiseAttendance);
router.get(
  "/college-group-wise/:classId",
  protect,
  getCollegeGroupWiseAttendance
);
router.get(
  "/overall",
  protect,
  getOverallAttendanceSummary
);

router.get(
  "/overall/export",
  protect,
  exportOverallAttendanceExcel
);


export default router;