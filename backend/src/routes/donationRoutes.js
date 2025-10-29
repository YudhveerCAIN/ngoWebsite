import { Router } from 'express';
import { 
  createDonation, 
  listDonations, 
  getDonationById,
  getDonationStats,
  createPaymentOrder,
  verifyPayment
} from '../controllers/donationController.js';

const router = Router();

// Public routes
router.post('/', createDonation);
router.post('/payment', createPaymentOrder);
router.post('/verify', verifyPayment);

// Admin routes (TODO: Add authentication middleware)
router.get('/', listDonations);
router.get('/stats', getDonationStats);
router.get('/:id', getDonationById);

export default router;
