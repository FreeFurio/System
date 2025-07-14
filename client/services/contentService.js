// Mocked Content Service for Content Creator

// Create Content
export async function createContent(data) {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Content created!", data });
    }, 500);
  });
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