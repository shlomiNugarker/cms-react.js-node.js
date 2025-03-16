import express from 'express';
import * as siteSettingsController from '../controllers/siteSettings.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// Public route to get site settings
router.get('/', siteSettingsController.getSiteSettings);

// Protected route to update site settings (admin only)
router.put('/', authMiddleware, siteSettingsController.updateSiteSettings);

export default router; 