import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function getInstagramId() {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  
  console.log('🔍 Getting Instagram Business Account ID...\n');
  
  try {
    // Get page with Instagram connection
    const pageResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account{id,username}&access_token=${token}`
    );
    
    console.log('📄 Page response:', JSON.stringify(pageResponse.data, null, 2));
    
    if (pageResponse.data.instagram_business_account) {
      const igAccount = pageResponse.data.instagram_business_account;
      console.log('✅ Instagram Business Account found!');
      console.log('📷 Account ID:', igAccount.id);
      console.log('👤 Username:', igAccount.username);
      
      // Test posting with this ID
      const testImageUrl = 'https://picsum.photos/1080/1080';
      
      const mediaData = {
        image_url: testImageUrl,
        caption: `Test post from @${igAccount.username} - ${new Date().toISOString()}`,
        access_token: token
      };
      
      console.log('\n📷 Testing Instagram posting...');
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${igAccount.id}/media`,
        mediaData
      );
      
      const creationId = containerResponse.data.id;
      console.log('✅ Media container created:', creationId);
      
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${igAccount.id}/media_publish`,
        {
          creation_id: creationId,
          access_token: token
        }
      );
      
      console.log('✅ Instagram posting successful!');
      console.log('📝 Post ID:', publishResponse.data.id);
      console.log('\n🔧 Update your .env with:');
      console.log(`INSTAGRAM_BUSINESS_ACCOUNT_ID=${igAccount.id}`);
      
    } else {
      console.log('❌ No Instagram Business Account found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error?.message || error.message);
    if (error.response?.data) {
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

getInstagramId();