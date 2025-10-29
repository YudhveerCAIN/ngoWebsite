import { Router } from 'express';
import { 
	login, 
	logout, 
	seedAdmin, 
	getProfile, 
	changePassword, 
	refreshToken, 
	validateToken 
} from '../controllers/authController.js';
import { devOnly, requireAuth } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);
router.post('/validate-token', requireAuth, validateToken);

// Protected routes (require authentication)
router.get('/profile', requireAuth, getProfile);
router.post('/change-password', requireAuth, changePassword);
router.post('/refresh-token', requireAuth, refreshToken);

// Development routes
router.get('/seed-admin/dev', devOnly, seedAdmin);

export default router;
