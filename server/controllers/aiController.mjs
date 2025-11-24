import aiService from '../services/aiService.mjs';
import seoService from '../services/seoService.mjs';

class AIController {
  // Generate content for specific platform
  async generateContent(req, res) {
    try {
      const { platform, topic, contentType } = req.body;

      if (!platform || !topic || !contentType) {
        return res.status(400).json({
          error: 'Missing required fields: platform, topic, contentType'
        });
      }

      const validPlatforms = ['facebook', 'instagram', 'twitter'];
      const validContentTypes = ['headline', 'caption', 'hashtag'];

      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({
          error: 'Invalid platform. Use: facebook, instagram, twitter'
        });
      }

      if (!validContentTypes.includes(contentType)) {
        return res.status(400).json({
          error: 'Invalid content type. Use: headline, caption, hashtag'
        });
      }

      const content = await aiService.generateContent(platform, topic, contentType);

      res.json({
        success: true,
        data: {
          platform,
          topic,
          contentType,
          content,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  // Generate all content types for a platform
  async generateAllContent(req, res) {
    try {
      const { platform, topic } = req.body;

      if (!platform || !topic) {
        return res.status(400).json({
          error: 'Missing required fields: platform, topic'
        });
      }

      const validPlatforms = ['facebook', 'instagram', 'twitter'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({
          error: 'Invalid platform. Use: facebook, instagram, twitter'
        });
      }

      const content = await aiService.generateAllContent(platform, topic);

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  // Analyze SEO score
  async analyzeSEO(req, res) {
    try {
      const { content, contentType = 'headline', platform = 'facebook' } = req.body;

      if (!content) {
        return res.status(400).json({
          error: 'Content is required for SEO analysis'
        });
      }

      const analysis = await seoService.analyzeSEO(content, contentType, platform);

      res.json({
        success: true,
        data: {
          content,
          contentType,
          platform,
          analysis,
          analyzedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  // Generate content for multiple platforms
  async generateMultiPlatformContent(req, res) {
    try {
      const { platforms, topic } = req.body;

      if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({
          error: 'Platforms array is required and cannot be empty'
        });
      }

      if (!topic) {
        return res.status(400).json({
          error: 'Topic is required'
        });
      }

      const validPlatforms = ['facebook', 'instagram', 'twitter'];
      const invalidPlatforms = platforms.filter(p => !validPlatforms.includes(p));
      
      if (invalidPlatforms.length > 0) {
        return res.status(400).json({
          error: `Invalid platforms: ${invalidPlatforms.join(', ')}. Use: facebook, instagram, twitter`
        });
      }

      const content = await aiService.generateMultiPlatformContent(platforms, topic);

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
}

export default new AIController();