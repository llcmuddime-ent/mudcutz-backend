// routes/serviceRoutes.js
import express from 'express';
import {
  service_index,
  service_create,
  service_update,
  service_delete,
  service_details
} from '../controllers/serviceControllers.js';

const router = express.Router();

// Service routes
router.get('/', service_index);
router.post('/', service_create);
router.patch('/:id', service_update);
router.delete('/:id', service_delete);
router.get('/:id', service_details);

export default router;