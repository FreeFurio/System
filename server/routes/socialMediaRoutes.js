import express from 'express';
import socialMediaController from '../controllers/socialMediaController.js';

const router = express.Router();

// Post to single platform
router.post('/post', socialMediaController.postToPlatform);

// Post to multiple platforms
router.post('/post-multiple', socialMediaController.postToMultiplePlatforms);

// Generate AI content and post automatically
router.post('/generate-and-post', socialMediaController.generateAndPost);

// Schedule post for later
router.post('/schedule', socialMediaController.schedulePost);

// Validate platform tokens
router.post('/validate-tokens', socialMediaController.validateTokens);

// Get posting history/analytics
router.get('/history', socialMediaController.getPostingHistory);

export default router;