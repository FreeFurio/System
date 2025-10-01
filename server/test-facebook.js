import axios from 'axios';

// Test Facebook Native Posting
async function testFacebookPosting() {
  console.log('🧪 Testing Facebook Native Posting...');
  console.log('='.repeat(50));

  try {
    // You need to replace these with your actual values
    const testData = {
      userAccessToken: 'YOUR_USER_ACCESS_TOKEN_HERE', // Get from Facebook Graph API Explorer
      pageId: 'YOUR_PAGE_ID_HERE', // Your Facebook page ID
      message: 'Testing native Facebook posting! This should appear without "via CMS System" 🚀'
    };

    console.log('📝 Test Data:');
    console.log('- Page ID:', testData.pageId);
    console.log('- Message:', testData.message);
    console.log('- User Token:', testData.userAccessToken ? 'PROVIDED' : 'MISSING');

    if (!testData.userAccessToken || testData.userAccessToken === 'YOUR_USER_ACCESS_TOKEN_HERE') {
      console.log('❌ Please update the userAccessToken in this script');
      console.log('📋 Get it from: https://developers.facebook.com/tools/explorer/');
      console.log('🔑 Required permissions: pages_manage_posts, pages_read_engagement');
      return;
    }

    if (!testData.pageId || testData.pageId === 'YOUR_PAGE_ID_HERE') {
      console.log('❌ Please update the pageId in this script');
      console.log('📋 Find your page ID in Facebook Page Settings');
      return;
    }

    console.log('\n📡 Making API call...');
    
    const response = await axios.post('http://localhost:3000/api/v1/social/facebook/test-native-post', testData);

    console.log('\n✅ SUCCESS!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    console.log('\n🎉 Check your Facebook page - the post should appear as native content!');
    console.log('🔍 Look for: NO "via CMS System" attribution');

  } catch (error) {
    console.log('\n❌ ERROR!');
    console.log('🚨 Message:', error.message);
    if (error.response) {
      console.log('📋 Details:', JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('='.repeat(50));
}

// Run the test
testFacebookPosting();