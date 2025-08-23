// Mocked Content Service for Content Creator

// Mock AI Content Generator
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
  
  return {
    id: Date.now() + index,
    headline: headlines[index % headlines.length],
    caption: captions[index % captions.length],
    hashtag: hashtags[index % hashtags.length]
  };
};

// Create Content
export async function createContent(data) {
  const { input, numContents = 1, taskId } = data;
  
  console.log('🔍 ContentService Debug - Received data:', { input, numContents, taskId });
  
  // Generate mock content
  const contents = [];
  for (let i = 0; i < numContents; i++) {
    contents.push(generateMockContent(input, i));
  }
  
  // If taskId exists, submit to backend workflow
  if (taskId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${taskId}/submit-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: contents[0].headline,
          caption: contents[0].caption,
          hashtag: contents[0].hashtag
        })
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        console.log('✅ Content submitted to workflow successfully');
      }
    } catch (error) {
      console.error('❌ Error submitting content to workflow:', error);
    }
  }
  
  return {
    success: true,
    message: `${numContents} content(s) created!`,
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