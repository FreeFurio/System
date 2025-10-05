import OpenAI from 'openai';

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
    this.model = process.env.OPENAI_MODEL || 'gpt-4o';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 500;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
    this.seoTemperature = parseFloat(process.env.OPENAI_SEO_TEMPERATURE) || 0.3;
    this.contentEnabled = process.env.AI_CONTENT_ENABLED === 'true';
    this.seoEnabled = process.env.AI_SEO_ANALYSIS_ENABLED === 'true';
    this.retryAttempts = parseInt(process.env.AI_RETRY_ATTEMPTS) || 3;
    
    // Platform limits
    this.platformLimits = {
      facebook: {
        headlineMax: parseInt(process.env.FACEBOOK_HEADLINE_MAX_LENGTH) || 60,
        captionMax: parseInt(process.env.FACEBOOK_CAPTION_MAX_LENGTH) || 2000
      },
      instagram: {
        headlineMax: parseInt(process.env.INSTAGRAM_HEADLINE_MAX_LENGTH) || 150,
        captionMax: parseInt(process.env.INSTAGRAM_CAPTION_MAX_LENGTH) || 2200
      },
      twitter: {
        headlineMax: parseInt(process.env.TWITTER_HEADLINE_MAX_LENGTH) || 100,
        captionMax: parseInt(process.env.TWITTER_CAPTION_MAX_LENGTH) || 280
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
        headline: `Create a high-quality, SEO-optimized Facebook headline for: ${topic}. Include relevant keywords naturally, make it conversational, shareable, and emotionally engaging. Ensure optimal length (40-60 characters) for maximum visibility.`,
        caption: `Write a premium Facebook caption for: ${topic}. Keep under 150 characters. Include target keywords naturally, engaging questions, strong call-to-action, emotional hooks, and community-focused language. Structure for high engagement and shareability.`,
        hashtag: `Generate exactly 5 Facebook hashtags for: ${topic}. Format as #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5. Include trending, niche, and branded hashtags that boost discoverability and engagement.`
      },
      instagram: {
        headline: `Create a viral-worthy, SEO-optimized Instagram headline for: ${topic}. Include trending keywords, make it visual, aesthetic, and highly shareable. Perfect length for Instagram algorithm optimization.`,
        caption: `Write a premium Instagram caption for: ${topic}. Keep under 200 characters. Include relevant keywords naturally, inspiring storytelling, aesthetic language, strategic emojis, and strong engagement hooks. Optimize for Instagram algorithm and user engagement.`,
        hashtag: `Generate exactly 8 Instagram hashtags for: ${topic}. Format as #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6 #hashtag7 #hashtag8. Mix viral trending hashtags, niche-specific tags, and community hashtags for maximum reach and engagement.`
      },
      twitter: {
        headline: `Create a viral-potential Twitter headline for: ${topic}. Include trending keywords, keep under 100 characters, make it punchy, shareable, and optimized for Twitter algorithm engagement.`,
        caption: `Write a high-engagement Twitter post for: ${topic}. Keep under 150 characters. Include relevant keywords naturally, make it witty, engaging, and optimized for retweets and replies.`,
        hashtag: `Generate exactly 3 Twitter hashtags for: ${topic}. Format as #hashtag1 #hashtag2 #hashtag3. Focus on viral potential, current conversations, and hashtags that boost visibility and engagement.`
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

      // Generate real SEO analysis using AI
      const headlineAnalysis = await this.analyzeSEO(headline, 'headline');
      const captionAnalysis = await this.analyzeSEO(caption, 'caption');
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

  // SEO Score Analysis using AI
  async analyzeSEO(content, contentType = 'headline') {
    const prompt = `
Analyze this ${contentType} for SEO quality: "${content}"

Be critical and vary your scoring based on actual content quality:
- Poor content (60-70): Generic, no keywords, bad structure, boring
- Average content (71-80): Some keywords, decent structure, moderate engagement
- Good content (81-90): Well-optimized, engaging, good keywords, strong structure
- Excellent content (91-95): Perfect optimization, highly engaging, excellent keywords

Score this specific content precisely based on its actual quality and flaws.
Return only: {"score": number}
    `;

    try {
      // Check if SEO analysis is enabled
      if (!this.seoEnabled) {
        throw new Error('AI SEO analysis is currently disabled');
      }

      // Validate content
      if (!content || content.trim().length === 0) {
        throw new Error('Content is required for SEO analysis');
      }

      const response = await this.retryApiCall(async () => {
        return await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: "system",
              content: "You are a critical SEO expert. Analyze content harshly and give varied scores based on actual quality. Don't be generous - most content has flaws. Score range 60-95. Respond with valid JSON only."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: this.seoTemperature
        });
      });

      // Strip markdown code blocks before parsing JSON
      let responseText = response.choices[0].message.content.trim();
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const result = JSON.parse(responseText);
      
      // Validate score range
      const minScore = parseInt(process.env.SEO_MIN_SCORE) || 0;
      const maxScore = parseInt(process.env.SEO_MAX_SCORE) || 100;
      const defaultScore = parseInt(process.env.SEO_DEFAULT_SCORE) || 75;
      
      const score = result.score && result.score >= minScore && result.score <= maxScore 
        ? result.score 
        : defaultScore;

      return { score };
    } catch (error) {
      if (error.message.includes('JSON')) {
        // Return default structure if JSON parsing fails
        return {
          score: parseInt(process.env.SEO_DEFAULT_SCORE) || 75
        };
      }
      throw new Error(`SEO analysis failed: ${error.message}`);
    }
  }
}

export default new AIService();