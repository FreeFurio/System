import socialMediaService from '../services/socialMediaService.mjs';
import aiService from '../services/aiService.mjs';

class SocialMediaController {
  // Post to single platform using Firebase tokens
  async postToPlatform(req, res) {
    try {
      const { platform, content, pageId } = req.body;

      if (!platform || !content || !pageId) {
        return res.status(400).json({
          error: 'Missing required fields: platform, content, pageId'
        });
      }

      let result;

      switch (platform) {
        case 'facebook':
          result = await socialMediaService.postToFacebook(content, pageId);
          break;

        case 'instagram':
          result = await socialMediaService.postToInstagram(content, pageId);
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

  // Post to multiple platforms using Firebase tokens
  async postToMultiplePlatforms(req, res) {
    try {
      const { content, platforms, pageId } = req.body;

      if (!content || !platforms || !pageId) {
        return res.status(400).json({
          error: 'Missing required fields: content, platforms, pageId'
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
        pageId
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
      const { topic, platforms, imageUrl } = req.body;

      if (!topic || !platforms) {
        return res.status(400).json({
          error: 'Missing required fields: topic, platforms'
        });
      }

      // Get only active accounts for posting
      const { ref, get } = await import('firebase/database');
      const { getDatabase } = await import('firebase/database');
      const { initializeApp } = await import('firebase/app');
      const { config } = await import('../config/config.mjs');
      
      const app = initializeApp(config.firebase);
      const db = getDatabase(app, config.firebase.databaseURL);
      
      const connectedPagesRef = ref(db, 'connectedPages/admin');
      const snapshot = await get(connectedPagesRef);
      
      if (!snapshot.exists()) {
        return res.status(400).json({
          error: 'No connected accounts found'
        });
      }
      
      const allPages = Object.values(snapshot.val());
      const activePages = allPages.filter(page => page.active !== false);
      
      if (activePages.length === 0) {
        return res.status(400).json({
          error: 'No active accounts found for posting'
        });
      }

      const results = [];

      // Generate content for each platform and post to all active accounts
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

          // Post to all active accounts for this platform
          const platformResults = [];
          
          for (const activePage of activePages) {
            try {
              let postResult;
              switch (platform.name) {
                case 'facebook':
                  postResult = await socialMediaService.postToFacebook(
                    content, 
                    activePage.id
                  );
                  break;

                case 'instagram':
                  postResult = await socialMediaService.postToInstagram(
                    content, 
                    activePage.id
                  );
                  break;

                case 'twitter':
                  postResult = await socialMediaService.postToTwitter(content);
                  break;
              }
              
              platformResults.push({
                accountId: activePage.id,
                accountName: activePage.name,
                success: true,
                postResult
              });
              
            } catch (accountError) {
              platformResults.push({
                accountId: activePage.id,
                accountName: activePage.name,
                success: false,
                error: accountError.message
              });
            }
          }

          results.push({
            platform: platform.name,
            success: platformResults.some(r => r.success),
            content: aiContent,
            accounts: platformResults,
            activeAccountsCount: activePages.length
          });

        } catch (error) {
          results.push({
            platform: platform.name,
            success: false,
            error: error.message,
            activeAccountsCount: activePages.length
          });
        }
      }

      res.json({
        success: results.some(r => r.success),
        data: {
          topic,
          results,
          summary: {
            platforms: platforms.length,
            activeAccounts: activePages.length,
            successfulPlatforms: results.filter(r => r.success).length,
            failedPlatforms: results.filter(r => !r.success).length,
            totalPosts: results.reduce((sum, r) => sum + (r.accounts?.filter(a => a.success).length || 0), 0)
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