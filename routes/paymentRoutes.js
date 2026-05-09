import express from "express";
import {
    addProductSale,
    addServiceSale,
    getSales,
    get_sales_details
} from "../controllers/paymentControllers.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Admin mainly (barber limited view)
router.get("/", protect, getSales);
router.get("/:id", protect, get_sales_details);

// Barber + Admin
router.post("/service", protect, authorize("barber", "admin"),addServiceSale);
router.post("/product", protect, authorize("barber", "admin"),addProductSale);


export default router;