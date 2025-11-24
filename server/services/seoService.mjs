import OpenAI from 'openai';

class SEOService {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      timeout: parseInt(process.env.AI_TIMEOUT_MS) || 30000
    });
    
    this.model = process.env.OPENAI_MODEL || 'gpt-4o';
    this.seoTemperature = parseFloat(process.env.OPENAI_SEO_TEMPERATURE) || 0.8;
    this.seoEnabled = process.env.AI_SEO_ANALYSIS_ENABLED === 'true';
    this.retryAttempts = parseInt(process.env.AI_RETRY_ATTEMPTS) || 3;
    
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

  async retryApiCall(apiCall, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  async analyzeSEO(content, contentType = 'headline', platform = 'facebook') {
    try {
      if (!content || content.trim().length === 0) {
        throw new Error('Content is required for SEO analysis');
      }

      const aiAnalysis = await this.getAIWordAnalysis(content, platform);
      const finalScore = this.calculateSEOScoreFromAI(aiAnalysis, content, contentType, platform);
      
      return { score: finalScore };
    } catch (error) {
      throw new Error(`SEO analysis failed: ${error.message}`);
    }
  }

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

  calculateSEOScoreFromAI(aiAnalysis, content, contentType, platform) {
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = content.length;
    
    const commonWordsScore = this.calculateCommonWordsScoreFromAI(aiAnalysis.commonWords);
    const uncommonWordsScore = this.calculateUncommonWordsScoreFromAI(aiAnalysis.uncommonWords);
    const emotionalWordsScore = this.calculateEmotionalWordsScoreFromAI(aiAnalysis.emotionalWords);
    const powerWordsScore = this.calculatePowerWordsScoreFromAI(aiAnalysis.powerWords);
    const sentimentScore = this.calculateSentimentScoreFromAI(aiAnalysis.positiveWords, aiAnalysis.negativeWords);
    const wordCountScore = this.calculateWordCountScore(wordCount, contentType, platform);
    const charCountScore = this.calculateCharCountScore(charCount, contentType, platform);
    const readabilityScore = this.calculateReadabilityScore(content);
    
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

  getPlatformWeights(platform) {
    const weights = {
      facebook: { commonWords: 0.05, uncommonWords: 0.10, emotionalWords: 0.20, powerWords: 0.25, sentiment: 0.10, wordCount: 0.10, charCount: 0.05, readability: 0.15 },
      instagram: { commonWords: 0.05, uncommonWords: 0.15, emotionalWords: 0.25, powerWords: 0.15, sentiment: 0.15, wordCount: 0.10, charCount: 0.05, readability: 0.10 },
      twitter: { commonWords: 0.05, uncommonWords: 0.15, emotionalWords: 0.15, powerWords: 0.30, sentiment: 0.10, wordCount: 0.10, charCount: 0.05, readability: 0.10 }
    };
    return weights[platform] || weights.facebook;
  }

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

  calculateCharCountScore(charCount, contentType, platform) {
    const limits = this.platformLimits[platform];
    const maxLength = contentType === 'headline' ? limits.headlineMax : limits.captionMax;
    const ratio = charCount / maxLength;
    
    if (ratio <= 0.3) return 40;
    if (ratio <= 0.7) return 80;
    if (ratio <= 0.9) return 100;
    return 60;
  }

  calculateReadabilityScore(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    
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

export default new SEOService();
