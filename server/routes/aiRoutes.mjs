import express from 'express';
import aiController from '../controllers/aiController.mjs';

const router = express.Router();

// Generate specific content type
router.post('/generate-content', aiController.generateContent);

// Generate all content types for a platform
router.post('/generate-all', aiController.generateAllContent);

// Generate content for multiple platforms
router.post('/generate-multi-platform', aiController.generateMultiPlatformContent);

// SEO analysis
router.post('/analyze-seo', aiController.analyzeSEO);

export default router;