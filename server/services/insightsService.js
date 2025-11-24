import axios from 'axios';

class InsightsService {
  // Check if Twitter API call is allowed (15-minute rate limit) - Firebase version
  async isTwitterCallAllowed() {
    try {
      const { ref, get } = await import('firebase/database');
      const { getDatabase } = await import('firebase/database');
      const { initializeApp } = await import('firebase/app');
      const { config } = await import('../config/config.mjs');
      
      const app = initializeApp(config.firebase);
      const db = getDatabase(app, config.firebase.databaseURL);
      
      const rateLimitRef = ref(db, 'twitterRateLimit/admin/lastCall');
      const snapshot = await get(rateLimitRef);
      
      if (!snapshot.exists()) {
        return true;
      }
      
      const lastCall = snapshot.val();
      const now = Date.now();
      const timeSinceLastCall = (now - lastCall) / (1000 * 60); // minutes
      
      return timeSinceLastCall >= 15;
    } catch (error) {
      console.error('Error checking Twitter rate limit:', error);
      return true; // Allow on error
    }
  }
  
  // Update Twitter rate limit timestamp - Firebase version
  async updateTwitterRateLimit() {
    try {
      const { ref, set } = await import('firebase/database');
      const { getDatabase } = await import('firebase/database');
      const { initializeApp } = await import('firebase/app');
      const { config } = await import('../config/config.mjs');
      
      const app = initializeApp(config.firebase);
      const db = getDatabase(app, config.firebase.databaseURL);
      
      const rateLimitRef = ref(db, 'twitterRateLimit/admin/lastCall');
      await set(rateLimitRef, Date.now());
    } catch (error) {
      console.error('Error updating Twitter rate limit:', error);
    }
  }
  
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
        pageName: response.data.name,
        fanCount: response.data.fan_count || response.data.followers_count || 0,
        talkingAbout: response.data.talking_about_count || 0
      };
    } catch (error) {
      console.error('❌ Page Info Error:', error.response?.data || error.message);
      throw error;
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
        throw new Error('No Instagram account connected to this Facebook page');
      }
      
      const response = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}`, {
        params: {
          fields: 'name,username,followers_count,media_count',
          access_token: accessToken
        }
      });
      
      return {
        accountName: response.data.name || response.data.username,
        followersCount: response.data.followers_count || 0,
        mediaCount: response.data.media_count || 0
      };
    } catch (error) {
      console.error('❌ Instagram Info Error:', error.response?.data || error.message);
      throw error;
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
    console.log('🔍 Fetching recent posts engagement using working method...');
    
    try {
      // Use Firebase like the working admin method
      const { ref, get } = await import('firebase/database');
      const { getDatabase } = await import('firebase/database');
      const { initializeApp } = await import('firebase/app');
      const { config } = await import('../config/config.mjs');
      
      const app = initializeApp(config.firebase);
      const db = getDatabase(app, config.firebase.databaseURL);
      
      const connectedPagesRef = ref(db, 'connectedPages/admin');
      const snapshot = await get(connectedPagesRef);
      
      if (!snapshot.exists()) {
        return { totalReactions: 0, totalComments: 0, totalShares: 0, postsCount: 0 };
      }
      
      const pages = Object.values(snapshot.val());
      const reactionBreakdown = {
        like: 0,
        love: 0,
        wow: 0,
        haha: 0,
        angry: 0,
        sad: 0
      };
      let totalComments = 0;
      let totalShares = 0;
      let totalPosts = 0;
      
      for (const page of pages) {
        try {
          console.log(`🔍 Getting posts with detailed reactions for: ${page.name}`);
          
          const response = await axios.get(`https://graph.facebook.com/v23.0/${page.id}/posts`, {
            params: {
              fields: 'id,message,reactions.summary(true),comments.summary(true),shares',
              limit: 10,
              access_token: page.accessToken
            }
          });
          
          const posts = response.data.data || [];
          totalPosts += posts.length;
          
          // Get detailed reactions for each post
          for (const post of posts) {
            try {
              const reactionTypes = ['LIKE', 'LOVE', 'WOW', 'HAHA', 'ANGRY', 'SAD'];
              
              for (const type of reactionTypes) {
                try {
                  const reactionResponse = await axios.get(`https://graph.facebook.com/v23.0/${post.id}/reactions`, {
                    params: {
                      type: type,
                      limit: 0,
                      summary: true,
                      access_token: page.accessToken
                    }
                  });
                  const count = reactionResponse.data.summary?.total_count || 0;
                  reactionBreakdown[type.toLowerCase()] += count;
                } catch (err) {
                  // Skip failed reaction types
                }
              }
              
              totalComments += post.comments?.summary?.total_count || 0;
              totalShares += post.shares?.count || 0;
            } catch (err) {
              // Skip failed posts
            }
          }
          
        } catch (error) {
          console.error(`❌ Error fetching posts for page ${page.id}:`, error.response?.data || error.message);
        }
      }
      
      const totalReactions = Object.values(reactionBreakdown).reduce((sum, count) => sum + count, 0);
      console.log(`✅ Reaction breakdown:`, reactionBreakdown);
      console.log(`✅ Total reactions: ${totalReactions}`);
      
      return {
        totalReactions,
        reactionBreakdown,
        totalComments,
        totalShares,
        postsCount: totalPosts
      };
    } catch (error) {
      console.error('❌ Posts Engagement Error:', error.message);
      throw error;
    }
  }

  async getHistoricalPostsEngagement() {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const userToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    console.log('🔍 Fetching historical posts engagement...');
    
    if (!pageId) {
      throw new Error('Missing Facebook page ID');
    }
    
    const url = `https://graph.facebook.com/v18.0/${pageId}/posts`;
    
    try {
      const response = await axios.get(url, {
        params: {
          fields: 'id,message,created_time,reactions.summary(true),comments.summary(true),shares',
          limit: 10,
          access_token: userToken
        }
      });
      
      const posts = [];
      
      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach(post => {
          const createdDate = new Date(post.created_time);
          const totalEngagement = (post.reactions?.summary?.total_count || 0) + 
                                 (post.comments?.summary?.total_count || 0) + 
                                 (post.shares?.count || 0);
          
          posts.push({
            date: createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            total: totalEngagement,
            reactions: post.reactions?.summary?.total_count || 0,
            comments: post.comments?.summary?.total_count || 0,
            shares: post.shares?.count || 0
          });
        });
      }
      
      return posts.reverse(); // Oldest first for timeline
    } catch (error) {
      console.error('❌ Historical Posts Error:', error.response?.data || error.message);
      throw error;
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
        throw new Error('No Instagram account connected to this Facebook page');
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
      throw error;
    }
  }

  async getHistoricalInstagramEngagement() {
    const instagramAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;
    
    console.log('🔍 Fetching historical Instagram engagement...');
    
    if (!accessToken) {
      throw new Error('Missing access token');
    }
    
    try {
      const pageResponse = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
        params: {
          fields: 'instagram_business_account',
          access_token: accessToken
        }
      });
      
      const igAccountId = pageResponse.data.instagram_business_account?.id || instagramAccountId;
      
      if (!igAccountId) {
        throw new Error('No Instagram account connected to this Facebook page');
      }
      
      const response = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}/media`, {
        params: {
          fields: 'id,like_count,comments_count,media_type,timestamp',
          limit: 10,
          access_token: accessToken
        }
      });
      
      const posts = [];
      
      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach(post => {
          const createdDate = new Date(post.timestamp);
          const totalEngagement = (post.like_count || 0) + (post.comments_count || 0);
          
          posts.push({
            date: createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            total: totalEngagement,
            likes: post.like_count || 0,
            comments: post.comments_count || 0
          });
        });
      }
      
      return posts.reverse(); // Oldest first for timeline
    } catch (error) {
      console.error('❌ Historical Instagram Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getDebugData() {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    
    // Get token from Firebase like the working admin method
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const pageRef = ref(db, `connectedPages/admin/${pageId}`);
    const snapshot = await get(pageRef);
    
    if (!snapshot.exists()) {
      throw new Error('Account not found in Firebase');
    }
    
    const pageData = snapshot.val();
    const accessToken = pageData.accessToken;
    
    let fbPageResponse = null;
    let fbInsightsResponse = null;
    
    try {
      // Facebook Page Data - Basic Fields
      fbPageResponse = await axios.get(`https://graph.facebook.com/v23.0/${pageId}`, {
        params: {
          fields: 'id,name,category,fan_count,followers_count,talking_about_count,website,about,instagram_business_account',
          access_token: accessToken
        }
      });
    } catch (fbPageError) {
      console.error('❌ Facebook Page Error:', fbPageError.message);
    }
    
    try {
      // Facebook Posts Data - Same as working admin method
      fbInsightsResponse = await axios.get(`https://graph.facebook.com/v23.0/${pageId}/posts`, {
        params: {
          fields: 'likes.summary(true),comments.summary(true),shares',
          limit: 10,
          access_token: accessToken
        }
      });
    } catch (fbInsightsError) {
      console.error('❌ Facebook Posts Error:', fbInsightsError.message);
    }
    
    // Use posts data as page insights like the working admin method
    const fbPageInsightsResponse = fbInsightsResponse;
    
    let fbPageSettingsResponse = null;
    try {
      // Facebook Page Settings - From management documentation
      fbPageSettingsResponse = await axios.get(`https://graph.facebook.com/v23.0/${pageId}/settings`, {
        params: {
          access_token: accessToken
        }
      });
    } catch (fbPageSettingsError) {
      console.error('❌ Facebook Page Settings Error:', fbPageSettingsError.message);
    }
    
    let fbPageRolesResponse = null;
    try {
      // Facebook Page Roles - From management documentation
      fbPageRolesResponse = await axios.get(`https://graph.facebook.com/v23.0/${pageId}/roles`, {
        params: {
          access_token: accessToken
        }
      });
    } catch (fbPageRolesError) {
      console.error('❌ Facebook Page Roles Error:', fbPageRolesError.message);
    }
      

      

      

      
      let instagramData = null;
      const igAccountId = fbPageResponse?.data?.instagram_business_account?.id;
      
      if (igAccountId) {
        let igAccountResponse = null;
        let igMediaResponse = null;
        let igInsightsResponse = null;
        
        try {
          // Instagram Account Data
          igAccountResponse = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}`, {
            params: {
              fields: 'id,name,username,followers_count,follows_count,media_count,profile_picture_url,biography,website',
              access_token: accessToken
            }
          });
        } catch (igAccountError) {
          console.error('❌ Instagram Account Error:', igAccountError.message);
        }
        
        try {
          // Instagram Media Data - Basic Fields
          igMediaResponse = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}/media`, {
            params: {
              fields: 'id,media_type,timestamp,caption,like_count,comments_count',
              limit: 5,
              access_token: accessToken
            }
          });
        } catch (igMediaError) {
          console.error('❌ Instagram Media Error:', igMediaError.message);
        }
        
        try {
          // Instagram Account Insights - Documented Valid Metrics
          igInsightsResponse = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}/insights`, {
            params: {
              metric: 'impressions,reach,profile_views',
              period: 'day',
              access_token: accessToken
            }
          });
        } catch (igInsightsError) {
          console.error('❌ Instagram Insights Error:', igInsightsError.message);
        }
        
        instagramData = {
          account: igAccountResponse?.data || {},
          media: igMediaResponse?.data?.data || [],
          insights: igInsightsResponse?.data?.data || []
        };
      }
      
    return {
      facebook: {
        page: fbPageResponse?.data || {},
        posts: fbInsightsResponse?.data?.data || [],
        pageInsights: fbPageInsightsResponse?.data?.data || [],
        settings: fbPageSettingsResponse?.data?.data || [],
        roles: fbPageRolesResponse?.data?.data || []
      },
      instagram: instagramData
    };
  }

  async generateFacebookAuthUrl() {
    const appId = process.env.FB_APP_ID;
    const redirectUri = process.env.FB_REDIRECT_URI || 'http://localhost:3000/auth/facebook/callback';
    
    if (!appId) {
      throw new Error('Missing FB_APP_ID in environment variables');
    }
    
    const scopes = 'pages_manage_posts,pages_manage_engagement,pages_read_engagement,pages_read_user_engagement,pages_show_list,publish_to_groups,publish_video';
    const authUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
    
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
      const response = await axios.get('https://graph.facebook.com/v23.0/oauth/access_token', {
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
      const response = await axios.get('https://graph.facebook.com/v23.0/me/accounts', {
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

  async getAccountSpecificEngagement(accountId) {
    try {
      const { ref, get } = await import('firebase/database');
      const { getDatabase } = await import('firebase/database');
      const { initializeApp } = await import('firebase/app');
      const { config } = await import('../config/config.mjs');
      
      // Use a consistent Firebase app instance
      let app;
      try {
        app = (await import('firebase/app')).getApp();
      } catch {
        app = initializeApp(config.firebase);
      }
      const db = getDatabase(app, config.firebase.databaseURL);
      
      const pageRef = ref(db, `connectedPages/admin/${accountId}`);
      const snapshot = await get(pageRef);
      
      if (!snapshot.exists()) {
        throw new Error('Account not found');
      }
      
      const pageData = snapshot.val();
      const accessToken = pageData.accessToken;
      
      console.log(`🔍 Getting detailed reactions for page: ${pageData.name}`);
      
      // Get Facebook posts with detailed reactions using working method
      const fbResponse = await axios.get(`https://graph.facebook.com/v23.0/${accountId}/posts`, {
        params: {
          fields: 'id,message,created_time,reactions.summary(true),comments.summary(true),shares',
          limit: 100,
          access_token: accessToken
        }
      });
      
      const fbPosts = fbResponse.data.data || [];
      
      // Get real page metrics
      const pageMetricsResponse = await axios.get(`https://graph.facebook.com/v23.0/${accountId}`, {
        params: {
          fields: 'fan_count,followers_count,talking_about_count',
          access_token: accessToken
        }
      });
      
      // Calculate total reactions using working post-level method
      const reactionBreakdown = {
        like: 0,
        love: 0,
        wow: 0,
        haha: 0,
        angry: 0,
        sad: 0
      };
      let totalComments = 0, totalShares = 0;
      
      // Use Facebook Batch API to get all reactions in fewer requests
      const batchRequests = [];
      const reactionTypes = ['LIKE', 'LOVE', 'WOW', 'HAHA', 'ANGRY', 'SAD'];
      
      console.log(`📊 Processing ${fbPosts.length} posts for detailed engagement:`);
      fbPosts.forEach((post, postIndex) => {
        const postComments = post.comments?.summary?.total_count || 0;
        const postShares = post.shares?.count || 0;
        const postReactions = post.reactions?.summary?.total_count || 0;
        
        console.log(`   Post ${postIndex + 1}: ${postReactions} reactions, ${postComments} comments, ${postShares} shares`);
        
        reactionTypes.forEach(type => {
          batchRequests.push({
            method: 'GET',
            relative_url: `${post.id}/reactions?type=${type}&limit=0&summary=true`
          });
        });
        totalComments += postComments;
        totalShares += postShares;
      });
      
      console.log(`📊 Initial totals: ${totalComments} comments, ${totalShares} shares`);
      
      // Process batch requests in chunks of 50
      const batchSize = 50;
      for (let i = 0; i < batchRequests.length; i += batchSize) {
        const batch = batchRequests.slice(i, i + batchSize);
        
        try {
          const batchResponse = await axios.post(`https://graph.facebook.com/v23.0/`, {
            batch: JSON.stringify(batch),
            access_token: accessToken
          });
          
          batchResponse.data.forEach((response, index) => {
            if (response.code === 200) {
              const data = JSON.parse(response.body);
              const count = data.summary?.total_count || 0;
              const requestIndex = i + index;
              const typeIndex = requestIndex % 6;
              const type = reactionTypes[typeIndex].toLowerCase();
              reactionBreakdown[type] += count;
            }
          });
        } catch (err) {
          console.error('Batch request failed:', err.message);
        }
      }
      
      const totalReactions = Object.values(reactionBreakdown).reduce((sum, count) => sum + count, 0);
      console.log(`✅ Total reactions for ${pageData.name}:`, totalReactions, reactionBreakdown);
      
      // Calculate page engagement (Page Insights API returns empty data)
      const totalEngagement = totalReactions + totalComments + totalShares;
      console.log(`🔥 TOTAL ENGAGEMENT: ${totalReactions} reactions + ${totalComments} comments + ${totalShares} shares = ${totalEngagement}`);
      const engagementViews = Math.round(totalEngagement * 15);
      const followerViews = Math.round((pageMetricsResponse.data.followers_count || 0) * 0.2);
      const pageViews = Math.max(engagementViews + followerViews, 50);
      
      console.log(`📊 Page Engagement Calculation:`);
      console.log(`   - Total Engagement: ${totalEngagement}`);
      console.log(`   - Engagement Views: ${engagementViews}`);
      console.log(`   - Follower Views: ${followerViews}`);
      console.log(`   - Combined: ${pageViews}`);
      
      // Get most recent post with detailed reaction breakdown
      let recentPost = null;
      let topPost = null;
      
      if (fbPosts.length > 0) {
        const mostRecentPost = fbPosts[0]; // Posts are ordered by created_time desc
        try {
          // Get detailed reactions for the most recent post
          const postReactionBreakdown = {
            like: 0,
            love: 0,
            wow: 0,
            haha: 0,
            angry: 0,
            sad: 0
          };
          
          const reactionTypes = ['LIKE', 'LOVE', 'WOW', 'HAHA', 'ANGRY', 'SAD'];
          for (const type of reactionTypes) {
            try {
              const reactionResponse = await axios.get(`https://graph.facebook.com/v23.0/${mostRecentPost.id}/reactions`, {
                params: {
                  type: type,
                  limit: 0,
                  summary: true,
                  access_token: accessToken
                }
              });
              const count = reactionResponse.data.summary?.total_count || 0;
              postReactionBreakdown[type.toLowerCase()] = count;
            } catch (err) {
              // Skip failed reaction types
            }
          }
          
          recentPost = {
            id: mostRecentPost.id,
            message: mostRecentPost.message || 'No message',
            createdTime: mostRecentPost.created_time,
            reactions: mostRecentPost.reactions?.summary?.total_count || 0,
            comments: mostRecentPost.comments?.summary?.total_count || 0,
            shares: mostRecentPost.shares?.count || 0,
            detailedReactions: postReactionBreakdown
          };
          
          console.log(`✅ Recent post reactions:`, postReactionBreakdown);
        } catch (recentPostError) {
          console.log(`Could not get recent post reactions:`, recentPostError.message);
        }
        
        // Find post with highest engagement
        let highestEngagement = 0;
        let highestPost = null;
        
        fbPosts.forEach(post => {
          const engagement = (post.reactions?.summary?.total_count || 0) + 
                           (post.comments?.summary?.total_count || 0) + 
                           (post.shares?.count || 0);
          if (engagement > highestEngagement) {
            highestEngagement = engagement;
            highestPost = post;
          }
        });
        
        if (highestPost) {
          try {
            const topPostReactionBreakdown = {
              like: 0,
              love: 0,
              wow: 0,
              haha: 0,
              angry: 0,
              sad: 0
            };
            
            const reactionTypes = ['LIKE', 'LOVE', 'WOW', 'HAHA', 'ANGRY', 'SAD'];
            for (const type of reactionTypes) {
              try {
                const reactionResponse = await axios.get(`https://graph.facebook.com/v23.0/${highestPost.id}/reactions`, {
                  params: {
                    type: type,
                    limit: 0,
                    summary: true,
                    access_token: accessToken
                  }
                });
                const count = reactionResponse.data.summary?.total_count || 0;
                topPostReactionBreakdown[type.toLowerCase()] = count;
              } catch (err) {
                // Skip failed reaction types
              }
            }
            
            topPost = {
              id: highestPost.id,
              message: highestPost.message || 'No message',
              createdTime: highestPost.created_time,
              reactions: highestPost.reactions?.summary?.total_count || 0,
              comments: highestPost.comments?.summary?.total_count || 0,
              shares: highestPost.shares?.count || 0,
              detailedReactions: topPostReactionBreakdown
            };
            
            console.log(`✅ Top post (${highestEngagement} engagement):`, topPostReactionBreakdown);
          } catch (topPostError) {
            console.log(`Could not get top post reactions:`, topPostError.message);
          }
        }
      }
      
      // Get historical data from Firebase and add today's data
      let historicalData = [];
      const currentTimestamp = new Date();
      const currentDateKey = currentTimestamp.toDateString();
      
      try {
        const { push } = await import('firebase/database');
        
        // Check cached insights first, then fallback to original paths
        const possiblePaths = [
          `cachedInsights/admin/account/${accountId}/data/facebook/historicalData`,
          `connectedPages/admin/${accountId}/data/facebook/historicalData`,
          `${accountId}/data/facebook/historicalData`,
          `connectedPages/${accountId}/data/facebook/historicalData`
        ];
        
        let existingHistory = {};
        let historyRef;
        let actualPath = '';
        
        for (const path of possiblePaths) {
          console.log(`🔍 CHECKING PATH: ${path}`);
          const testRef = ref(db, path);
          const testSnapshot = await get(testRef);
          
          if (testSnapshot.exists()) {
            console.log(`✅ FOUND DATA AT: ${path}`);
            console.log(`✅ DATA:`, JSON.stringify(testSnapshot.val(), null, 2));
            existingHistory = testSnapshot.val();
            historyRef = testRef;
            actualPath = path;
            break;
          } else {
            console.log(`❌ NO DATA AT: ${path}`);
          }
        }
        
        // If no existing data found, use the primary path
        if (!historyRef) {
          actualPath = `connectedPages/admin/${accountId}/data/facebook/historicalData`;
          historyRef = ref(db, actualPath);
          console.log(`🔍 NO EXISTING DATA FOUND, USING: ${actualPath}`);
        }
        
        console.log(`🔍 FINAL PATH: ${actualPath}`);
        
        // Handle both array and object formats for checking existing entries
        const historyEntries = Array.isArray(existingHistory) ? existingHistory : Object.values(existingHistory);
        console.log(`🔍 FOUND ${historyEntries.length} EXISTING ENTRIES`);
        
        // DEBUG: Log existing history structure
        console.log(`🔍 FINAL HISTORY COUNT: ${historyEntries.length}`);
        console.log(`🔍 EXISTING DATES: ${historyEntries.map(e => e?.dateKey || 'NO_DATE_KEY').join(', ')}`);
        
        // Check if today's entry already exists
        const todayExists = historyEntries.some(entry => entry?.dateKey === currentDateKey);
        console.log(`🔍 TODAY CHECK - Date: ${currentDateKey}, Exists: ${todayExists}`);
        
        if (!todayExists) {
          const todayData = {
            dateKey: currentDateKey,
            date: currentTimestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: currentTimestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: currentTimestamp.toISOString(),
            total: totalEngagement
          };
          
          console.log(`🔍 ADDING NEW ENTRY:`, todayData);
          const { set } = await import('firebase/database');
          const newEntryRef = ref(db, `${actualPath}/${Date.now()}`);
          await set(newEntryRef, todayData);
          console.log(`✅ Added new history entry: ${currentDateKey}`);
        } else {
          console.log(`📅 Today's entry already exists: ${currentDateKey}`);
        }
        
        // Get updated history for display
        const updatedSnapshot = await get(historyRef);
        const updatedHistory = updatedSnapshot.val() || {};
        
        // Handle both array and object formats for logging
        const updatedEntries = Array.isArray(updatedHistory) ? updatedHistory : Object.values(updatedHistory);
        console.log(`🔍 AFTER PUSH - Updated history count: ${updatedEntries.length}`);
        console.log(`🔍 AFTER PUSH - Updated dates: ${updatedEntries.map(e => e.dateKey).join(', ')}`);
        
        // Handle both array (cached) and object (original) formats
        const historyData = updatedHistory;
        if (Array.isArray(historyData)) {
          historicalData = historyData
            .filter(point => point && typeof point === 'object' && point.timestamp)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .slice(-30);
        } else {
          historicalData = Object.values(historyData)
            .filter(point => point && typeof point === 'object' && point.timestamp)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .slice(-30);
        }
        
        console.log(`📊 FINAL - Total history entries: ${historicalData.length}`);
        console.log(`📊 FINAL - History dates: ${historicalData.map(h => h?.dateKey || 'NO_DATE').join(', ')}`);
        
      } catch (historyError) {
        console.error('❌ HISTORY ERROR:', historyError.message);
        console.error('❌ HISTORY ERROR STACK:', historyError.stack);
      }
      
      const fbEngagement = {
        totalReactions,
        reactionBreakdown,
        totalComments,
        totalShares,
        postsCount: fbPosts.length,
        pageViews, // Keep as pageViews for backward compatibility
        pageEngagement: pageViews, // Add new field with clearer name
        pageLikes: pageMetricsResponse.data.fan_count || 0,
        followers: pageMetricsResponse.data.followers_count || 0,
        recentEngagement: pageMetricsResponse.data.talking_about_count || 0,
        historicalData: historicalData,
        recentPost: recentPost,
        topPost: topPost
      };
      
      // Check for Instagram account
      let igEngagement = null;
      try {
        const pageInfoResponse = await axios.get(`https://graph.facebook.com/v23.0/${accountId}`, {
          params: {
            fields: 'instagram_business_account',
            access_token: accessToken
          }
        });
        
        const igAccountId = pageInfoResponse.data.instagram_business_account?.id;
        
        if (igAccountId) {
          // Get all Instagram posts first
          const igResponse = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}/media`, {
            params: {
              fields: 'id,caption,timestamp,like_count,comments_count,media_type,media_url',
              limit: 100,
              access_token: accessToken
            }
          });
          
          const igPosts = igResponse.data.data || [];
          
          // Calculate totals from posts
          const totalLikes = igPosts.reduce((sum, post) => sum + (post.like_count || 0), 0);
          const totalComments = igPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
          
          // Get Instagram Insights from API for reach, shares, follows
          let igReach = 0, igShares = 0, igFollows = 0;
          try {
            const metricsResponse = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}/insights`, {
              params: {
                metric: 'reach,shares,follows_and_unfollows',
                period: 'day',
                metric_type: 'total_value',
                access_token: accessToken
              }
            });
            
            metricsResponse.data.data.forEach(metric => {
              const value = metric.total_value?.value || 0;
              if (metric.name === 'reach') igReach = value;
              if (metric.name === 'shares') igShares = value;
              if (metric.name === 'follows_and_unfollows') igFollows = value;
            });
            
            console.log('📊 Instagram Metrics:', { igReach, totalLikes, totalComments, igShares, igFollows });
            console.log('📊 Instagram Total Engagement (for history):', totalLikes + totalComments);
          } catch (insightsError) {
            console.log('Could not get Instagram insights:', insightsError.message);
          }
          
          const totalEngagementIG = totalLikes + totalComments; // Use actual post engagement, not API shares
          
          // Find top post (highest engagement)
          let topPost = null;
          let highestEngagement = 0;
          igPosts.forEach(post => {
            const engagement = (post.like_count || 0) + (post.comments_count || 0);
            if (engagement > highestEngagement) {
              highestEngagement = engagement;
              topPost = {
                id: post.id,
                caption: post.caption || 'No caption',
                timestamp: post.timestamp,
                likes: post.like_count || 0,
                comments: post.comments_count || 0
              };
            }
          });
          
          // Find recent post (most recent)
          let recentPost = null;
          if (igPosts.length > 0) {
            const mostRecent = igPosts[0];
            recentPost = {
              id: mostRecent.id,
              caption: mostRecent.caption || 'No caption',
              timestamp: mostRecent.timestamp,
              likes: mostRecent.like_count || 0,
              comments: mostRecent.comments_count || 0
            };
          }
          
          // Get Instagram historical data and add today's entry
          let igHistoricalData = [];
          try {
            const { push } = await import('firebase/database');
            
            // Check cached insights first for Instagram data
            const igHistoryPath = `cachedInsights/admin/account/${accountId}/data/instagram/historicalData`;
            const fallbackIgPath = `connectedPages/admin/${accountId}/data/instagram/historicalData`;
            const igHistoryRef = ref(db, igHistoryPath);
            
            console.log(`🔍 READING IG HISTORICAL DATA FROM: ${igHistoryPath}`);
            let igHistorySnapshot = await get(igHistoryRef);
            let existingIgHistory = {};
            let actualIgPath = igHistoryPath;
            
            if (!igHistorySnapshot.exists()) {
              console.log(`🔍 TRYING FALLBACK IG PATH: ${fallbackIgPath}`);
              const fallbackRef = ref(db, fallbackIgPath);
              const fallbackSnapshot = await get(fallbackRef);
              if (fallbackSnapshot.exists()) {
                existingIgHistory = fallbackSnapshot.val();
                actualIgPath = fallbackIgPath;
              }
            } else {
              existingIgHistory = igHistorySnapshot.val();
            }
            
            // Handle both array and object formats for Instagram history
            const igHistoryEntries = Array.isArray(existingIgHistory) ? existingIgHistory : Object.values(existingIgHistory);
            console.log(`🔍 FOUND ${igHistoryEntries.length} EXISTING IG ENTRIES`);
            
            // DEBUG: Log existing Instagram history structure
            console.log(`🔍 FINAL IG HISTORY COUNT: ${igHistoryEntries.length}`);
            console.log(`🔍 EXISTING IG DATES: ${igHistoryEntries.map(e => e?.dateKey || 'NO_DATE_KEY').join(', ')}`);
            
            // Check if today's Instagram entry already exists
            const todayExists = igHistoryEntries.some(entry => entry?.dateKey === currentDateKey);
            console.log(`🔍 IG TODAY CHECK - Date: ${currentDateKey}, Exists: ${todayExists}`);
            
            if (!todayExists) {
              const todayIgData = {
                dateKey: currentDateKey,
                date: currentTimestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                time: currentTimestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: currentTimestamp.toISOString(),
                total: totalEngagementIG
              };
              
              console.log(`🔍 IG ADDING NEW ENTRY:`, todayIgData);
              const { set } = await import('firebase/database');
              const newIgEntryRef = ref(db, `${actualIgPath}/${Date.now()}`);
              await set(newIgEntryRef, todayIgData);
              console.log(`✅ Added Instagram history entry: ${currentDateKey}`);
            } else {
              // Update today's entry if it has wrong total (0 when should be > 0)
              const todayEntry = igHistoryEntries.find(entry => entry?.dateKey === currentDateKey);
              if (todayEntry && todayEntry.total === 0 && totalEngagementIG > 0) {
                console.log(`🔄 Updating today's IG entry from ${todayEntry.total} to ${totalEngagementIG}`);
                const { set } = await import('firebase/database');
                const todayEntryKey = Object.keys(existingIgHistory).find(key => existingIgHistory[key]?.dateKey === currentDateKey);
                if (todayEntryKey) {
                  const updateRef = ref(db, `${actualIgPath}/${todayEntryKey}`);
                  await set(updateRef, { ...todayEntry, total: totalEngagementIG });
                  console.log(`✅ Updated Instagram history entry for ${currentDateKey}`);
                }
              } else {
                console.log(`📅 Today's Instagram entry already exists: ${currentDateKey}`);
              }
            }
            
            // Get updated Instagram history for display
            const updatedIgSnapshot = await get(igHistoryRef);
            const updatedIgHistory = updatedIgSnapshot.val() || {};
            
            // Handle both array and object formats for Instagram logging
            const updatedIgEntries = Array.isArray(updatedIgHistory) ? updatedIgHistory : Object.values(updatedIgHistory);
            console.log(`🔍 IG AFTER PUSH - Updated history count: ${updatedIgEntries.length}`);
            console.log(`🔍 IG AFTER PUSH - Updated dates: ${updatedIgEntries.map(e => e.dateKey).join(', ')}`);
            
            // Handle both array (cached) and object (original) formats for Instagram
            const igHistoryData = updatedIgHistory;
            if (Array.isArray(igHistoryData)) {
              igHistoricalData = igHistoryData
                .filter(point => point && typeof point === 'object' && point.timestamp)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .slice(-30);
            } else {
              igHistoricalData = Object.values(igHistoryData)
                .filter(point => point && typeof point === 'object' && point.timestamp)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .slice(-30);
            }
              
            console.log(`📊 IG FINAL - Total history entries: ${igHistoricalData.length}`);
            console.log(`📊 IG FINAL - History dates: ${igHistoricalData.map(h => h?.dateKey || 'NO_DATE').join(', ')}`);
          } catch (igHistoryError) {
            console.error('❌ IG HISTORY ERROR:', igHistoryError.message);
            console.error('❌ IG HISTORY ERROR STACK:', igHistoryError.stack);
          }
          
          igEngagement = {
            reach: igReach,
            likes: totalLikes,
            comments: totalComments,
            shares: igShares,
            follows: igFollows,
            postsCount: igPosts.length,
            historicalData: igHistoricalData,
            topPost: topPost,
            recentPost: recentPost
          };
          
          console.log('✅ FINAL IG ENGAGEMENT OBJECT:', JSON.stringify(igEngagement, null, 2));
        }
      } catch (igError) {
        console.log('No Instagram account or error fetching Instagram data:', igError.message);
      }
      
      return {
        facebook: fbEngagement,
        instagram: igEngagement
      };
    } catch (error) {
      console.error('Error fetching account engagement:', error);
      throw error;
    }
  }
}

export default new InsightsService();