// API utility with rate limiting and error handling
class ApiRateLimiter {
  constructor() {
    this.requestQueue = new Map();
    this.retryDelays = [1000, 2000, 5000]; // Progressive delays
  }

  async fetchWithRetry(url, options = {}, maxRetries = 3) {
    const key = `${options.method || 'GET'}_${url}`;
    
    // If same request is already in progress, return that promise
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    const requestPromise = this._makeRequest(url, options, maxRetries);
    this.requestQueue.set(key, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestQueue.delete(key);
    }
  }

  async _makeRequest(url, options, maxRetries) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (response.status === 429) {
          if (attempt < maxRetries) {
            const delay = this.retryDelays[attempt] || 5000;
            console.log(`Rate limited. Retrying in ${delay}ms...`);
            await this._delay(delay);
            continue;
          }
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // For network errors, wait before retry
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
          await this._delay(this.retryDelays[attempt] || 2000);
        } else {
          throw error; // Don't retry non-network errors
        }
      }
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiLimiter = new ApiRateLimiter();