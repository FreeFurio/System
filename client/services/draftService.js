const API_URL = import.meta.env.VITE_API_URL;

class DraftService {
  static async saveDraft(content, workflowId = null) {
    try {
      const response = await fetch(`${API_URL}/api/v1/drafts/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          workflowId
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save draft');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      throw error;
    }
  }
  
  static async getUserDrafts() {
    try {
      const response = await fetch(`${API_URL}/api/v1/drafts/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get drafts');
      }
      
      return result.drafts;
    } catch (error) {
      console.error('❌ Error getting user drafts:', error);
      throw error;
    }
  }
  
  static async getDraftsByWorkflow(workflowId) {
    try {
      const response = await fetch(`${API_URL}/api/v1/drafts/workflow/${workflowId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get workflow drafts');
      }
      
      return result.drafts;
    } catch (error) {
      console.error('❌ Error getting workflow drafts:', error);
      throw error;
    }
  }
  
  static async getDraft(draftId, workflowId = null) {
    try {
      const url = workflowId 
        ? `${API_URL}/api/v1/drafts/${draftId}?workflowId=${workflowId}`
        : `${API_URL}/api/v1/drafts/${draftId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get draft');
      }
      
      return result.draft;
    } catch (error) {
      console.error('❌ Error getting draft:', error);
      throw error;
    }
  }
  
  static async updateDraft(draftId, content, workflowId = null) {
    try {
      const response = await fetch(`${API_URL}/api/v1/drafts/${draftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          workflowId
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update draft');
      }
      
      return result.draft;
    } catch (error) {
      console.error('❌ Error updating draft:', error);
      throw error;
    }
  }
  
  static async deleteDraft(draftId, workflowId = null) {
    try {
      const url = workflowId 
        ? `${API_URL}/api/v1/drafts/${draftId}?workflowId=${workflowId}`
        : `${API_URL}/api/v1/drafts/${draftId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete draft');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error deleting draft:', error);
      throw error;
    }
  }
}

export default DraftService;