import express from "express";
import {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getBarberPerformance,
  getServiceInsights,
  getProductInsights
} from "../controllers/reportControllers.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// 🔒 Admin only
router.get("/daily", protect, authorize("admin"), getDailyReport);
router.get("/weekly", protect, authorize("admin"), getWeeklyReport);
router.get("/monthly", protect, authorize("admin"), getMonthlyReport);

router.get("/barbers", protect, authorize("admin"), getBarberPerformance);
router.get("/services", protect, authorize("admin"), getServiceInsights);
router.get("/products", protect, authorize("admin"), getProductInsights);
export default router;