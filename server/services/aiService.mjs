import OpenAI from 'openai';
import seoService from './seoService.mjs';

class AIService {
  constructor() {
    // Use environment variable for API key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      timeout: parseInt(process.env.AI_TIMEOUT_MS) || 30000
    });
    
    // Configuration from environment variables
    this.model = process.env.OPENAI_MODEL || 'gpt-5-mini';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 500;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 1.2;
    this.seoTemperature = parseFloat(process.env.OPENAI_SEO_TEMPERATURE) || 0.8;
    this.contentEnabled = process.env.AI_CONTENT_ENABLED === 'true';
    this.seoEnabled = process.env.AI_SEO_ANALYSIS_ENABLED === 'true';
    this.retryAttempts = parseInt(process.env.AI_RETRY_ATTEMPTS) || 3;
    
    // Platform limits
    this.platformLimits = {
      facebook: {
        headlineMax: parseInt(process.env.FACEBOOK_HEADLINE_MAX_LENGTH) || 60,
        captionMax: parseInt(process.env.FACEBOOK_CAPTION_MAX_LENGTH) || 160
      },
      instagram: {
        headlineMax: parseInt(process.env.INSTAGRAM_HEADLINE_MAX_LENGTH) || 150,
        captionMax: parseInt(process.env.INSTAGRAM_CAPTION_MAX_LENGTH) || 180
      },
      twitter: {
        headlineMax: parseInt(process.env.TWITTER_HEADLINE_MAX_LENGTH) || 30,
        captionMax: parseInt(process.env.TWITTER_CAPTION_MAX_LENGTH) || 60
      }
    };
  }

  // Validate input parameters
  validateInput(platform, topic, contentType) {
    const validPlatforms = ['facebook', 'instagram', 'twitter'];
    const validContentTypes = ['headline', 'caption', 'hashtag'];
    const maxTopicLength = parseInt(process.env.MAX_TOPIC_LENGTH) || 200;

    if (!validPlatforms.includes(platform)) {
      throw new Error(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`);
    }

    if (!validContentTypes.includes(contentType)) {
      throw new Error(`Invalid content type. Must be one of: ${validContentTypes.join(', ')}`);
    }

    if (!topic || topic.trim().length === 0) {
      throw new Error('Topic is required and cannot be empty');
    }

    if (topic.length > maxTopicLength) {
      throw new Error(`Topic too long. Maximum ${maxTopicLength} characters allowed`);
    }
  }

  // Retry mechanism for API calls
  async retryApiCall(apiCall, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }

  // Generate content for specific social media platform
  async generateContent(platform, topic, contentType) {
    // Validate inputs
    this.validateInput(platform, topic, contentType);
    const prompts = {
      facebook: {
        headline: `Create a Facebook headline about: ${topic}. Make it engaging and shareable. No hashtags.`,
        caption: `Write a Facebook caption about: ${topic}. Keep it under 160 characters. Be engaging and include emojis. No hashtags.`,
        hashtag: `Generate 5 popular Facebook hashtags for: ${topic}. Format: #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5`
      },
      instagram: {
        headline: `Create an Instagram headline about: ${topic}. Make it aesthetic and inspiring. No hashtags.`,
        caption: `Write an Instagram caption about: ${topic}. Keep it under 180 characters. Be aesthetic and include emojis. No hashtags.`,
        hashtag: `Generate 8 popular Instagram hashtags for: ${topic}. Format: #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6 #hashtag7 #hashtag8`
      },
      twitter: {
        headline: `Create a Twitter headline about: ${topic}. Keep it under 30 characters. Make it punchy. No hashtags.`,
        caption: `Write a Twitter post about: ${topic}. Keep it under 60 characters. Be brief and engaging. No hashtags.`,
        hashtag: `Generate 2 short Twitter hashtags for: ${topic}. Keep total under 30 characters. Format: #hashtag1 #hashtag2`
      }
    };

    try {
      // Check if AI content generation is enabled
      if (!this.contentEnabled) {
        throw new Error('AI content generation is currently disabled');
      }

      const limits = this.platformLimits[platform];
      const lengthGuidance = contentType === 'headline' ? 
        `Keep under ${limits.headlineMax} characters.` : 
        contentType === 'caption' ? `Keep under ${limits.captionMax} characters.` : '';

      const enhancedPrompt = `${prompts[platform][contentType]} ${lengthGuidance}`;

      const response = await this.retryApiCall(async () => {
        return await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: "system",
              content: `You are a premium social media expert and SEO specialist creating high-quality, optimized content for ${platform}. Focus on keyword integration, engagement optimization, and platform-specific best practices for maximum visibility and performance.`
            },
            {
              role: "user",
              content: enhancedPrompt
            }
          ],
          max_tokens: 200,
          temperature: this.temperature
        });
      });

      const content = response.choices[0].message.content.trim();
      
      // Validate generated content length
      if (contentType !== 'hashtag') {
        const maxLength = contentType === 'headline' ? limits.headlineMax : limits.captionMax;
        if (content.length > maxLength) {
          console.warn(`Generated ${contentType} exceeds ${maxLength} characters for ${platform}`);
        }
      }

      return content;
    } catch (error) {
      throw new Error(`AI content generation failed: ${error.message}`);
    }
  }

  // Generate all content types for a platform
  async generateAllContent(platform, topic) {
    try {
      const [headline, caption, hashtag] = await Promise.all([
        this.generateContent(platform, topic, 'headline'),
        this.generateContent(platform, topic, 'caption'),
        this.generateContent(platform, topic, 'hashtag')
      ]);

      // Generate real SEO analysis using SEO service
      const headlineAnalysis = await seoService.analyzeSEO(headline, 'headline', platform);
      const captionAnalysis = await seoService.analyzeSEO(caption, 'caption', platform);
      const overallScore = Math.round((headlineAnalysis.score + captionAnalysis.score) / 2);
      
      const seoAnalysis = {
        headlineScore: headlineAnalysis.score,
        captionScore: captionAnalysis.score,
        overallScore
      };

      return {
        platform,
        topic,
        headline,
        caption,
        hashtag,
        seoAnalysis,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to generate content for ${platform}: ${error.message}`);
    }
  }

  // Generate content for multiple platforms based on task configuration
  async generateMultiPlatformContent(platforms, topic) {
    try {
      if (!Array.isArray(platforms) || platforms.length === 0) {
        throw new Error('Platforms array is required and cannot be empty');
      }

      const results = {};
      
      // Generate content for each platform in parallel
      const platformPromises = platforms.map(async (platform) => {
        const content = await this.generateAllContent(platform, topic);
        return { platform, content };
      });

      const platformResults = await Promise.all(platformPromises);
      
      // Structure results by platform
      platformResults.forEach(({ platform, content }) => {
        results[platform] = content;
      });

      return {
        topic,
        platforms: results,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to generate multi-platform content: ${error.message}`);
    }
  }


}

export default new AIService();