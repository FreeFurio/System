// Simple API cache to prevent duplicate requests
const cache = new Map();
const pendingRequests = new Map();

export const cachedFetch = async (url, options = {}) => {
  const key = `${options.method || 'GET'}_${url}`;
  
  // If request is already pending, return that promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  // Make the request
  const requestPromise = fetch(url, options)
    .then(response => {
      if (response.status === 429) {
        console.log('Rate limited, using empty response');
        return { json: () => ({ data: [] }) };
      }
      return response;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });
  
  pendingRequests.set(key, requestPromise);
  return requestPromise;
};