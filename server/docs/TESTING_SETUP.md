# Social Media Automation - Testing Setup

## 🧪 Development/Testing Mode Configuration

This setup is for **TESTING ONLY** - no app review required from platforms.

## Platform Setup for Testing

### 1. Facebook (Testing Mode)
- **App Status**: Development mode
- **Test Users**: Add test Facebook accounts in App Dashboard
- **Pages**: Create test Facebook pages
- **Permissions**: `pages_manage_posts`, `pages_read_engagement`
- **No Review Required**: Can post to test pages and test users

### 2. Instagram (Testing Mode)  
- **Requirements**: Instagram Business Account connected to Facebook Page
- **Test Account**: Use Instagram test account linked to Facebook test page
- **API**: Uses Facebook Graph API (same credentials)
- **Limitations**: Can only post to connected Instagram Business accounts

### 3. Twitter (Developer Mode)
- **App Status**: Development environment
- **API Access**: Essential/Basic tier sufficient for testing
- **Test Account**: Your own Twitter account for testing
- **Permissions**: Read and Write access

## Required API Keys Setup

### Facebook Developer Console:
1. Go to https://developers.facebook.com/
2. Create new app → "Business" type
3. Add "Facebook Login" and "Instagram Basic Display" products
4. Get App ID and App Secret
5. Add test users in "Roles" → "Test Users"

### Twitter Developer Portal:
1. Go to https://developer.twitter.com/
2. Create new project/app
3. Generate API keys and tokens
4. Set app permissions to "Read and Write"

## Environment Variables to Update:

```env
# Replace these with your actual API keys:
TWITTER_API_KEY=your_actual_twitter_api_key
TWITTER_API_SECRET=your_actual_twitter_api_secret  
TWITTER_ACCESS_TOKEN=your_actual_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_actual_access_token_secret
TWITTER_BEARER_TOKEN=your_actual_bearer_token
```

## Testing Limitations

### Facebook:
- ✅ Can post to test pages
- ✅ Can post to test user accounts
- ❌ Cannot post to public pages (requires app review)

### Instagram:
- ✅ Can post to connected business accounts
- ✅ Can post images with captions
- ❌ Limited to accounts you own/manage

### Twitter:
- ✅ Can post to your own account
- ✅ Full API access for testing
- ✅ Can post text and media

## Test Endpoints

```bash
# Test AI content generation
POST /api/v1/ai/generate-all
{
  "platform": "facebook",
  "topic": "Test post"
}

# Test social media posting
POST /api/v1/social/post
{
  "platform": "facebook",
  "content": {
    "headline": "Test Headline",
    "caption": "Test caption",
    "hashtag": "#test"
  },
  "tokens": {
    "accessToken": "your_facebook_access_token",
    "pageId": "your_test_page_id"
  }
}

# Test generate and auto-post
POST /api/v1/social/generate-and-post
{
  "topic": "Coffee shop opening",
  "platforms": [{"name": "facebook"}, {"name": "twitter"}],
  "tokens": {
    "facebook": {
      "accessToken": "fb_token",
      "pageId": "page_id"
    }
  }
}
```

## Notes for Testing:
- All posts will only be visible to test accounts
- No public posting until app review (not needed for testing)
- Rate limits are more lenient in development mode
- Use test data and test accounts only