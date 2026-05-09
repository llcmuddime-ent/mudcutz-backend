// routes/productRoutes.js
import express from 'express';
import {
  product_index,
  product_create,
  product_update,
  product_delete,
  product_details
} from '../controllers/productControllers.js';

const router = express.Router();

// Product routes
router.get('/', product_index);
router.post('/', product_create);
router.patch('/:id', product_update);
router.delete('/:id', product_delete);
router.get('/:id', product_details);

export default router;