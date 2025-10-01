import DraftService from '../services/draftService.mjs';

class DraftController {
  static async saveDraft(req, res) {
    try {
      const { content, workflowId } = req.body;
      const userId = 'testuser';
      
      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Content is required'
        });
      }
      
      const draftId = await DraftService.saveDraft(userId, content, workflowId);
      
      res.json({
        success: true,
        draftId,
        category: workflowId ? 'workflow' : 'standalone',
        message: 'Draft saved successfully'
      });
    } catch (error) {
      console.error('❌ Error in saveDraft controller:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  static async getUserDrafts(req, res) {
    try {
      const userId = 'testuser';
      const drafts = await DraftService.getUserDrafts(userId);
      
      res.json({
        success: true,
        drafts
      });
    } catch (error) {
      console.error('❌ Error in getUserDrafts controller:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  static async getDraftsByWorkflow(req, res) {
    try {
      const { workflowId } = req.params;
      const userId = 'testuser';
      
      const drafts = await DraftService.getDraftsByWorkflow(userId, workflowId);
      
      res.json({
        success: true,
        drafts
      });
    } catch (error) {
      console.error('❌ Error in getDraftsByWorkflow controller:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  static async updateDraft(req, res) {
    try {
      const { draftId } = req.params;
      const { content, workflowId } = req.body;
      const userId = 'testuser';
      
      const updatedDraft = await DraftService.updateDraft(userId, draftId, content, workflowId);
      
      res.json({
        success: true,
        draft: updatedDraft,
        message: 'Draft updated successfully'
      });
    } catch (error) {
      console.error('❌ Error in updateDraft controller:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  static async deleteDraft(req, res) {
    try {
      const { draftId } = req.params;
      const { workflowId } = req.query;
      const userId = 'testuser';
      
      await DraftService.deleteDraft(userId, draftId, workflowId);
      
      res.json({
        success: true,
        message: 'Draft deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error in deleteDraft controller:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  static async getDraft(req, res) {
    try {
      const { draftId } = req.params;
      const { workflowId } = req.query;
      const userId = 'testuser';
      
      const draft = await DraftService.getDraft(userId, draftId, workflowId);
      
      if (!draft) {
        return res.status(404).json({
          success: false,
          error: 'Draft not found'
        });
      }
      
      res.json({
        success: true,
        draft
      });
    } catch (error) {
      console.error('❌ Error in getDraft controller:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  static async markDraftAsSubmitted(req, res) {
    try {
      const { draftId } = req.params;
      const { workflowId } = req.body;
      const userId = 'testuser';
      
      await DraftService.markDraftAsSubmitted(userId, draftId, workflowId);
      
      res.json({
        success: true,
        message: 'Draft marked as submitted successfully'
      });
    } catch (error) {
      console.error('❌ Error marking draft as submitted:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default DraftController;