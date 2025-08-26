import aiService from '../services/aiService.js';

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
      const { content, contentType = 'headline' } = req.body;

      if (!content) {
        return res.status(400).json({
          error: 'Content is required for SEO analysis'
        });
      }

      const analysis = await aiService.analyzeSEO(content, contentType);

      res.json({
        success: true,
        data: {
          content,
          contentType,
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
}

export default new AIController();