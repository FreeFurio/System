import axios from 'axios';
import crypto from 'crypto';

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
      enabled: process.env.INSTAGRAM_ENABLED === 'true',
      appId: process.env.INSTAGRAM_APP_ID,
      appSecret: process.env.INSTAGRAM_APP_SECRET,
      apiVersion: process.env.FB_API_VERSION || 'v18.0'
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

  // Get Facebook page access token from user access token
  async getFacebookPageAccessToken(userAccessToken, pageId) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.facebook.apiVersion}/${pageId}?fields=access_token&access_token=${userAccessToken}`
      );
      return response.data.access_token;
    } catch (error) {
      throw new Error(`Failed to get page access token: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Get user's Facebook pages
  async getFacebookPages(userAccessToken) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.facebook.apiVersion}/me/accounts?access_token=${userAccessToken}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get Facebook pages: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Facebook posting with proper page authentication
  async postToFacebook(content, userAccessToken, pageId) {
    try {
      if (!pageId) {
        throw new Error('Page ID is required for Facebook posting');
      }

      // Get page access token for native posting
      const pageAccessToken = await this.getFacebookPageAccessToken(userAccessToken, pageId);
      
      const endpoint = `https://graph.facebook.com/${this.facebook.apiVersion}/${pageId}/feed`;

      const postData = {
        message: `${content.headline}\n\n${content.caption}\n\n${content.hashtag}`,
        access_token: pageAccessToken // Use page token, not user token
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
        message: 'Posted successfully to Facebook as page',
        data: response.data,
        postedAsPage: true
      };

    } catch (error) {
      throw new Error(`Facebook posting failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Instagram posting (Business Account)
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
        `https://graph.facebook.com/${this.instagram.apiVersion}/${instagramAccountId}/media`,
        mediaData
      );

      const creationId = containerResponse.data.id;

      // Step 2: Publish the media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/${this.instagram.apiVersion}/${instagramAccountId}/media_publish`,
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

  // Instagram posting (Basic Display - Fallback)
  async postToInstagramBasic(content, accessToken) {
    try {
      // Note: Instagram Basic Display API doesn't support posting
      // This is a placeholder for testing mode
      return {
        success: true,
        platform: 'instagram',
        postId: `test_${Date.now()}`,
        message: 'Instagram post simulated (Basic Display API)',
        data: { content, testing: true }
      };
    } catch (error) {
      throw new Error(`Instagram basic posting failed: ${error.message}`);
    }
  }

  // Test Instagram posting permissions
  async testInstagramPosting(accessToken, userId) {
    try {
      // Try to get user's media to test permissions
      const response = await axios.get(
        `https://graph.instagram.com/${userId}/media?fields=id,media_type,media_url,permalink&access_token=${accessToken}`
      );
      
      return {
        success: true,
        message: 'Instagram API access confirmed',
        permissions: 'Read access working',
        canPost: false, // Basic Display cannot post
        data: response.data
      };
    } catch (error) {
      throw new Error(`Instagram test failed: ${error.message}`);
    }
  }

  // Twitter posting with OAuth 1.0a and media support
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
        console.log('📷 Uploading media to Twitter...');
        const mediaId = await this.uploadTwitterMedia(content.imageUrl);
        tweetData.media = { media_ids: [mediaId] };
        console.log('✅ Media uploaded, ID:', mediaId);
      }

      // Generate OAuth 1.0a signature
      const oauth = this.generateOAuthHeader('POST', 'https://api.twitter.com/2/tweets', {});

      console.log('📡 Posting tweet with content...');
      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        tweetData,
        {
          headers: {
            'Authorization': oauth,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform: 'twitter',
        postId: response.data.data.id,
        message: content.imageUrl ? 'Posted successfully to Twitter with media' : 'Posted successfully to Twitter',
        data: response.data,
        mediaIncluded: !!content.imageUrl
      };

    } catch (error) {
      throw new Error(`Twitter posting failed: ${error.response?.data?.detail || error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  // Generate OAuth 1.0a header
  generateOAuthHeader(method, url, params) {
    
    const oauthParams = {
      oauth_consumer_key: this.twitter.apiKey,
      oauth_token: this.twitter.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_version: '1.0'
    };

    // Create parameter string
    const allParams = { ...params, ...oauthParams };
    const paramString = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');

    // Create signature base string
    const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;

    // Create signing key
    const signingKey = `${encodeURIComponent(this.twitter.apiSecret)}&${encodeURIComponent(this.twitter.accessTokenSecret)}`;

    // Generate signature
    const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
    oauthParams.oauth_signature = signature;

    // Create authorization header
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    return authHeader;
  }

  // Upload media to Twitter with OAuth 1.0a
  async uploadTwitterMedia(imageUrl) {
    try {
      console.log('📷 Downloading image from:', imageUrl);
      // Download image first
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);
      const base64Image = imageBuffer.toString('base64');
      
      console.log('📎 Image size:', Math.round(base64Image.length / 1024), 'KB');

      // Prepare form data for media upload
      const formData = `media_data=${encodeURIComponent(base64Image)}`;
      
      // Generate OAuth header for media upload (include media_data in signature)
      const oauth = this.generateOAuthHeader('POST', 'https://upload.twitter.com/1.1/media/upload.json', {
        media_data: base64Image
      });

      console.log('📡 Uploading to Twitter media endpoint...');
      // Upload to Twitter
      const uploadResponse = await axios.post(
        'https://upload.twitter.com/1.1/media/upload.json',
        formData,
        {
          headers: {
            'Authorization': oauth,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('✅ Media uploaded successfully, ID:', uploadResponse.data.media_id_string);
      return uploadResponse.data.media_id_string;
    } catch (error) {
      console.log('❌ Media upload error:', error.response?.data || error.message);
      throw new Error(`Twitter media upload failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
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

  // Get Instagram long-lived access token
  async getInstagramLongLivedToken(shortLivedToken) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.instagram.apiVersion}/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: this.instagram.appId,
            client_secret: this.instagram.appSecret,
            fb_exchange_token: shortLivedToken
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get long-lived token: ${error.message}`);
    }
  }

  // Get Instagram Business Account ID from Facebook Page
  async getInstagramAccountId(pageAccessToken, pageId) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.instagram.apiVersion}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
      );
      return response.data.instagram_business_account?.id || null;
    } catch (error) {
      throw new Error(`Failed to get Instagram account ID: ${error.message}`);
    }
  }

  // Get Instagram user info using Basic Display API
  async getInstagramUserInfo(accessToken) {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get Instagram user info: ${error.message}`);
    }
  }

  // Exchange short-lived Facebook token for long-lived token
  async getFacebookLongLivedToken(shortLivedToken) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.facebook.apiVersion}/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: this.facebook.appId,
            client_secret: this.facebook.appSecret,
            fb_exchange_token: shortLivedToken
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get long-lived Facebook token: ${error.message}`);
    }
  }

  // Get Facebook page info with permissions
  async getFacebookPageInfo(pageAccessToken, pageId) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.facebook.apiVersion}/${pageId}?fields=id,name,access_token,category,about&access_token=${pageAccessToken}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get Facebook page info: ${error.response?.data?.error?.message || error.message}`);
    }
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
            `https://graph.facebook.com/${this.instagram.apiVersion}/${tokens.accountId}?fields=id,username&access_token=${tokens.accessToken}`
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