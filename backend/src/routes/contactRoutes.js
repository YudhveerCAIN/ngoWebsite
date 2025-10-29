import { Router } from 'express';
import { 
  submitContact, 
  listContactInquiries, 
  getContactInquiryById, 
  updateContactInquiryStatus, 
  getContactStats 
} from '../controllers/contactController.js';

const router = Router();

// Public routes
router.post('/', submitContact);

// Admin routes (TODO: Add authentication middleware)
router.get('/', listContactInquiries);
router.get('/stats', getContactStats);
router.get('/:id', getContactInquiryById);
router.put('/:id/status', updateContactInquiryStatus);

export default router;
