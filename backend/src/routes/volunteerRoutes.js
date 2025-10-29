import { Router } from 'express';
import { 
  createVolunteer, 
  listVolunteers, 
  getVolunteerById, 
  updateVolunteerStatus, 
  getVolunteerStats 
} from '../controllers/volunteerController.js';

const router = Router();

// Public routes
router.post('/', createVolunteer);

// Admin routes (TODO: Add authentication middleware)
router.get('/', listVolunteers);
router.get('/stats', getVolunteerStats);
router.get('/:id', getVolunteerById);
router.put('/:id/status', updateVolunteerStatus);

export default router;
