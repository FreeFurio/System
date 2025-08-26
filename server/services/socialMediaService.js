import axios from 'axios';

class SocialMediaService {
  constructor() {
    // Facebook configuration
    this.facebook = {
      appId: process.env.FB_APP_ID,
      appSecret: process.env.FB_APP_SECRET,
      apiVersion: process.env.FB_API_VERSION || 'v18.0'
    };

    // Instagram configuration (uses Facebook Graph API)
    this.instagram = {
      enabled: process.env.INSTAGRAM_ENABLED === 'true'
    };

    // Twitter configuration
    this.twitter = {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      bearerToken: process.env.TWITTER_BEARER_TOKEN
    };

    this.retryAttempts = parseInt(process.env.SOCIAL_RETRY_ATTEMPTS) || 3;
  }

  // Facebook posting
  async postToFacebook(content, accessToken, pageId = null) {
    try {
      const endpoint = pageId 
        ? `https://graph.facebook.com/${this.facebook.apiVersion}/${pageId}/feed`
        : `https://graph.facebook.com/${this.facebook.apiVersion}/me/feed`;

      const postData = {
        message: `${content.headline}\n\n${content.caption}\n\n${content.hashtag}`,
        access_token: accessToken
      };

      // Add image if provided
      if (content.imageUrl) {
        postData.link = content.imageUrl;
      }

      const response = await axios.post(endpoint, postData);

      return {
        success: true,
        platform: 'facebook',
        postId: response.data.id,
        message: 'Posted successfully to Facebook',
        data: response.data
      };

    } catch (error) {
      throw new Error(`Facebook posting failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Instagram posting
  async postToInstagram(content, accessToken, instagramAccountId) {
    try {
      if (!this.instagram.enabled) {
        throw new Error('Instagram posting is disabled');
      }

      // Step 1: Create media container
      const mediaData = {
        image_url: content.imageUrl,
        caption: `${content.headline}\n\n${content.caption}\n\n${content.hashtag}`,
        access_token: accessToken
      };

      const containerResponse = await axios.post(
        `https://graph.facebook.com/${this.facebook.apiVersion}/${instagramAccountId}/media`,
        mediaData
      );

      const creationId = containerResponse.data.id;

      // Step 2: Publish the media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/${this.facebook.apiVersion}/${instagramAccountId}/media_publish`,
        {
          creation_id: creationId,
          access_token: accessToken
        }
      );

      return {
        success: true,
        platform: 'instagram',
        postId: publishResponse.data.id,
        message: 'Posted successfully to Instagram',
        data: publishResponse.data
      };

    } catch (error) {
      throw new Error(`Instagram posting failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Twitter posting
  async postToTwitter(content) {
    try {
      const tweetText = content.caption.length <= 280 
        ? `${content.caption} ${content.hashtag}`
        : `${content.caption.substring(0, 240)}... ${content.hashtag}`;

      const tweetData = {
        text: tweetText
      };

      // Add media if provided
      if (content.imageUrl) {
        // First upload media, then attach to tweet
        const mediaId = await this.uploadTwitterMedia(content.imageUrl);
        tweetData.media = { media_ids: [mediaId] };
      }

      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        tweetData,
        {
          headers: {
            'Authorization': `Bearer ${this.twitter.bearerToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform: 'twitter',
        postId: response.data.data.id,
        message: 'Posted successfully to Twitter',
        data: response.data
      };

    } catch (error) {
      throw new Error(`Twitter posting failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Upload media to Twitter
  async uploadTwitterMedia(imageUrl) {
    try {
      // Download image first
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);

      // Upload to Twitter
      const uploadResponse = await axios.post(
        'https://upload.twitter.com/1.1/media/upload.json',
        {
          media_data: imageBuffer.toString('base64')
        },
        {
          headers: {
            'Authorization': `Bearer ${this.twitter.bearerToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return uploadResponse.data.media_id_string;
    } catch (error) {
      throw new Error(`Twitter media upload failed: ${error.message}`);
    }
  }

  // Post to multiple platforms
  async postToMultiplePlatforms(content, platforms, tokens) {
    const results = [];

    for (const platform of platforms) {
      try {
        let result;

        switch (platform.name) {
          case 'facebook':
            result = await this.postToFacebook(
              content, 
              tokens.facebook.accessToken, 
              tokens.facebook.pageId
            );
            break;

          case 'instagram':
            result = await this.postToInstagram(
              content, 
              tokens.instagram.accessToken, 
              tokens.instagram.accountId
            );
            break;

          case 'twitter':
            result = await this.postToTwitter(content);
            break;

          default:
            throw new Error(`Unsupported platform: ${platform.name}`);
        }

        results.push(result);

      } catch (error) {
        results.push({
          success: false,
          platform: platform.name,
          error: error.message
        });
      }
    }

    return {
      success: results.some(r => r.success),
      results,
      summary: {
        total: platforms.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };
  }

  // Schedule post for later
  async schedulePost(content, platforms, tokens, scheduledTime) {
    // This would integrate with a job scheduler like node-cron or Bull Queue
    // For now, return the scheduled post data
    return {
      success: true,
      scheduledId: `scheduled_${Date.now()}`,
      content,
      platforms,
      scheduledTime,
      status: 'scheduled'
    };
  }

  // Validate platform tokens
  async validateTokens(platform, tokens) {
    try {
      switch (platform) {
        case 'facebook':
          const fbResponse = await axios.get(
            `https://graph.facebook.com/${this.facebook.apiVersion}/me?access_token=${tokens.accessToken}`
          );
          return { valid: true, user: fbResponse.data };

        case 'instagram':
          const igResponse = await axios.get(
            `https://graph.facebook.com/${this.facebook.apiVersion}/${tokens.accountId}?fields=id,username&access_token=${tokens.accessToken}`
          );
          return { valid: true, account: igResponse.data };

        case 'twitter':
          const twitterResponse = await axios.get(
            'https://api.twitter.com/2/users/me',
            {
              headers: {
                'Authorization': `Bearer ${this.twitter.bearerToken}`
              }
            }
          );
          return { valid: true, user: twitterResponse.data };

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      return { 
        valid: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }
}

export default new SocialMediaService();