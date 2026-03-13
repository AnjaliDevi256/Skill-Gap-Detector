import express from 'express';
import { analyzeJob } from '../controllers/geminiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/analyze', protect, analyzeJob);

export default router;