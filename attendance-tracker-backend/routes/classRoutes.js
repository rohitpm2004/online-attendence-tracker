import express from "express";
import { createClass,getMyClasses ,getClassByCode,updateClass,deleteClass,getSingleClass} from "../controllers/classController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createClass);
router.get("/my", protect, getMyClasses);
router.get("/by-code/:classCode", getClassByCode);
router.put("/update/:id", protect, updateClass);
router.delete("/delete/:id", protect, deleteClass);
router.get("/single/:id", protect, getSingleClass);

export default router;