const API_BASE_URL = 'http://localhost:3000/api/v1/ai';

class AIService {
  // Generate specific content type
  async generateContent(platform, topic, contentType) {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          topic,
          contentType
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  // Generate all content types for a platform
  async generateAllContent(platform, topic) {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          topic
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  // Analyze SEO score
  async analyzeSEO(content, contentType = 'headline') {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-seo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          contentType
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze SEO');
      }

      return data.data;
    } catch (error) {
      throw new Error(`SEO analysis failed: ${error.message}`);
    }
  }
}

export default new AIService();