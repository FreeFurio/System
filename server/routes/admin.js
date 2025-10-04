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

router.get('/get-page-token', async (req, res) => {
  try {
    const userToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const targetPageId = process.env.FACEBOOK_PAGE_ID;
    
    console.log('🚀 Getting Page access token via API...');
    
    const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: {
        access_token: userToken
      }
    });
    
    const pages = response.data.data;
    const targetPage = pages.find(page => page.id === targetPageId);
    
    let html = `
      <html>
        <head><title>Facebook Page Token Generator</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Facebook Page Access Token</h1>
          <h2>Target Page ID: ${targetPageId}</h2>
    `;
    
    if (pages.length === 0) {
      html += '<p style="color: red;">No pages found. User token may not have page admin permissions.</p>';
    } else {
      html += '<h3>Available Pages:</h3><ul>';
      pages.forEach(page => {
        const isTarget = page.id === targetPageId;
        html += `<li style="${isTarget ? 'background: #e8f5e8; padding: 10px; margin: 5px;' : ''}">`;
        html += `<strong>${page.name}</strong> (ID: ${page.id})`;
        if (isTarget) {
          html += '<br><strong style="color: green;">✅ TARGET PAGE FOUND!</strong>';
          html += `<br><strong>Page Access Token:</strong><br><textarea style="width: 100%; height: 100px;">${page.access_token}</textarea>`;
        }
        html += '</li>';
      });
      html += '</ul>';
    }
    
    if (targetPage) {
      html += `
        <h3>Update your .env file:</h3>
        <pre style="background: #f0f0f0; padding: 10px;">FACEBOOK_PAGE_ACCESS_TOKEN=${targetPage.access_token}</pre>
      `;
    }
    
    html += '</body></html>';
    
    res.send(html);
  } catch (error) {
    console.error('❌ Page Token Error:', error.message);
    res.send(`<html><body><h1>Error</h1><p>${error.message}</p></body></html>`);
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

router.get('/facebook-auth', async (req, res) => {
  try {
    const appId = process.env.FB_APP_ID;
    const redirectUri = 'http://localhost:3000/api/v1/admin/facebook-callback';
    const scopes = 'pages_manage_posts,pages_read_engagement,pages_show_list,manage_pages';
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
    
    res.send(`
      <html>
        <head><title>Facebook Authorization</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>Get Facebook Page Token</h1>
          <p>Click the link below to authorize with Facebook and get page access:</p>
          <a href="${authUrl}" style="background: #1877f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Authorize Facebook</a>
          <p style="margin-top: 20px; color: #666;">This will redirect you back with the proper page tokens.</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.send(`<html><body><h1>Error</h1><p>${error.message}</p></body></html>`);
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
    const redirectUri = 'http://localhost:3000/api/v1/admin/facebook-oauth-callback';
    
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
    
    res.json({
      success: true,
      pages: pages.map(page => ({
        id: page.id,
        name: page.name,
        category: page.category,
        connectedAt: page.connectedAt,
        status: page.status
      }))
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
    const redirectUri = 'http://localhost:3000/api/v1/admin/facebook-oauth-callback';
    
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



export default router;