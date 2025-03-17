import express from 'express';
import * as productsController from '../controllers/products.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = express.Router();

// Public routes
router.get('/', productsController.getAllProducts);
router.get('/category/:category', productsController.getProductsByCategory);
router.get('/tag/:tag', productsController.getProductsByTag);
router.get('/slug/:slug', productsController.getProductBySlug);
router.get('/:id', productsController.getProductById);

// Protected routes - only admin and editor roles can create, update, or delete products
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  productsController.validateProduct, 
  productsController.createProduct
);

router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  productsController.validateProduct, 
  productsController.updateProduct
);

router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  productsController.deleteProduct
);

export default router; 