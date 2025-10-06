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
      
      // Get page views data from Page Insights API
      let pageViewsData = 0;
      let totalComments = 0, totalShares = 0;
      
      // Calculate comments and shares for the fbEngagement object
      fbPosts.forEach(post => {
        totalComments += post.comments?.summary?.total_count || 0;
        totalShares += post.shares?.count || 0;
      });
      
      try {
        const pageViewsResponse = await axios.get(`https://graph.facebook.com/v23.0/${accountId}/insights`, {
          params: {
            metric: 'page_views_total',
            period: 'days_28',
            access_token: accessToken
          }
        });
        
        // Get the 28-day total page views
        const viewsData = pageViewsResponse.data.data[0];
        if (viewsData && viewsData.values && viewsData.values.length > 0) {
          pageViewsData = viewsData.values[viewsData.values.length - 1].value || 0;
        }
        
        console.log('📊 Page Views (28 days):', pageViewsData);
      } catch (pageViewsError) {
        console.log('Could not get page views:', pageViewsError.message);
      }
      
      // Get most recent post with detailed reaction breakdown
      let recentPost = null;
      if (fbPosts.length > 0) {
        const mostRecentPost = fbPosts[0]; // Posts are ordered by created_time desc
        try {
          const postInfo = await axios.get(`https://graph.facebook.com/v23.0/${mostRecentPost.id}`, {
            params: {
              fields: 'message,created_time',
              access_token: accessToken
            }
          });
          
          // Get detailed reaction breakdown from Page Post Insights API
          let detailedReactions = {};
          try {
            const reactionInsights = await axios.get(`https://graph.facebook.com/v23.0/${mostRecentPost.id}/insights`, {
              params: {
                metric: 'post_reactions_like_total,post_reactions_love_total,post_reactions_wow_total,post_reactions_haha_total,post_reactions_sorry_total,post_reactions_anger_total',
                period: 'lifetime',
                access_token: accessToken
              }
            });
            
            reactionInsights.data.data.forEach(metric => {
              const value = metric.values[0]?.value || 0;
              switch (metric.name) {
                case 'post_reactions_like_total': detailedReactions.like = value; break;
                case 'post_reactions_love_total': detailedReactions.love = value; break;
                case 'post_reactions_haha_total': detailedReactions.haha = value; break;
                case 'post_reactions_wow_total': detailedReactions.wow = value; break;
                case 'post_reactions_sorry_total': detailedReactions.sad = value; break;
                case 'post_reactions_anger_total': detailedReactions.angry = value; break;
              }
            });
          } catch (detailedError) {
            console.log('Could not get detailed reactions:', detailedError.message);
          }
          
          recentPost = {
            id: mostRecentPost.id,
            message: postInfo.data.message || 'No message',
            createdTime: postInfo.data.created_time,
            reactions: mostRecentPost.reactions?.summary?.total_count || 0,
            comments: mostRecentPost.comments?.summary?.total_count || 0,
            shares: mostRecentPost.shares?.count || 0,
            detailedReactions: detailedReactions
          };
        } catch (recentPostError) {
          console.log(`Could not get recent post info:`, recentPostError.message);
        }
      }
      
      const totalReactions = pageViewsData; // Now represents page views instead of reactions
      
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
            total: pageViewsData, // Using page views for historical data
            timestamp: currentTimestamp.toISOString(),
            dateKey: currentDateKey
          };
          
          historicalData.push(newDataPoint);
          
          // Keep only last 30 days of data
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          historicalData = historicalData.filter(point => new Date(point.timestamp) > thirtyDaysAgo);
          
          // Save updated history back to Firebase in account node
          const { update, set } = await import('firebase/database');
          const updatedHistory = {};
          historicalData.forEach((point) => {
            updatedHistory[point.dateKey] = point;
          });
          
          // Force clean migration by replacing entire engagementHistory
          const historyRef = ref(db, `connectedPages/admin/${accountId}/engagementHistory`);
          await set(historyRef, updatedHistory);
          
          console.log('📊 New daily data point added for', currentDateKey);
        } else {
          console.log('📊 Data point already exists for today, skipping');
        }
        
      } catch (historyError) {
        console.log('Could not manage historical data:', historyError.message);
        // Only create initial data if historicalData is empty
        if (historicalData.length === 0) {
          historicalData = [{
            date: currentTimestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: '12:00 AM',
            total: pageViewsData, // Using page views for fallback data
            timestamp: currentTimestamp.toISOString(),
            dateKey: currentDateKey
          }];
        }
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
          igEngagement = {
            totalViews: igViews, // Using Instagram Insights API views
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