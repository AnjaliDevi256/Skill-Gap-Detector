import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  updateUserSkills,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/', registerUser);
router.post('/auth', authUser);
router.post('/logout', logoutUser);

// Private Routes (Require Authentication)
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Route for updating temporary skills in the Skill Match tab
router.route('/profile/skills').put(protect, updateUserSkills);

export default router;