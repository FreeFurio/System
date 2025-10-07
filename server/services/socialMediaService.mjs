import axios from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

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

  // Facebook posting using Firebase page tokens
  async postToFacebook(content, pageId = null) {
    try {
      console.log('📘 Facebook posting using Firebase page tokens...');
      
      // Get page token from Firebase like insights service
      const { ref, get } = await import('firebase/database');
      const { getDatabase } = await import('firebase/database');
      const { initializeApp } = await import('firebase/app');
      const { config } = await import('../config/config.mjs');
      
      const app = initializeApp(config.firebase);
      const db = getDatabase(app, config.firebase.databaseURL);
      
      let pageData, actualPageId, pageAccessToken;
      
      if (pageId) {
        // Use specific page
        console.log('🔍 Looking for pageId:', pageId);
        console.log('🔍 Firebase path:', `connectedPages/admin/${pageId}`);
        
        const pageRef = ref(db, `connectedPages/admin/${pageId}`);
        const snapshot = await get(pageRef);
        
        if (!snapshot.exists()) {
          throw new Error('Specified Facebook page not found. Please check page configuration.');
        }
        
        pageData = snapshot.val();
        pageAccessToken = pageData.accessToken;
        actualPageId = pageData.id;
      } else {
        // Find first active page
        const pagesRef = ref(db, 'connectedPages/admin');
        const pagesSnapshot = await get(pagesRef);
        
        if (!pagesSnapshot.exists()) {
          throw new Error('No Facebook pages connected');
        }
        
        const pages = pagesSnapshot.val();
        const activePage = Object.entries(pages).find(([id, data]) => data.active === true);
        
        if (!activePage) {
          throw new Error('No active Facebook pages found');
        }
        
        pageData = activePage[1];
        pageAccessToken = pageData.accessToken;
        actualPageId = pageData.id;
        console.log('🔍 Using active page:', pageData.name, 'ID:', actualPageId);
      }
      
      const endpoint = `https://graph.facebook.com/v23.0/${actualPageId}/feed`;

      const postData = {
        message: `${content.headline}\n\n${content.caption}\n\n${content.hashtag}`,
        access_token: pageAccessToken
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

  // Facebook personal profile posting
  async postToFacebookProfile(content, userAccessToken) {
    try {
      const endpoint = `https://graph.facebook.com/${this.facebook.apiVersion}/me/feed`;

      const postData = {
        message: `${content.headline}\n\n${content.caption}\n\n${content.hashtag}`,
        access_token: userAccessToken
      };

      // Add image if provided
      if (content.imageUrl) {
        postData.link = content.imageUrl;
      }

      const response = await axios.post(endpoint, postData);

      return {
        success: true,
        platform: 'facebook_profile',
        postId: response.data.id,
        message: 'Posted successfully to Facebook profile',
        data: response.data,
        postedAsProfile: true
      };

    } catch (error) {
      throw new Error(`Facebook profile posting failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Instagram posting using Firebase tokens with connectivity check
  async postToInstagram(content, pageId = null) {
    try {
      console.log('📷 Instagram posting using Firebase tokens...');
      
      // Get page token from Firebase
      const { ref, get } = await import('firebase/database');
      const { getDatabase } = await import('firebase/database');
      const { initializeApp } = await import('firebase/app');
      const { config } = await import('../config/config.mjs');
      
      const app = initializeApp(config.firebase);
      const db = getDatabase(app, config.firebase.databaseURL);
      
      let pageData, pageAccessToken, actualPageId;
      
      if (pageId) {
        // Use specific page
        const pageRef = ref(db, `connectedPages/admin/${pageId}`);
        const snapshot = await get(pageRef);
        
        if (!snapshot.exists()) {
          throw new Error('Page not found in Firebase');
        }
        
        pageData = snapshot.val();
        pageAccessToken = pageData.accessToken;
        actualPageId = pageData.id;
      } else {
        // Find first active page with Instagram Business Account
        const pagesRef = ref(db, 'connectedPages/admin');
        const pagesSnapshot = await get(pagesRef);
        
        if (!pagesSnapshot.exists()) {
          throw new Error('No Facebook pages connected');
        }
        
        const pages = pagesSnapshot.val();
        const pageWithInstagram = Object.entries(pages).find(([id, data]) => 
          data.active === true && data.instagramBusinessAccount
        );
        
        if (!pageWithInstagram) {
          throw new Error('No active pages with Instagram Business Account found');
        }
        
        pageData = pageWithInstagram[1];
        pageAccessToken = pageData.accessToken;
        actualPageId = pageData.id;
        console.log('🔍 Using page with Instagram:', pageData.name, 'ID:', actualPageId);
      }
      
      // Check if page has Instagram Business Account
      const pageInfoResponse = await axios.get(`https://graph.facebook.com/v23.0/${actualPageId}`, {
        params: {
          fields: 'instagram_business_account',
          access_token: pageAccessToken
        }
      });
      
      const igAccountId = pageInfoResponse.data.instagram_business_account?.id;
      
      if (!igAccountId) {
        throw new Error('Active page does not have Instagram Business Account connected');
      }
      
      console.log('📷 Using Instagram account ID:', igAccountId);

      // Step 1: Create media container
      const imageUrl = content.imageUrl || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&crop=center';
      
      const mediaData = {
        image_url: imageUrl,
        caption: `${content.headline}\n\n${content.caption}\n\n${content.hashtag}`,
        access_token: pageAccessToken
      };

      console.log('📷 Creating media container...');
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v23.0/${igAccountId}/media`,
        mediaData
      );

      const creationId = containerResponse.data.id;
      console.log('✅ Media container created:', creationId);

      // Wait a moment before publishing
      console.log('⏳ Waiting 2 seconds before publishing...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Publish the media
      console.log('📤 Publishing media...');
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v23.0/${igAccountId}/media_publish`,
        {
          creation_id: creationId,
          access_token: pageAccessToken
        }
      );

      console.log('✅ Instagram post published successfully!');
      return {
        success: true,
        platform: 'instagram',
        postId: publishResponse.data.id,
        message: 'Posted successfully to Instagram',
        data: publishResponse.data,
        instagramAccountId: igAccountId
      };

    } catch (error) {
      console.error('❌ Instagram error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
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

  // Twitter posting using OAuth 2.0 user tokens from Firebase
  async postToTwitter(content, accountId = null) {
    try {
      console.log('🐦 Twitter posting using OAuth 2.0 user tokens from Firebase...');
      
      // Get Twitter account token from Firebase
      const { ref, get } = await import('firebase/database');
      const { getDatabase } = await import('firebase/database');
      const { initializeApp } = await import('firebase/app');
      const { config } = await import('../config/config.mjs');
      
      const app = initializeApp(config.firebase);
      const db = getDatabase(app, config.firebase.databaseURL);
      
      let accessToken;
      
      if (accountId) {
        // Use specific account
        const accountRef = ref(db, `connectedAccounts/admin/twitter/${accountId}`);
        const snapshot = await get(accountRef);
        
        if (!snapshot.exists()) {
          throw new Error('Twitter account not found');
        }
        
        accessToken = snapshot.val().accessToken;
      } else {
        // Use first available account
        const accountsRef = ref(db, 'connectedAccounts/admin/twitter');
        const snapshot = await get(accountsRef);
        
        if (!snapshot.exists()) {
          throw new Error('No Twitter accounts connected. Please connect a Twitter account first.');
        }
        
        const accounts = Object.values(snapshot.val());
        accessToken = accounts[0].accessToken;
      }
      
      if (!accessToken) {
        throw new Error('No Twitter access token available');
      }
      
      const tweetText = content.caption.length <= 280 
        ? `${content.caption} ${content.hashtag}`
        : `${content.caption.substring(0, 240)}... ${content.hashtag}`;

      const tweetData = {
        text: tweetText
      };

      console.log('📡 Posting tweet with OAuth 2.0...');
      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        tweetData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
      throw new Error(`Twitter posting failed: ${error.response?.data?.detail || error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  // Generate OAuth 1.0a header
  generateOAuthHeader(method, url, params = {}) {
    const oauthParams = {
      oauth_consumer_key: this.twitter.apiKey,
      oauth_token: this.twitter.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_version: '1.0'
    };

    const allParams = { ...params, ...oauthParams };
    const paramString = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');

    const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    const signingKey = `${encodeURIComponent(this.twitter.apiSecret)}&${encodeURIComponent(this.twitter.accessTokenSecret)}`;
    const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
    
    oauthParams.oauth_signature = signature;

    return 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');
  }

  // Upload media to Twitter using working multipart approach
  async uploadTwitterMedia(imageUrl) {
    try {
      console.log('📷 Downloading image from:', imageUrl);
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);
      
      console.log('📎 Image size:', Math.round(imageBuffer.length / 1024), 'KB');

      // Generate OAuth for media upload
      const oauthParams = {
        oauth_consumer_key: process.env.TWITTER_API_KEY,
        oauth_token: process.env.TWITTER_ACCESS_TOKEN,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_nonce: crypto.randomBytes(16).toString('hex'),
        oauth_version: '1.0'
      };

      const paramString = Object.keys(oauthParams)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
        .join('&');

      const signatureBaseString = `POST&${encodeURIComponent('https://upload.twitter.com/1.1/media/upload.json')}&${encodeURIComponent(paramString)}`;
      const signingKey = `${encodeURIComponent(process.env.TWITTER_API_SECRET)}&${encodeURIComponent(process.env.TWITTER_ACCESS_TOKEN_SECRET)}`;
      const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
      
      oauthParams.oauth_signature = signature;

      const oauth = 'OAuth ' + Object.keys(oauthParams)
        .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
        .join(', ');

      // Use multipart form data
      const formData = new FormData();
      formData.append('media', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
      
      console.log('📡 Uploading to Twitter media endpoint...');
      const uploadResponse = await axios.post(
        'https://upload.twitter.com/1.1/media/upload.json',
        formData,
        {
          headers: {
            'Authorization': oauth,
            ...formData.getHeaders()
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

  // Post to multiple platforms using Firebase tokens
  async postToMultiplePlatforms(content, platforms, pageId, twitterAccountId = null) {
    const results = [];

    for (const platform of platforms) {
      try {
        let result;

        switch (platform.name) {
          case 'facebook':
            result = await this.postToFacebook(content, pageId);
            break;

          case 'instagram':
            result = await this.postToInstagram(content, pageId);
            break;

          case 'twitter':
            result = await this.postToTwitter(content, twitterAccountId);
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