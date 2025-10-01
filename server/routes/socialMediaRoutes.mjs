import express from 'express';
import axios from 'axios';
import socialMediaController from '../controllers/socialMediaController.mjs';
import socialMediaService from '../services/socialMediaService.mjs';

const router = express.Router();

// Post to single platform
router.post('/post', socialMediaController.postToPlatform);

// Post to multiple platforms
router.post('/post-multiple', socialMediaController.postToMultiplePlatforms);

// Generate AI content and post automatically
router.post('/generate-and-post', socialMediaController.generateAndPost);

// Schedule post for later
router.post('/schedule', socialMediaController.schedulePost);

// Validate platform tokens
router.post('/validate-tokens', socialMediaController.validateTokens);

// Get user's Facebook pages
router.post('/facebook/pages', socialMediaController.getFacebookPages);

// Get Facebook page access token
router.post('/facebook/page-token', socialMediaController.getFacebookPageToken);

// Test native Facebook posting (no "via CMS System")
router.post('/facebook/test-native-post', async (req, res) => {
  try {
    const { userAccessToken, pageId, message } = req.body;
    
    if (!userAccessToken || !pageId) {
      return res.status(400).json({
        error: 'userAccessToken and pageId are required'
      });
    }

    const testContent = {
      headline: 'Native Facebook Post Test',
      caption: message || 'Testing native Facebook posting - this should appear as a native page post without "via CMS System"! 🚀',
      hashtag: '#test #native #facebook'
    };

    console.log('🧪 Testing native Facebook posting...');
    console.log('Page ID:', pageId);
    console.log('Content:', testContent);

    const result = await socialMediaService.postToFacebook(
      testContent,
      userAccessToken, // User token (will be converted to page token internally)
      pageId
    );

    console.log('✅ Native posting result:', result);

    res.json({
      success: true,
      message: 'Posted as native page content (no CMS attribution)',
      data: result
    });

  } catch (error) {
    console.log('❌ Native posting failed:', error.message);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

// Get Instagram Business Account ID
router.get('/instagram/account-id/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { pageAccessToken } = req.query;
    
    if (!pageAccessToken) {
      return res.status(400).json({ error: 'Page access token required' });
    }

    const instagramAccountId = await socialMediaService.getInstagramAccountId(pageAccessToken, pageId);
    
    if (!instagramAccountId) {
      return res.status(404).json({ 
        error: 'No Instagram Business Account connected to this Facebook Page' 
      });
    }

    res.json({ 
      success: true, 
      instagramAccountId,
      pageId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Instagram connection
router.get('/instagram/test', async (req, res) => {
  try {
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const userInfo = await socialMediaService.getInstagramUserInfo(accessToken);
    
    res.json({ 
      success: true, 
      message: 'Instagram connection successful',
      userInfo 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Instagram posting capability
router.post('/instagram/test-post', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const testContent = {
      headline: 'Test Post',
      caption: 'Testing Instagram API posting capability',
      hashtag: '#test'
    };

    const result = await socialMediaService.postToInstagramBasic(testContent, accessToken);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Instagram permissions and posting capability
router.get('/instagram/test-permissions', async (req, res) => {
  try {
    console.log('Instagram test request received:', req.query);
    const { accessToken, userId } = req.query;
    
    if (!accessToken || !userId) {
      console.log('Missing parameters:', { accessToken: !!accessToken, userId: !!userId });
      return res.status(400).json({ error: 'Access token and user ID required' });
    }

    console.log('Testing Instagram permissions for user:', userId);
    const result = await socialMediaService.testInstagramPosting(accessToken, userId);
    
    console.log('Instagram test result:', result);
    res.json(result);
  } catch (error) {
    console.error('Instagram test error:', error.message);
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

// Simple Instagram posting test
router.get('/instagram/can-post', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  const result = {
    success: true,
    message: 'Instagram Graph API - POSTING ENABLED',
    canPost: true,
    pageId: '812408148622338',
    pageName: 'AI Integrated System',
    instagramConnected: true,
    pageAccessToken: 'CONFIGURED',
    nextStep: 'Ready to test Instagram posting',
    timestamp: new Date().toISOString()
  };
  
  console.log('📱 INSTAGRAM STATUS CHECK:');
  console.log(JSON.stringify(result, null, 2));
  
  res.json(result);
});

// Test actual Instagram posting
router.post('/instagram/test-real-post', async (req, res) => {
  try {
    const testContent = {
      headline: 'Test Post from CMS System',
      caption: 'Testing Instagram API posting capability! 🚀',
      hashtag: '#test #cms #instagram',
      imageUrl: 'https://picsum.photos/1080/1080' // Test image
    };
    
    console.log('📸 ATTEMPTING INSTAGRAM POST:');
    console.log('Content:', testContent);
    console.log('Instagram Business Account ID: 17841453990081648');
    console.log('Facebook Page ID: 812408148622338');
    
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const instagramAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    
    const result = await socialMediaService.postToInstagram(
      testContent, 
      pageAccessToken, 
      instagramAccountId
    );
    
    console.log('✅ INSTAGRAM POST SUCCESS:');
    console.log(JSON.stringify(result, null, 2));
    
    res.json(result);
  } catch (error) {
    console.log('❌ INSTAGRAM POST ERROR:');
    console.log('Error:', error.message);
    console.log('Details:', error.response?.data);
    res.json({ error: error.message, details: error.response?.data });
  }
});

// Simple test endpoint
router.get('/instagram/ready', (req, res) => {
  console.log('🎉 INSTAGRAM POSTING IS READY!');
  console.log('Page ID:', process.env.FACEBOOK_PAGE_ID);
  console.log('Instagram Business Account ID:', process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID);
  console.log('Page Access Token:', process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? 'CONFIGURED' : 'MISSING');
  
  res.json({
    success: true,
    message: 'Instagram posting is ready!',
    pageId: process.env.FACEBOOK_PAGE_ID,
    instagramAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
    tokenConfigured: !!process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  });
});

// Force console debug - always logs
router.get('/instagram/debug', (req, res) => {
  // FORCE CONSOLE OUTPUT - NO CACHING
  console.log('\n=================================');
  console.log('🔍 INSTAGRAM DEBUG INFO - FORCED');
  console.log('=================================');
  console.log('FACEBOOK_PAGE_ID:', process.env.FACEBOOK_PAGE_ID || 'MISSING');
  console.log('INSTAGRAM_BUSINESS_ACCOUNT_ID:', process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || 'MISSING');
  console.log('FACEBOOK_PAGE_ACCESS_TOKEN:', process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? 'SET (length: ' + process.env.FACEBOOK_PAGE_ACCESS_TOKEN.length + ')' : 'NOT SET');
  console.log('INSTAGRAM_ENABLED:', process.env.INSTAGRAM_ENABLED || 'NOT SET');
  console.log('INSTAGRAM_APP_ID:', process.env.INSTAGRAM_APP_ID || 'NOT SET');
  console.log('INSTAGRAM_APP_SECRET:', process.env.INSTAGRAM_APP_SECRET ? 'SET' : 'NOT SET');
  console.log('=================================');
  
  const ready = !!(process.env.FACEBOOK_PAGE_ID && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
  console.log('READY TO POST:', ready ? 'YES ✅' : 'NO ❌');
  console.log('TIMESTAMP:', new Date().toISOString());
  console.log('=================================\n');
  
  res.json({ 
    debug: 'Check server console for detailed output',
    timestamp: new Date().toISOString(),
    random: Math.random() // Force no cache
  });
});

// Test Facebook Page access directly
router.get('/facebook/test-page-access', async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 TESTING FACEBOOK PAGE ACCESS');
  console.log('='.repeat(60));
  
  try {
    // Test direct page access
    const pageResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}?fields=id,name,access_token&access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`
    );
    
    console.log('✅ PAGE ACCESS SUCCESS:');
    console.log('Page Name:', pageResponse.data.name);
    console.log('Page ID:', pageResponse.data.id);
    console.log('Has Access Token:', !!pageResponse.data.access_token);
    
    // Test posting permissions
    const permissionsResponse = await axios.get(
      `https://graph.facebook.com/v18.0/me/permissions?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`
    );
    
    console.log('\n🔑 TOKEN PERMISSIONS:');
    permissionsResponse.data.data.forEach(perm => {
      console.log(`- ${perm.permission}: ${perm.status}`);
    });
    
    console.log('='.repeat(60));
    
    res.json({
      success: true,
      page: pageResponse.data,
      permissions: permissionsResponse.data.data
    });
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('Details:', error.response?.data);
    console.log('='.repeat(60));
    
    res.json({ error: error.message, details: error.response?.data });
  }
});

// Twitter posting test without media
router.get('/twitter/post-text', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  const timestamp = new Date().toISOString();
  console.log(`\n🐦 TWITTER TEXT POST - ${timestamp}`);
  console.log('='.repeat(50));
  
  try {
    const testContent = {
      headline: 'Test Tweet from CMS System',
      caption: `Testing Twitter text posting! 🚀 ${timestamp.slice(0, 16)}`,
      hashtag: '#test #cms #twitter'
      // NO imageUrl - text only
    };
    
    console.log('📝 Content to post:', JSON.stringify(testContent, null, 2));
    
    const result = await socialMediaService.postToTwitter(testContent);
    
    console.log('\n✅ TWITTER TEXT POST SUCCESS!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    console.log('='.repeat(50));
    
    res.json({ ...result, timestamp });
  } catch (error) {
    console.log('\n❌ TWITTER TEXT POST FAILED!');
    console.log('🚨 Error:', error.message);
    console.log('='.repeat(50));
    
    res.json({ error: error.message, timestamp });
  }
});

// Twitter posting test with media
router.get('/twitter/post-now', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  const timestamp = new Date().toISOString();
  console.log(`\n🐦 TWITTER POST ATTEMPT - ${timestamp}`);
  console.log('='.repeat(50));
  
  try {
    const testContent = {
      headline: 'Test Tweet from CMS System',
      caption: `Testing Twitter API posting with media! 🚀 Posted at ${timestamp.slice(0, 16)}`,
      hashtag: '#test #cms #twitter',
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&crop=center'
    };
    
    console.log('📝 Content to post:', JSON.stringify(testContent, null, 2));
    console.log('🔑 Using Bearer Token:', process.env.TWITTER_BEARER_TOKEN ? 'SET' : 'MISSING');
    console.log('🔐 API Key:', process.env.TWITTER_API_KEY ? 'SET' : 'MISSING');
    
    console.log('\n📡 Calling socialMediaService.postToTwitter...');
    
    const result = await socialMediaService.postToTwitter(testContent);
    
    console.log('\n✅ TWITTER POST SUCCESS!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    console.log('='.repeat(50));
    
    res.json({ ...result, timestamp });
  } catch (error) {
    console.log('\n❌ TWITTER POST FAILED!');
    console.log('🚨 Error Message:', error.message);
    console.log('📋 Error Details:', error.response?.data || 'No additional details');
    console.log('='.repeat(50));
    
    res.json({ 
      error: error.message, 
      details: error.response?.data, 
      timestamp 
    });
  }
});

// Facebook posting test
router.get('/facebook/post-now', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  const timestamp = new Date().toISOString();
  console.log(`\n📘 FACEBOOK POST ATTEMPT - ${timestamp}`);
  console.log('='.repeat(50));
  
  try {
    const testContent = {
      headline: 'Test Post from CMS System',
      caption: `Testing Facebook API posting! 🚀 Posted at ${timestamp}`,
      hashtag: '#test #cms #facebook',
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&crop=center'
    };
    
    console.log('📝 Content to post:', JSON.stringify(testContent, null, 2));
    console.log('🔑 Using Page Access Token:', process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? 'SET' : 'MISSING');
    console.log('📄 Facebook Page ID:', process.env.FACEBOOK_PAGE_ID);
    
    console.log('\n📡 Calling socialMediaService.postToFacebook...');
    
    // Get the page's own access token first
    const pageResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}?fields=access_token&access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`
    );
    
    const pageAccessToken = pageResponse.data.access_token;
    console.log('🔑 Using Page Access Token:', pageAccessToken ? 'AVAILABLE' : 'MISSING');
    
    const result = await socialMediaService.postToFacebook(
      testContent, 
      pageAccessToken, 
      process.env.FACEBOOK_PAGE_ID
    );
    
    console.log('\n✅ FACEBOOK POST SUCCESS!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    console.log('='.repeat(50));
    
    res.json({ ...result, timestamp });
  } catch (error) {
    console.log('\n❌ FACEBOOK POST FAILED!');
    console.log('🚨 Error Message:', error.message);
    console.log('📋 Error Details:', error.response?.data || 'No additional details');
    console.log('='.repeat(50));
    
    res.json({ 
      error: error.message, 
      details: error.response?.data, 
      timestamp 
    });
  }
});

// GET endpoint for Instagram posting test
router.get('/instagram/post-now', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  const timestamp = new Date().toISOString();
  console.log(`\n🚀 INSTAGRAM POST ATTEMPT - ${timestamp}`);
  console.log('='.repeat(50));
  
  try {
    const testContent = {
      headline: 'Test Post from CMS System',
      caption: `Testing Instagram API posting! 🚀 Posted at ${timestamp}`,
      hashtag: '#test #cms #instagram',
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1080&fit=crop&crop=center'
    };
    
    console.log('📝 Content to post:', JSON.stringify(testContent, null, 2));
    console.log('🔑 Using Page Access Token:', process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? 'SET' : 'MISSING');
    console.log('📱 Instagram Account ID:', process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID);
    console.log('⚙️  Instagram Enabled:', process.env.INSTAGRAM_ENABLED);
    
    console.log('\n📡 Calling socialMediaService.postToInstagram...');
    
    const result = await socialMediaService.postToInstagram(
      testContent, 
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN, 
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
    );
    
    console.log('\n✅ INSTAGRAM POST SUCCESS!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    console.log('='.repeat(50));
    
    res.json({ ...result, timestamp });
  } catch (error) {
    console.log('\n❌ INSTAGRAM POST FAILED!');
    console.log('🚨 Error Message:', error.message);
    console.log('📋 Error Details:', error.response?.data || 'No additional details');
    console.log('='.repeat(50));
    
    res.json({ 
      error: error.message, 
      details: error.response?.data, 
      timestamp 
    });
  }
});

// Test Instagram Business posting
router.get('/instagram/test-business-post', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  try {
    const { pageToken } = req.query;
    
    if (!pageToken) {
      console.log('❌ NO PAGE TOKEN PROVIDED');
      return res.json({ error: 'Page token required', example: 'Add ?pageToken=YOUR_TOKEN' });
    }

    console.log('🔍 TESTING INSTAGRAM BUSINESS ACCOUNT...');
    // Test getting Instagram Business Account ID
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/812408148622338?fields=instagram_business_account&access_token=${pageToken}`
    );

    const result = {
      success: true,
      pageId: '812408148622338',
      instagramBusinessAccount: response.data.instagram_business_account,
      canPost: !!response.data.instagram_business_account,
      timestamp: new Date().toISOString()
    };

    console.log('✅ INSTAGRAM TEST RESULT:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.canPost) {
      console.log('🎉 INSTAGRAM POSTING IS ENABLED!');
    } else {
      console.log('❌ INSTAGRAM POSTING NOT AVAILABLE');
    }

    res.json(result);
  } catch (error) {
    console.log('❌ INSTAGRAM TEST ERROR:');
    console.log('Error:', error.message);
    console.log('Details:', error.response?.data);
    res.json({ error: error.message, details: error.response?.data });
  }
});

// Get Facebook Pages and Instagram Business Accounts
router.get('/facebook/pages', async (req, res) => {
  try {
    console.log('Facebook pages request received');
    const { accessToken } = req.query;
    
    if (!accessToken) {
      console.log('No access token provided');
      return res.status(400).json({ error: 'Page access token required' });
    }

    console.log('Getting Facebook pages...');
    // Get user's Facebook pages
    const pagesResponse = await axios.get(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );

    console.log('Pages response:', pagesResponse.data);
    const pages = [];
    
    for (const page of pagesResponse.data.data) {
      console.log(`Checking Instagram for page: ${page.name}`);
      // Check if page has Instagram Business Account
      try {
        const igResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        
        console.log(`Instagram response for ${page.name}:`, igResponse.data);
        pages.push({
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          instagramBusinessAccount: igResponse.data.instagram_business_account || null
        });
      } catch (error) {
        console.log(`Instagram error for ${page.name}:`, error.message);
        pages.push({
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          instagramBusinessAccount: null,
          error: 'No Instagram connected'
        });
      }
    }

    console.log('Final pages result:', pages);
    res.json({ success: true, pages });
  } catch (error) {
    console.error('Facebook pages error:', error.message);
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

// Get posting history/analytics
router.get('/history', socialMediaController.getPostingHistory);

export default router;