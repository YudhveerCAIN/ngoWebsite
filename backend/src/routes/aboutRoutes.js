import { Router } from 'express';
import { getStory, getVisionMission, getTeam } from '../controllers/aboutController.js';

const router = Router();

router.get('/story', getStory);
router.get('/vision-mission', getVisionMission);
router.get('/team', getTeam);

export default router;
