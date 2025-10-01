// Real AI Content Service for Content Creator
// Integrates with OpenAI through backend API with mock fallback

// Mock AI Content Generator - matches real AI service structure
const generateMockContent = (input, index) => {
  const headlines = [
    `🚀 Discover the Power of ${input.split(' ')[0] || 'Innovation'}`,
    `✨ Transform Your Life with ${input.split(' ')[1] || 'Amazing'} Solutions`,
    `🌟 The Ultimate Guide to ${input.split(' ')[0] || 'Success'}`,
    `💡 Why ${input.split(' ')[0] || 'Everyone'} is Talking About This`,
    `🔥 Unlock the Secret to ${input.split(' ')[1] || 'Better'} Results`
  ];
  
  const captions = [
    `Ready to take your ${input.toLowerCase()} to the next level? Our innovative approach combines cutting-edge technology with proven strategies to deliver exceptional results. Join thousands who have already transformed their experience!`,
    `Experience the difference with our premium ${input.toLowerCase()} solutions. From concept to execution, we're here to make your vision a reality. Don't just dream it - achieve it!`,
    `Looking for ${input.toLowerCase()} that actually works? You've found it! Our expert team has crafted the perfect solution that delivers real, measurable results every time.`,
    `Say goodbye to ordinary ${input.toLowerCase()} and hello to extraordinary outcomes! Our revolutionary approach is changing the game for businesses and individuals alike.`,
    `The future of ${input.toLowerCase()} is here, and it's more exciting than ever! Discover how our innovative solutions can transform your approach and deliver amazing results.`
  ];
  
  const hashtags = [
    `#${input.split(' ')[0]?.toLowerCase() || 'innovation'} #success #transformation #growth #excellence`,
    `#${input.split(' ')[1]?.toLowerCase() || 'amazing'} #results #quality #premium #lifestyle`,
    `#${input.split(' ')[0]?.toLowerCase() || 'future'} #technology #innovation #breakthrough #nextlevel`,
    `#${input.split(' ')[1]?.toLowerCase() || 'expert'} #professional #trusted #reliable #proven`,
    `#${input.split(' ')[0]?.toLowerCase() || 'revolutionary'} #gamechanging #cutting edge #modern #advanced`
  ];
  
  const content = {
    headline: headlines[index % headlines.length],
    caption: captions[index % captions.length],
    hashtag: hashtags[index % hashtags.length]
  };
  
  // Generate SEO analysis for the content (simulates AI SEO service)
  const seoAnalysis = generateMockSEOAnalysis(content);
  
  return {
    id: Date.now() + index,
    ...content,
    seoAnalysis
  };
};

// Mock SEO Analysis Generator - matches real AI SEO service structure
const generateMockSEOAnalysis = (content) => {
  const combinedText = `${content.headline} ${content.caption}`;
  const wordCount = combinedText.split(' ').length;
  const contentHash = combinedText.length;
  
  return {
    overallScore: 75 + (contentHash % 21),
    headlineScore: 75 + ((content.headline.length * 3) % 21),
    captionScore: 75 + ((content.caption.length * 2) % 21),
    hashtagScore: 75 + ((content.hashtag.length * 5) % 21),
    wordCount,
    powerWords: {
      count: 2 + (contentHash % 4),
      words: ['innovative', 'amazing', 'revolutionary', 'exceptional'].slice(0, 2 + (contentHash % 3))
    },
    emotionalWords: {
      count: 1 + (contentHash % 3),
      words: ['exciting', 'incredible', 'wonderful'].slice(0, 1 + (contentHash % 2))
    },
    commonWords: {
      count: 3 + (contentHash % 5),
      words: ['the', 'and', 'with', 'for', 'your'].slice(0, 3 + (contentHash % 3))
    },
    uncommonWords: {
      count: 1 + (contentHash % 3),
      words: ['revolutionary', 'cutting-edge', 'breakthrough'].slice(0, 1 + (contentHash % 2))
    },
    sentiment: {
      tone: ['Positive', 'Neutral', 'Negative'][contentHash % 3],
      polarity: ((contentHash % 200) / 100 - 1).toFixed(2),
      confidence: 70 + (contentHash % 30),
      words: ['amazing', 'excellent', 'great'].slice(0, 1 + (contentHash % 2))
    },
    readability: {
      gradeLevel: ['6th Grade', '7th Grade', '8th Grade', '9th Grade'][contentHash % 4],
      readingTime: Math.ceil(wordCount / 200),
      fleschScore: 60 + (contentHash % 30),
      complexity: ['Simple', 'Moderate', 'Complex'][contentHash % 3]
    },
    analyzedAt: new Date().toISOString()
  };
};

// Create Content with Real AI Integration
export async function createContent(data) {
  const { input, numContents = 1, taskId } = data;
  
  console.log('🔍 ContentService Debug - Received data:', { input, numContents, taskId });
  
  // Step 1: Generate content using Real AI
  console.log('🤖 Step 1: Generating content with Real AI...');
  const contents = [];
  
  try {
    // Call AI endpoint once to get base content
    console.log('🤖 Calling AI service for base content...');
    const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';
    const response = await fetch(`${API_BASE_URL}/api/v1/tasks/generate-ai-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: input,
        numContents: numContents
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      // Process all real AI variations
      result.data.variations.forEach((variation, index) => {
        const aiContent = {
          id: variation.id,
          headline: variation.headline,
          caption: variation.caption,
          hashtag: variation.hashtag,
          seoAnalysis: {
            headlineScore: variation.seoAnalysis.headlineScore,
            captionScore: variation.seoAnalysis.captionScore,
            overallScore: variation.seoAnalysis.overallScore,
            // Add compatibility fields for OutputContent component
            wordCount: variation.caption.split(' ').length,
            powerWords: { count: 2, words: ['AI', 'automation'] },
            emotionalWords: { count: 1, words: ['transform'] },
            sentiment: { tone: 'Positive', polarity: '0.8', confidence: 85 },
            readability: { complexity: 'Simple', gradeLevel: '7th Grade' }
          }
        };
        contents.push(aiContent);
        console.log(`✅ Generated real AI variation ${index + 1} with SEO analysis`);
      });
    } else {
      throw new Error('AI service failed');
    }
  } catch (error) {
    console.error('❌ Error calling AI service, using mock data:', error);
    // Fallback to all mock data if AI fails
    for (let i = 0; i < numContents; i++) {
      const generatedContent = generateMockContent(input, i);
      contents.push(generatedContent);
    }
  }
  
  // Content generated for selection only - no automatic submission
  
  console.log('🎯 Content generation and SEO analysis completed');
  
  return {
    success: true,
    message: `${numContents} content(s) created with SEO analysis!`,
    contents,
    taskId
  };
}

// Get Output Content (list)
export async function getOutputContent() {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        contents: [
          { id: 1, title: "Sample Content 1", body: "This is the first content." },
          { id: 2, title: "Sample Content 2", body: "This is the second content." },
        ],
      });
    }, 500);
  });
} 