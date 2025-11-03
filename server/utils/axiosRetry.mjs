import axios from 'axios';

/**
 * Retry axios request with exponential backoff
 * @param {Function} requestFn - Function that returns axios promise
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise} - Axios response
 */
export async function axiosRetry(requestFn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      const isLastAttempt = i === retries - 1;
      const isRetryableError = 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ENETUNREACH' ||
        error.code === 'ECONNRESET' ||
        error.response?.status >= 500;

      if (isLastAttempt || !isRetryableError) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      console.log(`⏳ Retry attempt ${i + 1}/${retries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
