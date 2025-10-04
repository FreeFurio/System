import axios from 'axios';

class InsightsService {
  async getPageInsights() {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    console.log('🔍 Page Basic Info Debug:');
    console.log('Page ID:', pageId);
    console.log('Access Token:', accessToken ? 'SET' : 'MISSING');
    
    if (!pageId || !accessToken) {
      throw new Error('Missing Facebook credentials in environment variables');
    }
    
    const url = `https://graph.facebook.com/v18.0/${pageId}`;
    
    try {
      const response = await axios.get(url, {
        params: {
          fields: 'name,fan_count,talking_about_count,category,followers_count',
          access_token: accessToken
        }
      });
      
      return {
        pageName: response.data.name || 'Test Marketing',
        fanCount: response.data.fan_count || response.data.followers_count || 0,
        talkingAbout: response.data.talking_about_count || 0
      };
    } catch (error) {
      console.error('❌ Page Info Error:', error.response?.data || error.message);
      // Return basic info for new pages
      return {
        pageName: 'Test Marketing',
        fanCount: 0,
        talkingAbout: 0
      };
    }
  }

  async getInstagramInsights() {
    const instagramAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;
    
    console.log('🔍 Instagram Basic Info Debug:');
    console.log('Instagram Account ID:', instagramAccountId);
    console.log('Access Token:', accessToken ? 'SET' : 'MISSING');
    
    if (!accessToken) {
      throw new Error('Missing access token');
    }
    
    // Try to get Instagram account from Facebook page first
    try {
      const pageResponse = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
        params: {
          fields: 'instagram_business_account',
          access_token: accessToken
        }
      });
      
      const igAccountId = pageResponse.data.instagram_business_account?.id || instagramAccountId;
      
      if (!igAccountId) {
        // Return default data for pages without Instagram
        return {
          accountName: 'No Instagram Connected',
          followersCount: 0,
          mediaCount: 0
        };
      }
      
      const response = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}`, {
        params: {
          fields: 'name,username,followers_count,media_count',
          access_token: accessToken
        }
      });
      
      return {
        accountName: response.data.name || response.data.username || 'Instagram Account',
        followersCount: response.data.followers_count || 0,
        mediaCount: response.data.media_count || 0
      };
    } catch (error) {
      console.error('❌ Instagram Info Error:', error.response?.data || error.message);
      // Return default data instead of throwing error
      return {
        accountName: 'Instagram Not Available',
        followersCount: 0,
        mediaCount: 0
      };
    }
  }

  async getPostEngagement(postId, accessToken) {
    const url = `https://graph.facebook.com/v18.0/${postId}`;
    
    try {
      const response = await axios.get(url, {
        params: {
          fields: 'likes.summary(true),comments.summary(true),shares',
          access_token: accessToken
        }
      });
      
      return {
        likes: response.data.likes?.summary?.total_count || 0,
        comments: response.data.comments?.summary?.total_count || 0,
        shares: response.data.shares?.count || 0
      };
    } catch (error) {
      throw new Error(`Failed to fetch post engagement: ${error.message}`);
    }
  }

  async getAccountInfo() {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const url = `https://graph.facebook.com/v18.0/${pageId}`;
    
    try {
      const response = await axios.get(url, {
        params: {
          fields: 'name,category,followers_count,instagram_business_account',
          access_token: accessToken
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch account info: ${error.message}`);
    }
  }

  async getPageAccessToken() {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const userToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN; // This is actually a user token
    
    console.log('🔍 Getting Page access token...');
    
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          access_token: userToken
        }
      });
      
      console.log('📋 Available accounts:', response.data.data.map(acc => ({ id: acc.id, name: acc.name })));
      console.log('🔍 Looking for page ID:', pageId);
      
      const page = response.data.data.find(account => account.id === pageId);
      if (!page) {
        console.log('⚠️ Page not found, available IDs:', response.data.data.map(acc => acc.id));
        throw new Error('Page not found in user accounts');
      }
      
      console.log('✅ Page access token retrieved');
      return page.access_token;
    } catch (error) {
      console.error('❌ Page Token Error:', error.response?.data || error.message);
      throw new Error(`Failed to get page token: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getRecentPostsEngagement() {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const userToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    console.log('🔍 Fetching recent posts engagement...');
    
    if (!pageId) {
      throw new Error('Missing Facebook page ID');
    }
    
    const url = `https://graph.facebook.com/v18.0/${pageId}/posts`;
    
    try {
      const response = await axios.get(url, {
        params: {
          fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
          limit: 5,
          access_token: userToken
        }
      });
      
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      
      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach(post => {
          totalLikes += post.likes?.summary?.total_count || 0;
          totalComments += post.comments?.summary?.total_count || 0;
          totalShares += post.shares?.count || 0;
        });
      }
      
      return {
        totalLikes,
        totalComments,
        totalShares,
        postsCount: response.data.data?.length || 0
      };
    } catch (error) {
      console.error('❌ Posts Engagement Error:', error.response?.data || error.message);
      // Return zero engagement for new pages
      return {
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        postsCount: 0
      };
    }
  }

  async getInstagramPostsEngagement() {
    const instagramAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;
    
    console.log('🔍 Fetching Instagram posts engagement...');
    
    if (!accessToken) {
      throw new Error('Missing access token');
    }
    
    try {
      // Try to get Instagram account from Facebook page first
      const pageResponse = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
        params: {
          fields: 'instagram_business_account',
          access_token: accessToken
        }
      });
      
      const igAccountId = pageResponse.data.instagram_business_account?.id || instagramAccountId;
      
      if (!igAccountId) {
        // Return zero engagement for pages without Instagram
        return {
          totalLikes: 0,
          totalComments: 0,
          postsCount: 0
        };
      }
      
      const response = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}/media`, {
        params: {
          fields: 'id,like_count,comments_count,media_type',
          limit: 5,
          access_token: accessToken
        }
      });
      
      let totalLikes = 0;
      let totalComments = 0;
      
      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach(post => {
          totalLikes += post.like_count || 0;
          totalComments += post.comments_count || 0;
        });
      }
      
      return {
        totalLikes,
        totalComments,
        postsCount: response.data.data?.length || 0
      };
    } catch (error) {
      console.error('❌ Instagram Posts Error:', error.response?.data || error.message);
      // Return zero engagement instead of throwing error
      return {
        totalLikes: 0,
        totalComments: 0,
        postsCount: 0
      };
    }
  }

  async generateFacebookAuthUrl() {
    const appId = process.env.FB_APP_ID;
    const redirectUri = process.env.FB_REDIRECT_URI || 'http://localhost:3000/auth/facebook/callback';
    
    if (!appId) {
      throw new Error('Missing FB_APP_ID in environment variables');
    }
    
    const scopes = 'pages_manage_posts,pages_read_engagement,pages_show_list,publish_to_groups';
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
    
    return authUrl;
  }

  async exchangeCodeForToken(authCode) {
    const appId = process.env.FB_APP_ID;
    const appSecret = process.env.FB_APP_SECRET;
    const redirectUri = process.env.FB_REDIRECT_URI || 'http://localhost:3000/auth/facebook/callback';
    
    if (!appId || !appSecret) {
      throw new Error('Missing Facebook app credentials');
    }
    
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code: authCode
        }
      });
      
      return response.data.access_token;
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getAllPageTokens(userAccessToken) {
    console.log('🔍 Fetching all Facebook pages and their tokens...');
    
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          access_token: userAccessToken,
          fields: 'id,name,access_token,category,tasks'
        }
      });
      
      const pages = response.data.data.map(page => ({
        pageId: page.id,
        pageName: page.name,
        category: page.category,
        pageAccessToken: page.access_token,
        permissions: page.tasks || []
      }));
      
      console.log('✅ Found', pages.length, 'pages');
      pages.forEach((page, index) => {
        console.log(`\n📄 Page ${index + 1}:`);
        console.log(`   Name: ${page.pageName}`);
        console.log(`   ID: ${page.pageId}`);
        console.log(`   Category: ${page.category}`);
        console.log(`   Token: ${page.pageAccessToken.substring(0, 20)}...`);
      });
      
      return pages;
    } catch (error) {
      throw new Error(`Failed to fetch pages: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async setupFacebookPageTokens() {
    console.log('🚀 Facebook Page Token Setup\n');
    
    const authUrl = await this.generateFacebookAuthUrl();
    console.log('📋 Step 1: Visit this URL to authorize:');
    console.log(authUrl);
    console.log('\n⏳ After authorization, you will get a code parameter in the callback URL');
    
    return {
      authUrl,
      instructions: 'Visit the URL, authorize the app, then use the code from callback to get tokens'
    };
  }
}

export default new InsightsService();