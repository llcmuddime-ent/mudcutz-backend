import express from "express";
import {
  login,
  getMe,
  register
} from "../controllers/authControllers.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

//REGISTER ROUTE
router.post("/register", register);

// 🔓 PUBLIC ROUTE
router.post("/login", login);

// 🔒 PROTECTED ROUTE
router.get("/me", protect, getMe);

export default router;