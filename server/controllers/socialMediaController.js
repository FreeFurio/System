import socialMediaService from '../services/socialMediaService.js';
import aiService from '../services/aiService.js';

class SocialMediaController {
  // Post to single platform
  async postToPlatform(req, res) {
    try {
      const { platform, content, tokens } = req.body;

      if (!platform || !content || !tokens) {
        return res.status(400).json({
          error: 'Missing required fields: platform, content, tokens'
        });
      }

      let result;

      switch (platform) {
        case 'facebook':
          if (!tokens.pageId) {
            throw new Error('Facebook page ID is required for posting');
          }
          result = await socialMediaService.postToFacebook(
            content, 
            tokens.accessToken, // This should be user access token
            tokens.pageId
          );
          break;

        case 'instagram':
          result = await socialMediaService.postToInstagram(
            content, 
            tokens.accessToken, 
            tokens.accountId
          );
          break;

        case 'twitter':
          result = await socialMediaService.postToTwitter(content);
          break;

        default:
          return res.status(400).json({
            error: 'Invalid platform. Use: facebook, instagram, twitter'
          });
      }

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  // Post to multiple platforms
  async postToMultiplePlatforms(req, res) {
    try {
      const { content, platforms, tokens } = req.body;

      if (!content || !platforms || !tokens) {
        return res.status(400).json({
          error: 'Missing required fields: content, platforms, tokens'
        });
      }

      if (!Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({
          error: 'Platforms must be a non-empty array'
        });
      }

      const result = await socialMediaService.postToMultiplePlatforms(
        content, 
        platforms, 
        tokens
      );

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  // Generate content and post automatically
  async generateAndPost(req, res) {
    try {
      const { topic, platforms, tokens, imageUrl } = req.body;

      if (!topic || !platforms || !tokens) {
        return res.status(400).json({
          error: 'Missing required fields: topic, platforms, tokens'
        });
      }

      const results = [];

      // Generate content for each platform and post
      for (const platform of platforms) {
        try {
          // Generate AI content
          const aiContent = await aiService.generateAllContent(platform.name, topic);
          
          // Prepare content with image
          const content = {
            headline: aiContent.headline,
            caption: aiContent.caption,
            hashtag: aiContent.hashtag,
            imageUrl: imageUrl || null
          };

          // Post to platform
          let postResult;
          switch (platform.name) {
            case 'facebook':
              if (!tokens.facebook.pageId) {
                throw new Error('Facebook page ID is required');
              }
              postResult = await socialMediaService.postToFacebook(
                content, 
                tokens.facebook.accessToken, // User access token
                tokens.facebook.pageId
              );
              break;

            case 'instagram':
              postResult = await socialMediaService.postToInstagram(
                content, 
                tokens.instagram.accessToken, 
                tokens.instagram.accountId
              );
              break;

            case 'twitter':
              postResult = await socialMediaService.postToTwitter(content);
              break;
          }

          results.push({
            platform: platform.name,
            success: true,
            content: aiContent,
            postResult
          });

        } catch (error) {
          results.push({
            platform: platform.name,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        success: results.some(r => r.success),
        data: {
          topic,
          results,
          summary: {
            total: platforms.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  // Schedule post
  async schedulePost(req, res) {
    try {
      const { content, platforms, tokens, scheduledTime } = req.body;

      if (!content || !platforms || !tokens || !scheduledTime) {
        return res.status(400).json({
          error: 'Missing required fields: content, platforms, tokens, scheduledTime'
        });
      }

      const result = await socialMediaService.schedulePost(
        content, 
        platforms, 
        tokens, 
        scheduledTime
      );

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  // Validate platform tokens
  async validateTokens(req, res) {
    try {
      const { platform, tokens } = req.body;

      if (!platform || !tokens) {
        return res.status(400).json({
          error: 'Missing required fields: platform, tokens'
        });
      }

      const result = await socialMediaService.validateTokens(platform, tokens);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  // Get user's Facebook pages
  async getFacebookPages(req, res) {
    try {
      const { userAccessToken } = req.body;

      if (!userAccessToken) {
        return res.status(400).json({
          error: 'User access token is required'
        });
      }

      const pages = await socialMediaService.getFacebookPages(userAccessToken);

      res.json({
        success: true,
        data: pages
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  // Get Facebook page access token
  async getFacebookPageToken(req, res) {
    try {
      const { userAccessToken, pageId } = req.body;

      if (!userAccessToken || !pageId) {
        return res.status(400).json({
          error: 'User access token and page ID are required'
        });
      }

      const pageAccessToken = await socialMediaService.getFacebookPageAccessToken(userAccessToken, pageId);
      const pageInfo = await socialMediaService.getFacebookPageInfo(pageAccessToken, pageId);

      res.json({
        success: true,
        data: {
          pageAccessToken,
          pageInfo
        }
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  // Get posting analytics/history
  async getPostingHistory(req, res) {
    try {
      // This would fetch from database in real implementation
      const mockHistory = [
        {
          id: 1,
          topic: 'New product launch',
          platforms: ['facebook', 'instagram'],
          status: 'completed',
          createdAt: new Date().toISOString(),
          results: {
            facebook: { success: true, postId: 'fb_123' },
            instagram: { success: true, postId: 'ig_456' }
          }
        }
      ];

      res.json({
        success: true,
        data: mockHistory
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
}

export default new SocialMediaController();