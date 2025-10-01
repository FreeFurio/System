// Environment-aware API configuration
const config = {
  API_BASE_URL: import.meta.env.PROD 
    ? '/api/v1'  // Production: use relative URLs
    : 'http://localhost:3000/api/v1'  // Development: use localhost
};

export default config;