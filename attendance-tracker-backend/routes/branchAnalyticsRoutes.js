// import express from "express";
// import protect from "../middleware/authMiddleware.js";
// import { getBranchAnalytics } from "../controllers/branchAnalyticsController.js";

// const router = express.Router();

// router.get("/:branchId/analytics", protect, getBranchAnalytics);

// export default router;
 

import express from "express"; 
import protect from "../middleware/authMiddleware.js";
import { getBranchAnalytics } from "../controllers/branchAnalyticsController.js";

const router = express.Router();

// GET /api/branches/:branchId/analytics
router.get("/:branchId/analytics", protect, getBranchAnalytics);

export default router;
