import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? '/api/v1/admin' 
  : 'http://localhost:3000/api/v1/admin';

class AdminService {
  async getPageInsights() {
    try {
      const response = await axios.get(`${API_BASE_URL}/insights/page`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch page insights: ${error.message}`);
    }
  }

  async getInstagramInsights() {
    try {
      const response = await axios.get(`${API_BASE_URL}/insights/instagram`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Instagram insights: ${error.message}`);
    }
  }

  async getPostEngagement(postId, accessToken) {
    try {
      const response = await axios.get(`${API_BASE_URL}/insights/post/${postId}`, {
        params: { access_token: accessToken }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch post engagement: ${error.message}`);
    }
  }

  async getAccountInfo() {
    try {
      const response = await axios.get(`${API_BASE_URL}/account`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch account info: ${error.message}`);
    }
  }

  async getFacebookEngagement() {
    try {
      const response = await axios.get(`${API_BASE_URL}/engagement/facebook`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Facebook engagement: ${error.message}`);
    }
  }

  async getInstagramEngagement() {
    try {
      const response = await axios.get(`${API_BASE_URL}/engagement/instagram`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Instagram engagement: ${error.message}`);
    }
  }

  async setupFacebookTokens() {
    try {
      const response = await axios.get(`${API_BASE_URL}/setup-facebook-tokens`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to setup Facebook tokens: ${error.message}`);
    }
  }

  async getAllPageTokens(userAccessToken) {
    try {
      const response = await axios.post(`${API_BASE_URL}/get-all-page-tokens`, {
        userAccessToken
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get page tokens: ${error.message}`);
    }
  }

  async getConnectedPages() {
    try {
      const response = await axios.get(`${API_BASE_URL}/connected-pages`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get connected pages: ${error.message}`);
    }
  }

  async getAccountEngagement(accountId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/engagement/account/${accountId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch account engagement: ${error.message}`);
    }
  }

  async toggleAccountActive(accountId, isActive) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/account/${accountId}/toggle-active`, {
        active: isActive
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to toggle account status: ${error.message}`);
    }
  }

  async deleteAccount(accountId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/account/${accountId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete account: ${error.message}`);
    }
  }
}

export default new AdminService();