import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getBarbers,
  getBarberById,
  updateBarber,
  deleteBarber
} from "../controllers/userControllers.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// 🔒 ADMIN ONLY ROUTES
router.post("/", protect, authorize("admin"), createUser);
router.get("/", protect, authorize("admin","employee"), getUsers);
router.get("/barbers", protect, authorize("admin","employee"), getBarbers);
router.get("/barbers/:id", protect, authorize("admin"), getBarberById);
router.patch("/barbers/:id", protect, authorize("admin"), updateBarber);
router.delete("/barbers/:id", protect, authorize("admin"), deleteBarber);
router.get("/:id", protect, authorize("admin"), getUserById);
router.patch("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);
export default router;