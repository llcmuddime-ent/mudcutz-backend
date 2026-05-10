// backend/routes/bookingRoutes.js
import express from 'express';
import * as bookingControllers from '../controllers/bookingControllers.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Booking routes
router.get('/', protect, bookingControllers.booking_index);
router.post('/', protect, bookingControllers.booking_create);
router.patch('/:id', protect, bookingControllers.booking_update);
router.delete('/:id', protect, bookingControllers.booking_delete);
router.get('/:id', protect, bookingControllers.booking_details);

export default router;