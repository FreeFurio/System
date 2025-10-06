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
        headline: `Create a Twitter headline about: ${topic}. Make it punchy and shareable. No hashtags.`,
        caption: `Write a Twitter post about: ${topic}. Be conversational and engaging. No hashtags.`,
        hashtag: `Generate 3 popular Twitter hashtags for: ${topic}. Format: #hashtag1 #hashtag2 #hashtag3`
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

      // Generate real SEO analysis using AI with platform-specific criteria
      const headlineAnalysis = await this.analyzeSEO(headline, 'headline', platform);
      const captionAnalysis = await this.analyzeSEO(caption, 'caption', platform);
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

  // Hybrid SEO Analysis: AI analysis + Mathematical scoring
  async analyzeSEO(content, contentType = 'headline', platform = 'facebook') {
    try {
      // Validate content
      if (!content || content.trim().length === 0) {
        throw new Error('Content is required for SEO analysis');
      }

      // Get AI analysis of word types using massive dataset
      const aiAnalysis = await this.getAIWordAnalysis(content, platform);
      
      // Calculate score using mathematical formula with AI data
      const finalScore = this.calculateSEOScoreFromAI(aiAnalysis, content, contentType, platform);
      
      return { score: finalScore };
    } catch (error) {
      throw new Error(`SEO analysis failed: ${error.message}`);
    }
  }
  // Get AI analysis of word types using massive dataset
  async getAIWordAnalysis(content, platform) {
    const prompt = `Analyze this ${platform} content for SEO word types: "${content}"

Using your massive dataset of social media analytics, identify:
1. Common words count (basic words like "the", "and", "is")
2. Uncommon words count (distinctive, unique words)
3. Emotional words count (words that trigger feelings)
4. Power words count (persuasive, action-driving words)
5. Positive sentiment words count
6. Negative sentiment words count

Return only JSON: {
  "commonWords": number,
  "uncommonWords": number, 
  "emotionalWords": number,
  "powerWords": number,
  "positiveWords": number,
  "negativeWords": number
}`;

    const response = await this.retryApiCall(async () => {
      return await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert in social media analytics with access to massive datasets. Analyze content based on real ${platform} performance data. Return only valid JSON.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      });
    });

    let responseText = response.choices[0].message.content.trim();
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    return JSON.parse(responseText);
  }

  // Calculate SEO score using AI analysis + mathematical formula
  calculateSEOScoreFromAI(aiAnalysis, content, contentType, platform) {
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = content.length;
    
    // Calculate individual scores using AI analysis
    const commonWordsScore = this.calculateCommonWordsScoreFromAI(aiAnalysis.commonWords);
    const uncommonWordsScore = this.calculateUncommonWordsScoreFromAI(aiAnalysis.uncommonWords);
    const emotionalWordsScore = this.calculateEmotionalWordsScoreFromAI(aiAnalysis.emotionalWords);
    const powerWordsScore = this.calculatePowerWordsScoreFromAI(aiAnalysis.powerWords);
    const sentimentScore = this.calculateSentimentScoreFromAI(aiAnalysis.positiveWords, aiAnalysis.negativeWords);
    const wordCountScore = this.calculateWordCountScore(wordCount, contentType, platform);
    const charCountScore = this.calculateCharCountScore(charCount, contentType, platform);
    const readabilityScore = this.calculateReadabilityScore(content);
    
    // Apply platform-specific weights
    const weights = this.getPlatformWeights(platform);
    const finalScore = Math.round(
      (commonWordsScore * weights.commonWords) +
      (uncommonWordsScore * weights.uncommonWords) +
      (emotionalWordsScore * weights.emotionalWords) +
      (powerWordsScore * weights.powerWords) +
      (sentimentScore * weights.sentiment) +
      (wordCountScore * weights.wordCount) +
      (charCountScore * weights.charCount) +
      (readabilityScore * weights.readability)
    );
    
    return Math.max(0, Math.min(100, finalScore));
  }

  // Platform-specific SEO configurations
  getPlatformSEOConfig(platform) {
    const configs = {
      facebook: {
        commonWords: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an'],
        uncommonWords: ['extraordinary', 'phenomenal', 'revolutionary', 'breakthrough', 'innovative', 'exceptional', 'remarkable', 'outstanding', 'magnificent', 'spectacular'],
        emotionalWords: ['love', 'amazing', 'incredible', 'exciting', 'wonderful', 'fantastic', 'awesome', 'brilliant', 'stunning', 'beautiful', 'inspiring', 'thrilling', 'delightful', 'magnificent', 'happy', 'joy', 'fear', 'surprise'],
        powerWords: ['free', 'exclusive', 'limited', 'proven', 'guaranteed', 'instant', 'ultimate', 'secret', 'powerful', 'effective', 'results', 'breakthrough', 'revolutionary', 'premium'],
        sentiment: { positive: ['great', 'good', 'excellent', 'perfect', 'best', 'wonderful'], negative: ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate'] },
        weights: { commonWords: 0.05, uncommonWords: 0.10, emotionalWords: 0.20, powerWords: 0.25, sentiment: 0.10, wordCount: 0.10, charCount: 0.05, readability: 0.15 }
      },
      instagram: {
        commonWords: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an'],
        uncommonWords: ['aesthetic', 'vibes', 'dreamy', 'ethereal', 'minimalist', 'curated', 'artisanal', 'bespoke', 'wanderlust', 'serendipity'],
        emotionalWords: ['love', 'beautiful', 'stunning', 'gorgeous', 'amazing', 'inspiring', 'dreamy', 'magical', 'perfect', 'blessed', 'grateful', 'happy', 'joy', 'bliss', 'serene', 'peaceful'],
        powerWords: ['exclusive', 'limited', 'premium', 'luxury', 'authentic', 'handcrafted', 'artisan', 'boutique', 'designer', 'signature', 'collection', 'featured'],
        sentiment: { positive: ['beautiful', 'stunning', 'perfect', 'amazing', 'love', 'blessed'], negative: ['ugly', 'boring', 'basic', 'cheap', 'fake'] },
        weights: { commonWords: 0.05, uncommonWords: 0.15, emotionalWords: 0.25, powerWords: 0.15, sentiment: 0.15, wordCount: 0.10, charCount: 0.05, readability: 0.10 }
      },
      twitter: {
        commonWords: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an'],
        uncommonWords: ['breaking', 'trending', 'viral', 'controversial', 'unprecedented', 'shocking', 'explosive', 'game-changing', 'disruptive', 'groundbreaking'],
        emotionalWords: ['outraged', 'shocked', 'amazed', 'thrilled', 'excited', 'angry', 'frustrated', 'happy', 'sad', 'surprised', 'confused', 'worried', 'hopeful'],
        powerWords: ['breaking', 'urgent', 'alert', 'exclusive', 'leaked', 'revealed', 'exposed', 'confirmed', 'official', 'update', 'developing', 'just in'],
        sentiment: { positive: ['great', 'awesome', 'excellent', 'perfect', 'amazing', 'love'], negative: ['terrible', 'awful', 'horrible', 'hate', 'disgusting', 'outraged'] },
        weights: { commonWords: 0.05, uncommonWords: 0.15, emotionalWords: 0.15, powerWords: 0.30, sentiment: 0.10, wordCount: 0.10, charCount: 0.05, readability: 0.10 }
      }
    };
    return configs[platform] || configs.facebook;
  }

  // Get platform-specific weights
  getPlatformWeights(platform) {
    const weights = {
      facebook: { commonWords: 0.05, uncommonWords: 0.10, emotionalWords: 0.20, powerWords: 0.25, sentiment: 0.10, wordCount: 0.10, charCount: 0.05, readability: 0.15 },
      instagram: { commonWords: 0.05, uncommonWords: 0.15, emotionalWords: 0.25, powerWords: 0.15, sentiment: 0.15, wordCount: 0.10, charCount: 0.05, readability: 0.10 },
      twitter: { commonWords: 0.05, uncommonWords: 0.15, emotionalWords: 0.15, powerWords: 0.30, sentiment: 0.10, wordCount: 0.10, charCount: 0.05, readability: 0.10 }
    };
    return weights[platform] || weights.facebook;
  }

  // Calculate scores using AI analysis data (scaled to 0-100 range)
  calculateCommonWordsScoreFromAI(commonCount) {
    if (commonCount > 15) return 30;
    if (commonCount >= 10) return 70;
    return 90;
  }

  calculateUncommonWordsScoreFromAI(uncommonCount) {
    if (uncommonCount === 0 || uncommonCount === 1) return 30;
    if (uncommonCount >= 2 && uncommonCount <= 3) return 80;
    if (uncommonCount >= 4 && uncommonCount <= 5) return 100;
    return 60;
  }

  calculateEmotionalWordsScoreFromAI(emotionalCount) {
    if (emotionalCount === 0) return 20;
    if (emotionalCount === 1) return 50;
    if (emotionalCount === 2) return 80;
    if (emotionalCount >= 3 && emotionalCount <= 4) return 100;
    return 60;
  }

  calculatePowerWordsScoreFromAI(powerCount) {
    if (powerCount === 0) return 20;
    if (powerCount === 1) return 50;
    if (powerCount === 2) return 80;
    if (powerCount >= 3 && powerCount <= 4) return 100;
    return 70;
  }

  calculateSentimentScoreFromAI(positiveCount, negativeCount) {
    const polarity = positiveCount - negativeCount;
    
    if (polarity === 0) return 30;
    if (polarity >= 1 && polarity <= 2) return 60;
    if (polarity >= 3 && polarity <= 5) return 90;
    if (polarity >= -2 && polarity <= -1) return 60;
    if (polarity <= -3) return 20;
    return 50;
  }

  // Calculate word count score (scaled to 0-100 range)
  calculateWordCountScore(wordCount, contentType, platform) {
    if (contentType === 'headline') {
      if (wordCount <= 3) return 20;
      if (wordCount >= 4 && wordCount <= 6) return 50;
      if (wordCount >= 7 && wordCount <= 12) return 90;
      if (wordCount >= 13 && wordCount <= 15) return 80;
      return 50;
    } else {
      if (wordCount <= 4) return 20;
      if (wordCount >= 5 && wordCount <= 10) return 40;
      if (wordCount >= 11 && wordCount <= 20) return 80;
      if (wordCount >= 21 && wordCount <= 30) return 100;
      return 60;
    }
  }

  // Calculate character count score (scaled to 0-100 range)
  calculateCharCountScore(charCount, contentType, platform) {
    const limits = this.platformLimits[platform];
    const maxLength = contentType === 'headline' ? limits.headlineMax : limits.captionMax;
    const ratio = charCount / maxLength;
    
    if (ratio <= 0.3) return 40;
    if (ratio <= 0.7) return 80;
    if (ratio <= 0.9) return 100;
    return 60;
  }

  // Calculate readability score using simplified Flesch formula (scaled to 0-100 range)
  calculateReadabilityScore(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    
    // Simplified readability calculation
    let fleschScore = 100 - (avgWordsPerSentence * 2);
    fleschScore = Math.max(0, Math.min(100, fleschScore));
    
    if (fleschScore >= 90) return 100;
    if (fleschScore >= 80) return 90;
    if (fleschScore >= 70) return 80;
    if (fleschScore >= 60) return 70;
    if (fleschScore >= 50) return 60;
    if (fleschScore >= 30) return 40;
    return 20;
  }
}

export default new AIService();