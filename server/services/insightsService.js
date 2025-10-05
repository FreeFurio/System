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
          fields: 'id,message,created_time,reactions.summary(true),comments.summary(true),shares',
          limit: 5,
          access_token: userToken
        }
      });
      
      let totalReactions = 0;
      let totalComments = 0;
      let totalShares = 0;
      
      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach(post => {
          totalReactions += post.reactions?.summary?.total_count || 0;
          totalComments += post.comments?.summary?.total_count || 0;
          totalShares += post.shares?.count || 0;
        });
      }
      
      return {
        totalReactions,
        totalComments,
        totalShares,
        postsCount: response.data.data?.length || 0
      };
    } catch (error) {
      console.error('❌ Posts Engagement Error:', error.response?.data || error.message);
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
      
      // Get Facebook posts with reactions
      const fbResponse = await axios.get(`https://graph.facebook.com/v23.0/${accountId}/posts`, {
        params: {
          fields: 'id,reactions.summary(true),comments.summary(true),shares',
          limit: 10,
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
      
      // Count total reactions, comments, and shares for engagement chart (Graph API)
      let totalReactionsCount = 0, totalComments = 0, totalShares = 0;
      
      fbPosts.forEach(post => {
        totalReactionsCount += post.reactions?.summary?.total_count || 0;
        totalComments += post.comments?.summary?.total_count || 0;
        totalShares += post.shares?.count || 0;
      });
      
      // Get individual reaction counts using Insights API
      let likeCount = 0, loveCount = 0, hahaCount = 0, wowCount = 0, sadCount = 0, angryCount = 0;
      
      for (const post of fbPosts) {
        try {
          const postInsights = await axios.get(`https://graph.facebook.com/v23.0/${post.id}/insights`, {
            params: {
              metric: 'post_reactions_like_total,post_reactions_love_total,post_reactions_wow_total,post_reactions_haha_total,post_reactions_sorry_total,post_reactions_anger_total',
              period: 'lifetime',
              access_token: accessToken
            }
          });
          
          postInsights.data.data.forEach(metric => {
            const value = metric.values[0]?.value || 0;
            switch (metric.name) {
              case 'post_reactions_like_total': likeCount += value; break;
              case 'post_reactions_love_total': loveCount += value; break;
              case 'post_reactions_haha_total': hahaCount += value; break;
              case 'post_reactions_wow_total': wowCount += value; break;
              case 'post_reactions_sorry_total': sadCount += value; break;
              case 'post_reactions_anger_total': angryCount += value; break;
            }
          });
        } catch (insightError) {
          console.log(`Could not get insights for post ${post.id}:`, insightError.message);
        }
      }
      
      const totalReactions = totalReactionsCount;
      
      // Get historical data from Firebase
      let historicalData = [];
      const currentTimestamp = new Date();
      const currentDateKey = currentTimestamp.toDateString(); // "Mon Oct 05 2025"
      
      try {
        const accountRef = ref(db, `connectedPages/admin/${accountId}`);
        const accountSnapshot = await get(accountRef);
        
        // Get existing engagement history from account node
        const existingHistory = accountSnapshot.val()?.engagementHistory || {};
        historicalData = Object.values(existingHistory).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // historicalData already populated above
        
        // Check if we already have data for today
        const todayExists = historicalData.some(point => 
          new Date(point.timestamp).toDateString() === currentDateKey
        );
        
        // Only add new data point if it's a new day
        if (!todayExists) {
          const newDataPoint = {
            date: currentTimestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: '12:00 AM',
            total: totalReactionsCount + totalComments + totalShares,
            timestamp: currentTimestamp.toISOString(),
            dateKey: currentDateKey
          };
          
          historicalData.push(newDataPoint);
          
          // Keep only last 30 days of data
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          historicalData = historicalData.filter(point => new Date(point.timestamp) > thirtyDaysAgo);
          
          // Save updated history back to Firebase in account node
          const { update } = await import('firebase/database');
          const updatedHistory = {};
          historicalData.forEach((point, index) => {
            updatedHistory[index] = point;
          });
          await update(accountRef, { engagementHistory: updatedHistory });
          
          console.log('📊 New daily data point added for', currentDateKey);
        } else {
          console.log('📊 Data point already exists for today, skipping');
        }
        
      } catch (historyError) {
        console.log('Could not manage historical data:', historyError.message);
        // Create initial data point for today
        historicalData = [{
          date: currentTimestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: '12:00 AM',
          total: totalReactionsCount + totalComments + totalShares,
          timestamp: currentTimestamp.toISOString(),
          dateKey: currentDateKey
        }];
      }
      
      const fbEngagement = {
        totalReactions,
        totalComments,
        totalShares,
        postsCount: fbPosts.length,
        pageLikes: pageMetricsResponse.data.fan_count || 0,
        followers: pageMetricsResponse.data.followers_count || 0,
        recentEngagement: pageMetricsResponse.data.talking_about_count || 0,
        historicalData: historicalData,
        reactions: {
          like: likeCount,
          love: loveCount,
          haha: hahaCount,
          wow: wowCount,
          sad: sadCount,
          angry: angryCount
        }
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
          const igResponse = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}/media`, {
            params: {
              fields: 'like_count,comments_count,media_type',
              limit: 10,
              access_token: accessToken
            }
          });
          
          const igPosts = igResponse.data.data || [];
          igEngagement = {
            totalLikes: igPosts.reduce((sum, post) => sum + (post.like_count || 0), 0),
            totalComments: igPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0),
            postsCount: igPosts.length
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