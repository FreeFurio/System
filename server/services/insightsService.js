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
      
      const app = initializeApp(config.firebase);
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
      }
      
      // Get historical data from Firebase
      let historicalData = [];
      const currentTimestamp = new Date();
      const currentDateKey = currentTimestamp.toDateString(); // "Mon Oct 05 2025"
      
      try {
        const { set } = await import('firebase/database');
        const accountRef = ref(db, `connectedPages/admin/${accountId}`);
        const accountSnapshot = await get(accountRef);
        
        // Get existing engagement history from account node
        const existingHistory = accountSnapshot.val()?.engagementHistory || {};
        
        // Clean up old indexed structure (0, 1, 2...) and convert to dateKey structure
        const cleanHistory = {};
        Object.values(existingHistory).forEach(point => {
          if (point && point.dateKey) {
            cleanHistory[point.dateKey] = point;
          }
        });
        
        // If we cleaned up old structure, save it immediately
        if (Object.keys(cleanHistory).length > 0 && Object.keys(cleanHistory).length !== Object.keys(existingHistory).length) {
          const historyRef = ref(db, `connectedPages/admin/${accountId}/engagementHistory`);
          await set(historyRef, cleanHistory);
          console.log('🧹 Cleaned up old indexed structure');
        }
        
        historicalData = Object.values(cleanHistory).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Update today's data point to use correct total engagement
        let dataUpdated = false;
        
        historicalData = historicalData.map(point => {
          // Only update today's data point, preserve historical data
          if (point.dateKey === currentDateKey) {
            dataUpdated = true;
            return { ...point, total: totalEngagement };
          }
          return point;
        });
        
        // Check if we already have data for today
        const todayExists = historicalData.some(point => 
          new Date(point.timestamp).toDateString() === currentDateKey
        );
        
        // Add new data point if it's a new day
        if (!todayExists) {
          const newDataPoint = {
            date: currentTimestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: '12:00 AM',
            total: totalEngagement,
            timestamp: currentTimestamp.toISOString(),
            dateKey: currentDateKey
          };
          
          historicalData.push(newDataPoint);
          dataUpdated = true;
          
          // Keep only last 30 days of data
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          historicalData = historicalData.filter(point => new Date(point.timestamp) > thirtyDaysAgo);
          
          console.log('📊 New daily data point added for', currentDateKey);
        }
        
        // Save to Firebase if data was updated (either new day or updated existing day)
        if (dataUpdated) {
          const { update, set } = await import('firebase/database');
          const updatedHistory = {};
          historicalData.forEach((point) => {
            updatedHistory[point.dateKey] = point;
          });
          
          const historyRef = ref(db, `connectedPages/admin/${accountId}/engagementHistory`);
          await set(historyRef, updatedHistory);
          
          console.log(`💾 Firebase updated with engagement data: ${totalEngagement} for ${currentDateKey}`);
        } else {
          console.log('📊 No data changes, skipping Firebase update');
        }
        
      } catch (historyError) {
        console.log('Could not manage historical data:', historyError.message);
        // Only create initial data if historicalData is empty
        if (historicalData.length === 0) {
          const totalEngagement = totalReactions + totalComments + totalShares;
          historicalData = [{
            date: currentTimestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: '12:00 AM',
            total: totalEngagement, // Using total engagement for fallback data
            timestamp: currentTimestamp.toISOString(),
            dateKey: currentDateKey
          }];
        }
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
        recentPost: recentPost
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
          // Get Instagram Views from Insights API
          let igViews = 0;
          try {
            const igInsightsResponse = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}/insights`, {
              params: {
                metric: 'views',
                period: 'day',
                metric_type: 'total_value',
                access_token: accessToken
              }
            });
            
            igViews = igInsightsResponse.data.data[0]?.total_value?.value || 0;
            console.log('📊 Instagram Views:', igViews);
          } catch (viewsError) {
            console.log('Could not get Instagram views:', viewsError.message);
          }
          
          // Get basic media data for additional stats
          const igResponse = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}/media`, {
            params: {
              fields: 'like_count,comments_count,media_type',
              limit: 10,
              access_token: accessToken
            }
          });
          
          const igPosts = igResponse.data.data || [];
          const totalLikes = igPosts.reduce((sum, post) => sum + (post.like_count || 0), 0);
          const totalComments = igPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
          const totalEngagementIG = totalLikes + totalComments;
          
          // Save Instagram historical data like Facebook
          let igHistoricalData = [];
          try {
            const igAccountRef = ref(db, `connectedPages/admin/${accountId}/instagramEngagementHistory`);
            const igSnapshot = await get(igAccountRef);
            
            const existingIGHistory = igSnapshot.val() || {};
            const cleanIGHistory = {};
            Object.values(existingIGHistory).forEach(point => {
              if (point && point.dateKey) {
                cleanIGHistory[point.dateKey] = point;
              }
            });
            
            igHistoricalData = Object.values(cleanIGHistory).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            let igDataUpdated = false;
            igHistoricalData = igHistoricalData.map(point => {
              if (point.dateKey === currentDateKey) {
                igDataUpdated = true;
                return { ...point, total: totalEngagementIG };
              }
              return point;
            });
            
            const igTodayExists = igHistoricalData.some(point => 
              new Date(point.timestamp).toDateString() === currentDateKey
            );
            
            if (!igTodayExists) {
              const newIGDataPoint = {
                date: currentTimestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                time: '12:00 AM',
                total: totalEngagementIG,
                timestamp: currentTimestamp.toISOString(),
                dateKey: currentDateKey
              };
              
              igHistoricalData.push(newIGDataPoint);
              igDataUpdated = true;
              
              const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              igHistoricalData = igHistoricalData.filter(point => new Date(point.timestamp) > thirtyDaysAgo);
            }
            
            if (igDataUpdated) {
              const { set } = await import('firebase/database');
              const updatedIGHistory = {};
              igHistoricalData.forEach((point) => {
                updatedIGHistory[point.dateKey] = point;
              });
              
              await set(igAccountRef, updatedIGHistory);
              console.log(`💾 Instagram historical data saved: ${totalEngagementIG} for ${currentDateKey}`);
            }
          } catch (igHistoryError) {
            console.log('Could not manage Instagram historical data:', igHistoryError.message);
            if (igHistoricalData.length === 0) {
              igHistoricalData = [{
                date: currentTimestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                time: '12:00 AM',
                total: totalEngagementIG,
                timestamp: currentTimestamp.toISOString(),
                dateKey: currentDateKey
              }];
            }
          }
          
          igEngagement = {
            totalViews: igViews,
            totalLikes,
            totalComments,
            postsCount: igPosts.length,
            historicalData: igHistoricalData
          };
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