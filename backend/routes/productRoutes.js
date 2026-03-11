import express from 'express';
import { productController } from '../controllers/productController.js';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
router.post('/bulk', productController.createBulkProducts);
router.post('/:id/process', productController.processProduct);
router.post('/:id/payment', productController.processPayment);
router.patch('/:id/status', productController.updateProductStatus);
router.delete('/:id', productController.deleteProduct);

export default router;
