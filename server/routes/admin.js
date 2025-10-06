import express from 'express';
import axios from 'axios';
import insightsService from '../services/insightsService.js';

const router = express.Router();

router.get('/insights/page', async (req, res) => {
  try {
    console.log('🚀 Admin API: Fetching page insights...');
    const insights = await insightsService.getPageInsights();
    res.json({ success: true, data: insights });
  } catch (error) {
    console.error('❌ Admin API Error (Page Insights):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/insights/instagram', async (req, res) => {
  try {
    console.log('🚀 Admin API: Fetching Instagram insights...');
    const insights = await insightsService.getInstagramInsights();
    res.json({ success: true, data: insights });
  } catch (error) {
    console.error('❌ Admin API Error (Instagram Insights):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/insights/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { access_token } = req.query;
    
    const engagement = await insightsService.getPostEngagement(postId, access_token);
    res.json({ success: true, data: engagement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/account', async (req, res) => {
  try {
    const accountInfo = await insightsService.getAccountInfo();
    res.json({ success: true, data: accountInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/engagement/facebook', async (req, res) => {
  try {
    console.log('🚀 Admin API: Fetching Facebook engagement...');
    const engagement = await insightsService.getRecentPostsEngagement();
    res.json({ success: true, data: engagement });
  } catch (error) {
    console.error('❌ Admin API Error (Facebook Engagement):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/engagement/instagram', async (req, res) => {
  try {
    console.log('🚀 Admin API: Fetching Instagram engagement...');
    const engagement = await insightsService.getInstagramPostsEngagement();
    res.json({ success: true, data: engagement });
  } catch (error) {
    console.error('❌ Admin API Error (Instagram Engagement):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/engagement/account/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    console.log('🚀 Admin API: Fetching engagement for account:', accountId);
    
    const engagement = await insightsService.getAccountSpecificEngagement(accountId);
    res.json({ success: true, data: engagement });
  } catch (error) {
    console.error('❌ Admin API Error (Account Engagement):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/debug-data', async (req, res) => {
  try {
    console.log('🚀 Admin API: Fetching debug data...');
    const debugData = await insightsService.getDebugData();
    res.json({ success: true, data: debugData });
  } catch (error) {
    console.error('❌ Admin API Error (Debug Data):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});



router.get('/setup-facebook-tokens', async (req, res) => {
  try {
    const setup = await insightsService.setupFacebookPageTokens();
    res.json({ success: true, data: setup });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/get-all-page-tokens', async (req, res) => {
  try {
    const { userAccessToken } = req.body;
    const pages = await insightsService.getAllPageTokens(userAccessToken);
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



router.get('/facebook-oauth-modal', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId || !global.tempTokens?.[sessionId]) {
      return res.status(400).json({ success: false, error: 'Invalid session' });
    }
    
    const sessionData = global.tempTokens[sessionId];
    
    res.json({
      success: true,
      pages: sessionData.pages.map(page => ({
        ...page,
        sessionId: sessionId
      }))
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/facebook-oauth', async (req, res) => {
  try {
    const appId = process.env.FB_APP_ID;
    const redirectUri = process.env.FB_REDIRECT_URI || 'http://localhost:3000/api/v1/admin/facebook-oauth-callback';
    
    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_read_user_content',
      'business_management'
    ].join(',');
    
    const sessionId = req.query.sessionId || Date.now().toString();
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `state=${sessionId}`;
    
    res.redirect(authUrl);
  } catch (error) {
    res.status(500).send(`<html><body><h1>Error</h1><p>${error.message}</p></body></html>`);
  }
});

router.get('/connected-pages', async (req, res) => {
  try {
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const connectedPagesRef = ref(db, 'connectedPages/admin');
    const snapshot = await get(connectedPagesRef);
    
    const pages = snapshot.exists() ? Object.values(snapshot.val()) : [];
    
    // Check Instagram connection for each page
    const pagesWithInstagram = await Promise.all(
      pages.map(async (page) => {
        let hasInstagram = false;
        let instagramAccount = null;
        let facebookProfilePicture = null;
        
        try {
          const response = await axios.get(`https://graph.facebook.com/v23.0/${page.id}`, {
            params: {
              fields: 'instagram_business_account,picture{url}',
              access_token: page.accessToken
            }
          });
          
          facebookProfilePicture = response.data.picture?.data?.url || null;
          
          if (response.data.instagram_business_account) {
            hasInstagram = true;
            const igAccountId = response.data.instagram_business_account.id;
            
            const igResponse = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}`, {
              params: {
                fields: 'name,username,followers_count,profile_picture_url',
                access_token: page.accessToken
              }
            });
            
            instagramAccount = {
              id: igAccountId,
              name: igResponse.data.name,
              username: igResponse.data.username,
              followersCount: igResponse.data.followers_count || 0,
              profilePicture: igResponse.data.profile_picture_url || null
            };
          }
        } catch (error) {
          console.log(`Could not check Instagram for page ${page.id}:`, error.message);
        }
        
        return {
          id: page.id,
          name: page.name,
          category: page.category,
          connectedAt: page.connectedAt,
          status: page.status,
          active: page.active !== false,
          hasInstagram,
          instagramAccount,
          profilePicture: facebookProfilePicture
        };
      })
    );
    
    res.json({
      success: true,
      pages: pagesWithInstagram
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.get('/get-auth-result/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const authResult = global.authResults?.[sessionId];
    
    if (authResult) {
      // Clean up after retrieval
      delete global.authResults[sessionId];
      console.log('🔥 SERVER: Auth result retrieved for session:', sessionId);
      res.json({ success: true, data: authResult });
    } else {
      res.json({ success: false, message: 'No auth result found' });
    }
    
  } catch (error) {
    console.error('❌ SERVER: Error retrieving auth result:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/connect-selected-page', async (req, res) => {
  try {
    const { pageId, sessionId } = req.body;
    
    const sessionData = global.tempTokens?.[sessionId];
    if (!sessionData || Date.now() > sessionData.expires) {
      return res.status(400).json({ success: false, error: 'Session expired' });
    }
    
    const selectedPage = sessionData.pages.find(page => page.id === pageId);
    if (!selectedPage) {
      return res.status(400).json({ success: false, error: 'Page not found' });
    }
    
    const { ref, set } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const pageRef = ref(db, `connectedPages/admin/${pageId}`);
    
    const pageData = {
      id: selectedPage.id,
      name: selectedPage.name,
      category: selectedPage.category,
      accessToken: selectedPage.access_token,
      fanCount: selectedPage.fan_count || 0,
      connectedAt: new Date().toISOString(),
      status: 'active'
    };
    
    // Check for Instagram Business Account
    try {
      const igResponse = await axios.get(`https://graph.facebook.com/v23.0/${selectedPage.id}`, {
        params: {
          fields: 'instagram_business_account',
          access_token: selectedPage.access_token
        }
      });
      
      if (igResponse.data.instagram_business_account) {
        pageData.instagramBusinessAccount = igResponse.data.instagram_business_account;
      }
    } catch (error) {
      console.log('Could not check Instagram for page:', error.message);
    }
    
    await set(pageRef, pageData);
    
    res.json({
      success: true,
      message: `${selectedPage.name} connected successfully`,
      page: {
        id: selectedPage.id,
        name: selectedPage.name,
        category: selectedPage.category
      }
    });
    
  } catch (error) {
    console.error('❌ Connect Page Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/store-connected-pages', async (req, res) => {
  try {
    const { pages, userId } = req.body;
    
    if (!pages || !Array.isArray(pages)) {
      return res.status(400).json({ error: 'Pages array is required' });
    }
    
    // Store pages in Firebase
    const { ref, set } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const connectedPagesRef = ref(db, `connectedPages/${userId || 'admin'}`);
    
    const pageData = {};
    pages.forEach(page => {
      pageData[page.id] = {
        id: page.id,
        name: page.name,
        category: page.category,
        accessToken: page.access_token,
        connectedAt: new Date().toISOString(),
        status: 'active'
      };
    });
    
    await set(connectedPagesRef, pageData);
    
    res.json({
      success: true,
      message: `${pages.length} pages connected successfully`,
      pages: pages.map(p => ({ id: p.id, name: p.name }))
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/facebook-oauth-callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      throw new Error('Authorization code not received from Facebook');
    }
    
    const appId = process.env.FB_APP_ID;
    const appSecret = process.env.FB_APP_SECRET;
    const redirectUri = process.env.FB_REDIRECT_URI || 'http://localhost:3000/api/v1/admin/facebook-oauth-callback';
    
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code: code
      }
    });
    
    const userAccessToken = tokenResponse.data.access_token;
    
    const longLivedResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: userAccessToken
      }
    });
    
    const longLivedUserToken = longLivedResponse.data.access_token;
    
    const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: {
        access_token: longLivedUserToken,
        fields: 'id,name,access_token,category,tasks,fan_count'
      }
    });
    
    const pages = pagesResponse.data.data || [];
    const sessionId = state || Date.now().toString();
    
    global.tempTokens = global.tempTokens || {};
    global.tempTokens[sessionId] = {
      userToken: longLivedUserToken,
      pages: pages,
      expires: Date.now() + (30 * 60 * 1000)
    };
    
    const authData = {
      type: 'FACEBOOK_OAUTH_SUCCESS',
      pages: pages.map(page => ({ ...page, sessionId })),
      timestamp: Date.now()
    };
    
    global.authResults = global.authResults || {};
    global.authResults[sessionId] = authData;
    
    res.setHeader('Content-Security-Policy', "script-src 'unsafe-inline'");
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facebook Authorization Complete</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>✅ Authorization Complete!</h1>
          <p>Found ${pages.length} pages. Closing automatically...</p>
          <script>
            const authData = ${JSON.stringify(authData)};
            
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage(authData, '*');
              }
              localStorage.setItem('facebookAuthResult', JSON.stringify(authData));
            } catch (e) {
              console.log('Communication error:', e);
            }
            
            setTimeout(() => window.close(), 1000);
          </script>
        </body>
      </html>
    `;
    
    res.send(html);
    
  } catch (error) {
    console.error('❌ Facebook OAuth Error:', error.response?.data || error.message);
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Authorization Failed</title></head>
        <body>
          <h1>❌ Authorization Failed</h1>
          <p>${error.message}</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body>
      </html>
    `);
  }
});

router.get('/get-page-access-token', async (req, res) => {
  try {
    const userToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const targetPageId = process.env.FACEBOOK_PAGE_ID;
    
    console.log('🔍 Getting Page Access Token from User Token...');
    
    // Get user's pages with their Page Access Tokens
    const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: {
        access_token: userToken,
        fields: 'id,name,access_token,category,tasks'
      }
    });
    
    const pages = response.data.data || [];
    const targetPage = pages.find(page => page.id === targetPageId);
    
    let html = `
      <html>
        <head><title>Page Access Token</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>Page Access Token Generator</h1>
          <p><strong>Looking for Page ID:</strong> ${targetPageId}</p>
          <p><strong>Found ${pages.length} pages</strong></p>
    `;
    
    if (pages.length === 0) {
      html += '<p style="color: red;">❌ No pages found. Your User Token may not have pages_show_list permission.</p>';
    } else {
      pages.forEach(page => {
        const isTarget = page.id === targetPageId;
        html += `
          <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; ${isTarget ? 'background: #e8f5e8;' : ''}">
            <h3>${page.name} ${isTarget ? '✅ TARGET PAGE' : ''}</h3>
            <p><strong>Page ID:</strong> ${page.id}</p>
            <p><strong>Category:</strong> ${page.category}</p>
            <p><strong>Page Access Token:</strong></p>
            <textarea style="width: 100%; height: 80px; font-family: monospace;">${page.access_token}</textarea>
          </div>
        `;
      });
    }
    
    if (targetPage) {
      html += `
        <h2>📝 Copy This Page Token to Your .env File:</h2>
        <pre style="background: #f0f0f0; padding: 15px; border: 1px solid #ccc;">FACEBOOK_PAGE_ACCESS_TOKEN=${targetPage.access_token}</pre>
        <p style="color: green;"><strong>This Page Token will allow access to post engagement data!</strong></p>
      `;
    }
    
    html += '</body></html>';
    res.send(html);
    
  } catch (error) {
    res.send(`
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1>❌ Error Getting Page Token</h1>
          <p>${error.response?.data?.error?.message || error.message}</p>
          <p>You may need to add pages_show_list permission to your User Token.</p>
        </body>
      </html>
    `);
  }
});

router.get('/test-facebook-posts', async (req, res) => {
  try {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const userToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    console.log('🔍 Testing Facebook posts access...');
    
    // Test 1: Try to get posts with User Token
    try {
      const postsResponse = await axios.get(`https://graph.facebook.com/v18.0/${pageId}/posts`, {
        params: {
          fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
          limit: 5,
          access_token: userToken
        }
      });
      
      const posts = postsResponse.data.data || [];
      
      let html = `
        <html>
          <head><title>Facebook Posts Test</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>✅ Posts Access Test</h1>
            <p><strong>Found ${posts.length} posts</strong></p>
      `;
      
      posts.forEach((post, index) => {
        const likes = post.likes?.summary?.total_count || 0;
        const comments = post.comments?.summary?.total_count || 0;
        const shares = post.shares?.count || 0;
        
        html += `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
            <h3>Post ${index + 1}</h3>
            <p><strong>Message:</strong> ${post.message || 'No message'}</p>
            <p><strong>Likes:</strong> ${likes}</p>
            <p><strong>Comments:</strong> ${comments}</p>
            <p><strong>Shares:</strong> ${shares}</p>
            <p><strong>Created:</strong> ${post.created_time}</p>
          </div>
        `;
      });
      
      html += '</body></html>';
      res.send(html);
      
    } catch (error) {
      res.send(`
        <html>
          <body style="font-family: Arial; padding: 20px;">
            <h1>❌ Posts Access Failed</h1>
            <p><strong>Error:</strong> ${error.response?.data?.error?.message || error.message}</p>
            <p>This means we need a Page Access Token, not a User Token.</p>
          </body>
        </html>
      `);
    }
    
  } catch (error) {
    res.send(`<html><body><h1>Error</h1><p>${error.message}</p></body></html>`);
  }
});

router.get('/get-instagram-id', async (req, res) => {
  try {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const userToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    console.log('🔍 Getting Instagram Business Account ID...');
    
    const response = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
      params: {
        fields: 'instagram_business_account{id,name,username,followers_count,media_count}',
        access_token: userToken
      }
    });
    
    const igAccount = response.data.instagram_business_account;
    
    if (!igAccount) {
      res.send(`
        <html>
          <head><title>Instagram Not Connected</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>❌ No Instagram Account Found</h1>
            <p>Your Facebook page doesn't have an Instagram Business Account connected.</p>
            <p>Page ID: ${pageId}</p>
          </body>
        </html>
      `);
      return;
    }
    
    res.send(`
      <html>
        <head><title>Instagram Account Found</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>✅ Instagram Business Account Found!</h1>
          <p><strong>Instagram ID:</strong> ${igAccount.id}</p>
          <p><strong>Name:</strong> ${igAccount.name || 'N/A'}</p>
          <p><strong>Username:</strong> @${igAccount.username || 'N/A'}</p>
          <p><strong>Followers:</strong> ${igAccount.followers_count || 0}</p>
          <p><strong>Media Count:</strong> ${igAccount.media_count || 0}</p>
          
          <h2>Update your .env file:</h2>
          <pre style="background: #f0f0f0; padding: 15px;">INSTAGRAM_BUSINESS_ACCOUNT_ID=${igAccount.id}</pre>
        </body>
      </html>
    `);
    
  } catch (error) {
    res.send(`<html><body><h1>Error</h1><p>${error.response?.data?.error?.message || error.message}</p></body></html>`);
  }
});

router.get('/check-page-exists', async (req, res) => {
  try {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const userToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    console.log('🔍 Checking if page exists...');
    
    // Try to get page info
    try {
      const pageResponse = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
        params: {
          fields: 'id,name,category,link',
          access_token: userToken
        }
      });
      
      res.send(`
        <html>
          <head><title>Page Status Check</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>✅ Page Found!</h1>
            <p><strong>Page ID:</strong> ${pageResponse.data.id}</p>
            <p><strong>Page Name:</strong> ${pageResponse.data.name}</p>
            <p><strong>Category:</strong> ${pageResponse.data.category}</p>
            <p><strong>Link:</strong> <a href="${pageResponse.data.link}" target="_blank">${pageResponse.data.link}</a></p>
          </body>
        </html>
      `);
      
    } catch (pageError) {
      // Page not found, let's check what pages the user has access to
      const accountsResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: { access_token: userToken }
      });
      
      const pages = accountsResponse.data.data;
      
      let html = `
        <html>
          <head><title>Page Not Found</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>❌ Page ${pageId} Not Found</h1>
            <p>Error: ${pageError.response?.data?.error?.message}</p>
            
            <h2>Available Pages (${pages.length}):</h2>
      `;
      
      if (pages.length === 0) {
        html += '<p>No pages found. You may need to create a new Facebook page.</p>';
      } else {
        pages.forEach(page => {
          html += `
            <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
              <h3>${page.name}</h3>
              <p>ID: ${page.id}</p>
              <p>Category: ${page.category}</p>
            </div>
          `;
        });
      }
      
      html += '</body></html>';
      res.send(html);
    }
    
  } catch (error) {
    res.send(`<html><body><h1>Error</h1><p>${error.message}</p></body></html>`);
  }
});

router.get('/use-current-token', async (req, res) => {
  try {
    const currentToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    res.send(`
      <html>
        <head><title>Use Current Token for Testing</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>🛠️ Temporary Solution</h1>
          <p>Since getting page tokens is complex, let's use your current User Token for testing:</p>
          
          <h2>Current Token:</h2>
          <textarea style="width: 100%; height: 80px; font-family: monospace;">${currentToken}</textarea>
          
          <h2>For Testing Only:</h2>
          <p>This User Token should work for basic page info and some operations.</p>
          <p>We'll modify the code to handle User Token limitations gracefully.</p>
          
          <h2>Next Steps:</h2>
          <ol>
            <li>Keep this token in your .env file</li>
            <li>I'll update the insights service to work with User Token</li>
            <li>Later we can get proper Page Token when needed</li>
          </ol>
        </body>
      </html>
    `);
    
  } catch (error) {
    res.send(`<html><body><h1>Error</h1><p>${error.message}</p></body></html>`);
  }
});

router.get('/facebook-callback', async (req, res) => {
  try {
    const { code } = req.query;
    const appId = process.env.FB_APP_ID;
    const appSecret = process.env.FB_APP_SECRET;
    const redirectUri = 'http://localhost:3000/api/v1/admin/facebook-callback';
    
    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code: code
      }
    });
    
    const userAccessToken = tokenResponse.data.access_token;
    
    // Get user's pages
    const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: { access_token: userAccessToken }
    });
    
    const pages = pagesResponse.data.data;
    const targetPageId = process.env.FACEBOOK_PAGE_ID;
    const targetPage = pages.find(page => page.id === targetPageId);
    
    let html = `
      <html>
        <head><title>Facebook Page Tokens</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>✅ Facebook Authorization Success!</h1>
          <h2>Available Pages (${pages.length}):</h2>
    `;
    
    pages.forEach(page => {
      const isTarget = page.id === targetPageId;
      html += `
        <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; ${isTarget ? 'background: #e8f5e8;' : ''}">
          <h3>${page.name} ${isTarget ? '✅ TARGET PAGE' : ''}</h3>
          <p>ID: ${page.id}</p>
          <p><strong>Page Access Token:</strong></p>
          <textarea style="width: 100%; height: 80px; font-family: monospace;">${page.access_token}</textarea>
          ${isTarget ? '<p style="color: green; font-weight: bold;">Copy this token to your .env file!</p>' : ''}
        </div>
      `;
    });
    
    if (targetPage) {
      html += `
        <h2>📝 Update Your .env File:</h2>
        <pre style="background: #f0f0f0; padding: 15px; border: 1px solid #ccc;">FACEBOOK_PAGE_ACCESS_TOKEN=${targetPage.access_token}</pre>
      `;
    }
    
    html += '</body></html>';
    res.send(html);
    
  } catch (error) {
    res.send(`<html><body><h1>Error</h1><p>${error.response?.data?.error?.message || error.message}</p></body></html>`);
  }
});

router.get('/debug-token', async (req, res) => {
  try {
    const userToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const targetPageId = process.env.FACEBOOK_PAGE_ID;
    
    console.log('🔍 Debug: Testing current token...');
    
    // Test user info
    const userResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: { access_token: userToken }
    });
    
    // Test pages
    const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: { access_token: userToken }
    });
    
    const pages = pagesResponse.data.data;
    const targetPage = pages.find(page => page.id === targetPageId);
    
    let html = `
      <html>
        <head><title>Facebook Token Debug</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>Facebook Token Debug</h1>
          <h2>User Info:</h2>
          <p>Name: ${userResponse.data.name}</p>
          <p>ID: ${userResponse.data.id}</p>
          
          <h2>Available Pages (${pages.length}):</h2>
    `;
    
    if (pages.length === 0) {
      html += '<p style="color: red;">❌ No pages found. Token needs page admin permissions.</p>';
    } else {
      pages.forEach(page => {
        const isTarget = page.id === targetPageId;
        html += `
          <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; ${isTarget ? 'background: #e8f5e8;' : ''}">
            <h3>${page.name} ${isTarget ? '✅ TARGET' : ''}</h3>
            <p>ID: ${page.id}</p>
            <p><strong>Page Token:</strong></p>
            <textarea style="width: 100%; height: 60px;">${page.access_token}</textarea>
          </div>
        `;
      });
    }
    
    if (targetPage) {
      html += `
        <h2>✅ Copy This Token:</h2>
        <pre style="background: #f0f0f0; padding: 15px;">${targetPage.access_token}</pre>
      `;
    }
    
    html += '</body></html>';
    res.send(html);
    
  } catch (error) {
    console.error('❌ Debug Error:', error.response?.data || error.message);
    res.send(`
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1>❌ Token Error</h1>
          <p>${error.response?.data?.error?.message || error.message}</p>
          <p><a href="/api/v1/admin/facebook-auth">Click here to get proper Facebook authorization</a></p>
        </body>
      </html>
    `);
  }
});



// Get Facebook posts with engagement data
router.get('/facebook-posts', async (req, res) => {
  try {
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const connectedPagesRef = ref(db, 'connectedPages/admin');
    const snapshot = await get(connectedPagesRef);
    
    if (!snapshot.exists()) {
      return res.json({ success: true, posts: [] });
    }
    
    const pages = Object.values(snapshot.val());
    const allPosts = [];
    
    for (const page of pages) {
      try {
        // Get page profile picture
        const pageInfoResponse = await axios.get(`https://graph.facebook.com/v23.0/${page.id}`, {
          params: {
            fields: 'picture{url}',
            access_token: page.accessToken
          }
        });
        
        const response = await axios.get(`https://graph.facebook.com/v23.0/${page.id}/posts`, {
          params: {
            fields: 'id,message,created_time,reactions.summary(true),comments.summary(true),shares,full_picture,attachments{media,url}',
            limit: 10,
            access_token: page.accessToken
          }
        });
        
        const posts = response.data.data || [];
        const profilePictureUrl = pageInfoResponse.data.picture?.data?.url || null;
        
        posts.forEach(post => {
          allPosts.push({
            id: post.id,
            message: post.message || 'No message',
            createdTime: post.created_time,
            pageName: page.name,
            pageId: page.id,
            profilePicture: profilePictureUrl,
            reactions: post.reactions?.summary?.total_count || 0,
            comments: post.comments?.summary?.total_count || 0,
            shares: post.shares?.count || 0,
            image: post.full_picture || post.attachments?.data?.[0]?.media?.image?.src || null
          });
        });
      } catch (error) {
        console.error(`❌ Error fetching posts for page ${page.id}:`, error.response?.data || error.message);
      }
    }
    
    // Sort by creation time (newest first)
    allPosts.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
    
    res.json({ success: true, posts: allPosts });
  } catch (error) {
    console.error('Error fetching Facebook posts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Account Management Routes
router.patch('/account/:accountId/toggle-active', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { active } = req.body;
    
    const { ref, update } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const accountRef = ref(db, `connectedPages/admin/${accountId}`);
    await update(accountRef, { active });
    
    res.json({
      success: true,
      message: `Account ${active ? 'activated' : 'deactivated'} successfully`
    });
    
  } catch (error) {
    console.error('❌ Toggle Account Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/account/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const { ref, remove } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const accountRef = ref(db, `connectedPages/admin/${accountId}`);
    await remove(accountRef);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete Account Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Page Post Insights API Metrics
router.get('/test-post-insights/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Get access token from Firebase
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    // Extract page ID from post ID (format: pageId_postId)
    const pageId = postId.split('_')[0];
    const pageRef = ref(db, `connectedPages/admin/${pageId}`);
    const snapshot = await get(pageRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    
    const pageData = snapshot.val();
    const accessToken = pageData.accessToken;
    
    // Test all available Page Post Insights metrics
    const metrics = [
      // Post Reactions (Detailed)
      'post_reactions_like_total',
      'post_reactions_love_total', 
      'post_reactions_wow_total',
      'post_reactions_haha_total',
      'post_reactions_sorry_total',
      'post_reactions_anger_total',
      'post_reactions_by_type_total',
      
      // Post Impressions
      'post_impressions',
      'post_impressions_unique',
      'post_impressions_paid',
      'post_impressions_organic',
      
      // Post Engagement
      'post_clicks',
      'post_clicks_by_type'
    ];
    
    const results = {};
    
    for (const metric of metrics) {
      try {
        const response = await axios.get(`https://graph.facebook.com/v23.0/${postId}/insights`, {
          params: {
            metric: metric,
            period: 'lifetime',
            access_token: accessToken
          }
        });
        
        results[metric] = {
          success: true,
          data: response.data.data[0]?.values[0]?.value || 0
        };
      } catch (error) {
        results[metric] = {
          success: false,
          error: error.response?.data?.error?.message || error.message
        };
      }
    }
    
    res.json({
      success: true,
      postId: postId,
      metrics: results
    });
    
  } catch (error) {
    console.error('❌ Test Post Insights Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test all posts insights for a page
router.get('/test-all-posts-insights/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    // Get access token from Firebase
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const pageRef = ref(db, `connectedPages/admin/${pageId}`);
    const snapshot = await get(pageRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    
    const pageData = snapshot.val();
    const accessToken = pageData.accessToken;
    
    // Get recent posts
    const postsResponse = await axios.get(`https://graph.facebook.com/v23.0/${pageId}/posts`, {
      params: {
        fields: 'id,message,created_time',
        limit: 3,
        access_token: accessToken
      }
    });
    
    const posts = postsResponse.data.data || [];
    const postsWithInsights = [];
    
    for (const post of posts) {
      try {
        // Test key metrics for each post
        const insightsResponse = await axios.get(`https://graph.facebook.com/v23.0/${post.id}/insights`, {
          params: {
            metric: 'post_reactions_like_total,post_reactions_love_total,post_impressions,post_impressions_unique',
            period: 'lifetime',
            access_token: accessToken
          }
        });
        
        const insights = {};
        insightsResponse.data.data.forEach(metric => {
          insights[metric.name] = metric.values[0]?.value || 0;
        });
        
        postsWithInsights.push({
          id: post.id,
          message: post.message?.substring(0, 100) + '...' || 'No message',
          createdTime: post.created_time,
          insights: insights
        });
        
      } catch (error) {
        postsWithInsights.push({
          id: post.id,
          message: post.message?.substring(0, 100) + '...' || 'No message',
          createdTime: post.created_time,
          error: error.response?.data?.error?.message || error.message
        });
      }
    }
    
    res.json({
      success: true,
      pageId: pageId,
      pageName: pageData.name,
      postsCount: posts.length,
      posts: postsWithInsights
    });
    
  } catch (error) {
    console.error('❌ Test All Posts Insights Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Page-level Insights with debugging
router.get('/test-page-insights/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const pageRef = ref(db, `connectedPages/admin/${pageId}`);
    const snapshot = await get(pageRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    
    const pageData = snapshot.val();
    const accessToken = pageData.accessToken;
    
    const results = {};
    
    // Test page_post_engagements with different periods
    try {
      const response = await axios.get(`https://graph.facebook.com/v23.0/${pageId}/insights`, {
        params: {
          metric: 'page_post_engagements',
          period: 'days_28',
          access_token: accessToken
        }
      });
      
      results.page_post_engagements = {
        success: true,
        fullData: response.data
      };
    } catch (error) {
      results.page_post_engagements = {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        code: error.response?.data?.error?.code
      };
    }
    
    // Test page_follows
    try {
      const response = await axios.get(`https://graph.facebook.com/v23.0/${pageId}/insights`, {
        params: {
          metric: 'page_follows',
          period: 'day',
          access_token: accessToken
        }
      });
      
      results.page_follows = {
        success: true,
        fullData: response.data
      };
    } catch (error) {
      results.page_follows = {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        code: error.response?.data?.error?.code
      };
    }
    
    res.json({
      success: true,
      pageId: pageId,
      pageName: pageData.name,
      results: results
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check page likes count
router.get('/check-page-likes', async (req, res) => {
  try {
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const connectedPagesRef = ref(db, 'connectedPages/admin');
    const snapshot = await get(connectedPagesRef);
    
    if (!snapshot.exists()) {
      return res.json({ success: true, pages: [] });
    }
    
    const pages = Object.values(snapshot.val());
    const pageStats = [];
    
    for (const page of pages) {
      try {
        const response = await axios.get(`https://graph.facebook.com/v23.0/${page.id}`, {
          params: {
            fields: 'name,fan_count,followers_count,talking_about_count',
            access_token: page.accessToken
          }
        });
        
        pageStats.push({
          id: page.id,
          name: response.data.name,
          fan_count: response.data.fan_count || 0,
          followers_count: response.data.followers_count || 0,
          talking_about_count: response.data.talking_about_count || 0,
          insights_eligible: (response.data.fan_count || 0) >= 100
        });
      } catch (error) {
        pageStats.push({
          id: page.id,
          name: page.name,
          error: error.message
        });
      }
    }
    
    res.json({ success: true, pages: pageStats });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Instagram Insights API Metrics
router.get('/test-instagram-insights/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const pageRef = ref(db, `connectedPages/admin/${pageId}`);
    const snapshot = await get(pageRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    
    const pageData = snapshot.val();
    const accessToken = pageData.accessToken;
    
    // Get Instagram account ID
    const pageInfoResponse = await axios.get(`https://graph.facebook.com/v23.0/${pageId}`, {
      params: {
        fields: 'instagram_business_account',
        access_token: accessToken
      }
    });
    
    const igAccountId = pageInfoResponse.data.instagram_business_account?.id;
    
    if (!igAccountId) {
      return res.json({ success: false, error: 'No Instagram account connected' });
    }
    
    // Test all available Instagram Insights metrics
    const metrics = [
      'accounts_engaged',
      'reach', 
      'views',
      'likes',
      'comments',
      'shares',
      'saves',
      'total_interactions',
      'follows_and_unfollows',
      'profile_links_taps'
    ];
    
    const results = {};
    
    for (const metric of metrics) {
      try {
        const response = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}/insights`, {
          params: {
            metric: metric,
            period: 'day',
            metric_type: 'total_value',
            access_token: accessToken
          }
        });
        
        results[metric] = {
          success: true,
          data: response.data.data[0]?.total_value?.value || 0
        };
      } catch (error) {
        results[metric] = {
          success: false,
          error: error.response?.data?.error?.message || error.message
        };
      }
    }
    
    res.json({
      success: true,
      igAccountId: igAccountId,
      pageName: pageData.name,
      metrics: results
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Instagram posts with engagement data
router.get('/instagram-posts/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const pageRef = ref(db, `connectedPages/admin/${pageId}`);
    const snapshot = await get(pageRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    
    const pageData = snapshot.val();
    const accessToken = pageData.accessToken;
    
    // Get Instagram account ID
    const pageInfoResponse = await axios.get(`https://graph.facebook.com/v23.0/${pageId}`, {
      params: {
        fields: 'instagram_business_account',
        access_token: accessToken
      }
    });
    
    const igAccountId = pageInfoResponse.data.instagram_business_account?.id;
    
    if (!igAccountId) {
      return res.json({ success: true, posts: [] });
    }
    
    // Get Instagram account info
    const igInfoResponse = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}`, {
      params: {
        fields: 'name,username,profile_picture_url',
        access_token: accessToken
      }
    });
    
    const igName = igInfoResponse.data.name || igInfoResponse.data.username || 'Instagram Account';
    const profilePictureUrl = igInfoResponse.data.profile_picture_url || null;
    
    // Get Instagram posts
    const response = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}/media`, {
      params: {
        fields: 'id,caption,timestamp,media_type,media_url,thumbnail_url,permalink,like_count,comments_count',
        limit: 10,
        access_token: accessToken
      }
    });
    
    const posts = response.data.data || [];
    const formattedPosts = posts.map(post => ({
      id: post.id,
      caption: post.caption || 'No caption',
      createdTime: post.timestamp,
      mediaType: post.media_type,
      mediaUrl: post.media_url,
      thumbnailUrl: post.thumbnail_url,
      permalink: post.permalink,
      likes: post.like_count || 0,
      comments: post.comments_count || 0,
      pageName: igName,
      pageId: pageId,
      profilePicture: profilePictureUrl,
      image: post.media_url
    }));
    
    res.json({ success: true, posts: formattedPosts });
    
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Instagram posts from all connected pages
router.get('/instagram-posts', async (req, res) => {
  try {
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const connectedPagesRef = ref(db, 'connectedPages/admin');
    const snapshot = await get(connectedPagesRef);
    
    if (!snapshot.exists()) {
      return res.json({ success: true, posts: [] });
    }
    
    const pages = Object.values(snapshot.val());
    const allPosts = [];
    
    for (const page of pages) {
      try {
        // Get Instagram account ID
        const pageInfoResponse = await axios.get(`https://graph.facebook.com/v23.0/${page.id}`, {
          params: {
            fields: 'instagram_business_account',
            access_token: page.accessToken
          }
        });
        
        const igAccountId = pageInfoResponse.data.instagram_business_account?.id;
        
        if (!igAccountId) {
          continue;
        }
        
        // Get Instagram account info
        const igInfoResponse = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}`, {
          params: {
            fields: 'name,username,profile_picture_url',
            access_token: page.accessToken
          }
        });
        
        const igName = igInfoResponse.data.name || igInfoResponse.data.username || 'Instagram Account';
        const profilePictureUrl = igInfoResponse.data.profile_picture_url || null;
        
        // Get Instagram posts
        const response = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}/media`, {
          params: {
            fields: 'id,caption,timestamp,media_type,media_url,thumbnail_url,permalink,like_count,comments_count',
            limit: 10,
            access_token: page.accessToken
          }
        });
        
        const posts = response.data.data || [];
        posts.forEach(post => {
          allPosts.push({
            id: post.id,
            caption: post.caption || 'No caption',
            createdTime: post.timestamp,
            mediaType: post.media_type,
            mediaUrl: post.media_url,
            thumbnailUrl: post.thumbnail_url,
            permalink: post.permalink,
            likes: post.like_count || 0,
            comments: post.comments_count || 0,
            pageName: igName,
            pageId: page.id,
            profilePicture: profilePictureUrl,
            image: post.media_url
          });
        });
      } catch (error) {
        console.error(`❌ Error fetching Instagram posts for page ${page.id}:`, error.response?.data || error.message);
      }
    }
    
    // Sort by creation time (newest first)
    allPosts.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
    
    res.json({ success: true, posts: allPosts });
    
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Twitter OAuth 2.0 authorization
router.get('/twitter-oauth', async (req, res) => {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const redirectUri = process.env.TWITTER_REDIRECT_URI;
    
    const scopes = 'tweet.read users.read tweet.write';
    const state = Date.now().toString();
    
    // Generate proper PKCE code challenge
    const crypto = await import('crypto');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    
    // Store code verifier for callback
    global.twitterCodeVerifier = codeVerifier;
    
    const authUrl = `https://twitter.com/i/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${state}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;
    
    res.redirect(authUrl);
  } catch (error) {
    res.status(500).send(`<html><body><h1>Error</h1><p>${error.message}</p></body></html>`);
  }
});

router.get('/twitter-callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;
    
    console.log('Twitter callback received:', { code: !!code, state, error, error_description });
    
    if (error) {
      return res.send(`
        <html>
          <body>
            <h1>❌ Twitter Authorization Failed</h1>
            <p><strong>Error:</strong> ${error}</p>
            <p><strong>Description:</strong> ${error_description || 'No description provided'}</p>
            <p><strong>Solution:</strong> Add callback URL to Twitter app settings</p>
            <a href="/api/v1/admin/twitter-oauth">Try Again</a>
          </body>
        </html>
      `);
    }
    
    if (!code) {
      return res.send(`
        <html>
          <body>
            <h1>❌ Authorization Code Missing</h1>
            <p>Please add this callback URL to your Twitter app:</p>
            <code>http://localhost:3000/api/v1/admin/twitter-callback</code>
            <br><br>
            <a href="https://developer.twitter.com/en/portal/dashboard">Twitter Developer Portal</a>
          </body>
        </html>
      `);
    }
    
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    const redirectUri = process.env.TWITTER_REDIRECT_URI;
    
    // Exchange code for access token (confidential client)
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const tokenResponse = await axios.post('https://api.twitter.com/2/oauth2/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code,
        code_verifier: global.twitterCodeVerifier
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // Store Twitter account in Firebase
    const { ref, set } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    // Get user info with the new token
    const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      params: { 'user.fields': 'name,username,profile_image_url,public_metrics' }
    });
    
    const userInfo = userResponse.data.data;
    
    // Save Twitter account to Firebase
    const twitterAccountRef = ref(db, `connectedAccounts/admin/twitter/${userInfo.id}`);
    await set(twitterAccountRef, {
      id: userInfo.id,
      name: userInfo.name,
      username: userInfo.username,
      profilePicture: userInfo.profile_image_url,
      followersCount: userInfo.public_metrics?.followers_count || 0,
      accessToken: accessToken,
      connectedAt: new Date().toISOString(),
      status: 'active',
      platform: 'twitter'
    });
    
    global.twitterUserToken = accessToken;
    
    res.send(`
      <html>
        <body>
          <h1>✅ Twitter Authorization Complete!</h1>
          <p>Token saved to Firebase. You can now fetch Twitter posts.</p>
          <script>setTimeout(() => window.close(), 2000);</script>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Twitter callback error:', error.response?.data || error.message);
    res.send(`
      <html>
        <body>
          <h1>❌ Twitter Authorization Failed</h1>
          <p>${error.response?.data?.error_description || error.message}</p>
          <p>Check server logs for details.</p>
        </body>
      </html>
    `);
  }
});

// Get connected Twitter accounts
router.get('/connected-twitter-accounts', async (req, res) => {
  try {
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const twitterAccountsRef = ref(db, 'connectedAccounts/admin/twitter');
    const snapshot = await get(twitterAccountsRef);
    
    const accounts = snapshot.exists() ? Object.values(snapshot.val()) : [];
    
    res.json({
      success: true,
      accounts: accounts.map(account => ({
        id: account.id,
        name: account.name,
        username: account.username,
        profilePicture: account.profilePicture,
        followersCount: account.followersCount,
        connectedAt: account.connectedAt,
        status: account.status,
        platform: 'twitter'
      }))
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Twitter account
router.delete('/twitter-account/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const { ref, remove } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const accountRef = ref(db, `connectedAccounts/admin/twitter/${accountId}`);
    await remove(accountRef);
    
    res.json({
      success: true,
      message: 'Twitter account disconnected successfully'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Twitter insights with Free tier limitations
router.get('/twitter-insights/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const accountRef = ref(db, `connectedAccounts/admin/twitter/${accountId}`);
    const snapshot = await get(accountRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Twitter account not found' });
    }
    
    const account = snapshot.val();
    
    // Get recent tweets with metrics (Free tier allows this)
    const tweetsResponse = await axios.get(`https://api.twitter.com/2/users/${accountId}/tweets`, {
      headers: { 'Authorization': `Bearer ${account.accessToken}` },
      params: {
        max_results: 10,
        'tweet.fields': 'created_at,public_metrics'
      }
    });
    
    const tweets = tweetsResponse.data.data || [];
    
    // Calculate basic engagement metrics
    const totalTweets = tweets.length;
    const totalLikes = tweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.like_count || 0), 0);
    const totalRetweets = tweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.retweet_count || 0), 0);
    const totalReplies = tweets.reduce((sum, tweet) => sum + (tweet.public_metrics?.reply_count || 0), 0);
    const totalEngagement = totalLikes + totalRetweets + totalReplies;
    
    const insights = {
      account: {
        name: account.name,
        username: account.username,
        followersCount: account.followersCount
      },
      metrics: {
        totalTweets,
        totalLikes,
        totalRetweets, 
        totalReplies,
        totalEngagement,
        avgEngagementPerTweet: totalTweets > 0 ? Math.round(totalEngagement / totalTweets) : 0
      },
      limitation: 'Twitter Free tier - Limited analytics available',
      lastUpdated: new Date().toISOString()
    };
    
    // Cache insights in Firebase
    const insightsRef = ref(db, `twitterInsights/admin/${accountId}`);
    await set(insightsRef, insights);
    
    res.json({ success: true, insights });
    
  } catch (error) {
    console.error('Twitter insights error:', error.response?.data || error.message);
    
    // Try to get cached insights from Firebase
    try {
      const { ref, get } = await import('firebase/database');
      const { getDatabase } = await import('firebase/database');
      const { initializeApp } = await import('firebase/app');
      const { config } = await import('../config/config.mjs');
      
      const app = initializeApp(config.firebase);
      const db = getDatabase(app, config.firebase.databaseURL);
      
      const cachedInsightsRef = ref(db, `twitterInsights/admin/${accountId}`);
      const cachedSnapshot = await get(cachedInsightsRef);
      
      if (cachedSnapshot.exists()) {
        const cachedInsights = cachedSnapshot.val();
        return res.json({ 
          success: true, 
          insights: {
            ...cachedInsights,
            limitation: 'Cached data - Twitter API rate limited (1 req/15min)'
          },
          cached: true
        });
      }
    } catch (cacheError) {
      console.error('Error retrieving cached insights:', cacheError.message);
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Twitter Free tier has limited analytics access',
      details: error.message 
    });
  }
});

router.get('/twitter-posts', async (req, res) => {
  try {
    const { ref, get, set } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    const twitterAccountsRef = ref(db, 'connectedAccounts/admin/twitter');
    const snapshot = await get(twitterAccountsRef);
    
    if (!snapshot.exists()) {
      return res.json({ 
        success: true, 
        posts: [],
        message: 'No Twitter accounts connected.',
        authUrl: '/api/v1/admin/twitter-oauth'
      });
    }
    
    const accounts = Object.values(snapshot.val());
    const allPosts = [];
    let hasApiError = false;
    
    for (const account of accounts) {
      try {
        const tweetsResponse = await axios.get(`https://api.twitter.com/2/users/${account.id}/tweets`, {
          headers: { 'Authorization': `Bearer ${account.accessToken}` },
          params: {
            max_results: 10,
            'tweet.fields': 'created_at,public_metrics'
          }
        });

        const posts = tweetsResponse.data.data?.map(tweet => ({
          id: tweet.id,
          message: tweet.text,
          createdTime: tweet.created_at,
          pageName: account.name,
          pageId: account.id,
          profilePicture: account.profilePicture,
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0
        })) || [];
        
        allPosts.push(...posts);
      } catch (error) {
        console.error(`Error fetching tweets for ${account.username}:`, error.response?.data || error.message);
        hasApiError = true;
      }
    }
    
    if (allPosts.length > 0) {
      // Sort by creation time (newest first)
      allPosts.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
      
      // Save posts to Firebase
      const postsRef = ref(db, 'twitterPosts/admin');
      await set(postsRef, {
        posts: allPosts,
        lastUpdated: new Date().toISOString()
      });
      
      return res.json({ success: true, posts: allPosts });
    }
    
    // If API failed, try to get cached posts
    if (hasApiError) {
      const cachedPostsRef = ref(db, 'twitterPosts/admin');
      const cachedSnapshot = await get(cachedPostsRef);
      
      if (cachedSnapshot.exists()) {
        const cachedData = cachedSnapshot.val();
        return res.json({ 
          success: true, 
          posts: cachedData.posts || [],
          cached: true,
          lastUpdated: cachedData.lastUpdated
        });
      }
    }
    
    res.json({ success: true, posts: [] });

  } catch (error) {
    console.error('Twitter posts error:', error.message);
    
    // Try to get cached posts on error
    try {
      const { ref, get } = await import('firebase/database');
      const { getDatabase } = await import('firebase/database');
      const { initializeApp } = await import('firebase/app');
      const { config } = await import('../config/config.mjs');
      
      const app = initializeApp(config.firebase);
      const db = getDatabase(app, config.firebase.databaseURL);
      
      const cachedPostsRef = ref(db, 'twitterPosts/admin');
      const cachedSnapshot = await get(cachedPostsRef);
      
      if (cachedSnapshot.exists()) {
        const cachedData = cachedSnapshot.val();
        return res.json({ 
          success: true, 
          posts: cachedData.posts || [],
          cached: true,
          lastUpdated: cachedData.lastUpdated
        });
      }
    } catch (cacheError) {
      console.error('Error retrieving cached posts:', cacheError.message);
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save current global Twitter token to Firebase
router.post('/save-twitter-token', async (req, res) => {
  try {
    if (!global.twitterUserToken) {
      return res.status(400).json({ success: false, error: 'No global Twitter token found' });
    }
    
    const { ref, get, set: setData } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    // Get existing Twitter account
    const accountsRef = ref(db, 'connectedAccounts/admin/twitter');
    const snapshot = await get(accountsRef);
    
    if (!snapshot.exists()) {
      return res.status(400).json({ success: false, error: 'No Twitter accounts found in Firebase' });
    }
    
    const accounts = Object.values(snapshot.val());
    const firstAccount = accounts[0];
    
    // Update with current global token
    const accountRef = ref(db, `connectedAccounts/admin/twitter/${firstAccount.id}`);
    await setData(accountRef, {
      ...firstAccount,
      accessToken: global.twitterUserToken,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'Twitter token saved to Firebase',
      accountId: firstAccount.id,
      username: firstAccount.username
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Twitter posting with OAuth 2.0
router.post('/test-twitter-post', async (req, res) => {
  try {
    const { content } = req.body;
    
    const socialMediaService = await import('../services/socialMediaService.mjs');
    const result = await socialMediaService.default.postToTwitter(content);
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Twitter test post error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check platform availability for task creation
router.get('/platform-availability', async (req, res) => {
  try {
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    
    // Check Facebook pages
    const connectedPagesRef = ref(db, 'connectedPages/admin');
    const pagesSnapshot = await get(connectedPagesRef);
    
    let facebookAvailable = false;
    let instagramAvailable = false;
    
    if (pagesSnapshot.exists()) {
      const pages = Object.values(pagesSnapshot.val());
      const activePages = pages.filter(page => page.active === true);
      
      if (activePages.length > 0) {
        facebookAvailable = true;
        
        // Check if ANY active page has Instagram
        for (const activePage of activePages) {
          try {
            const response = await axios.get(`https://graph.facebook.com/v23.0/${activePage.id}`, {
              params: {
                fields: 'instagram_business_account',
                access_token: activePage.accessToken
              }
            });
            
            if (response.data.instagram_business_account) {
              instagramAvailable = true;
              break; // Found one with Instagram, that's enough
            }
          } catch (error) {
            console.log(`Error checking Instagram for page ${activePage.id}:`, error.message);
          }
        }
      }
    }
    
    // Check Twitter accounts
    const twitterAccountsRef = ref(db, 'connectedAccounts/admin/twitter');
    const twitterSnapshot = await get(twitterAccountsRef);
    const twitterAvailable = twitterSnapshot.exists();
    
    res.json({
      success: true,
      platforms: {
        facebook: facebookAvailable,
        instagram: instagramAvailable,
        twitter: twitterAvailable
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;