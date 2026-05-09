// backend/routes/bookingRoutes.js
import express from 'express';
import * as bookingControllers from '../controllers/bookingControllers.js';

const router = express.Router();

// Booking routes
router.get('/', bookingControllers.booking_index);
router.post('/', bookingControllers.booking_create);
router.patch('/:id', bookingControllers.booking_update);
router.delete('/:id', bookingControllers.booking_delete);
router.get('/:id', bookingControllers.booking_details);

export default router;