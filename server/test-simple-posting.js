import SocialMediaService from './services/socialMediaService.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function testSimplePosting() {
  console.log('🧪 Testing simple posting without images...\n');
  
  const testContent = {
    headline: 'Test Headline',
    caption: 'This is a test caption for debugging social media posting',
    hashtag: '#test #debug #socialmedia'
  };
  
  // Test Twitter without image first
  console.log('🐦 Testing Twitter (text only)...');
  try {
    const result = await SocialMediaService.postToTwitter(testContent);
    console.log('✅ Twitter posting successful:', result.postId);
  } catch (error) {
    console.error('❌ Twitter posting failed:', error.message);
  }
  
  console.log('\n📘 Testing Facebook...');
  try {
    const result = await SocialMediaService.postToFacebook(
      testContent,
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      process.env.FACEBOOK_PAGE_ID
    );
    console.log('✅ Facebook posting successful:', result.postId);
  } catch (error) {
    console.error('❌ Facebook posting failed:', error.message);
  }
}

testSimplePosting();