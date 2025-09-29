import { ref, set, get, remove } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { config } from '../config/config.mjs';

const app = initializeApp(config.firebase);
const db = getDatabase(app, config.firebase.databaseURL);

class DraftService {
  static async saveDraft(userId, content, workflowId = null) {
    console.log('💾 saveDraft called with:', { userId, workflowId, content: !!content });
    try {
      // For workflow drafts, check if existing draft exists and replace it
      if (workflowId) {
        const existingDrafts = await this.getDraftsByWorkflow(userId, workflowId);
        const existingDraftIds = Object.keys(existingDrafts);
        
        // If existing draft found, delete it first
        if (existingDraftIds.length > 0) {
          console.log('💾 Existing draft found for workflow, replacing...');
          for (const existingDraftId of existingDraftIds) {
            await this.deleteDraft(userId, existingDraftId, workflowId);
          }
        }
      }
      
      // Check for duplicate content if hash exists (for standalone drafts only)
      if (!workflowId && content.contentHash) {
        const existingDrafts = await this.getUserDrafts(userId);
        const allStandaloneDrafts = Object.values(existingDrafts.standalone);
        
        const duplicate = allStandaloneDrafts.find(draft => 
          draft.content?.contentHash === content.contentHash
        );
        
        if (duplicate) {
          console.log('💾 Duplicate content detected, skipping save');
          return 'duplicate';
        }
      }
      
      const draftId = Date.now().toString();
      const draftData = {
        content: {
          ...content,
          platform: content.platform || 'multi-platform'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        submittedForApproval: false
      };
      
      const path = workflowId 
        ? `drafts/${userId}/workflow/${workflowId}/${draftId}`
        : `drafts/${userId}/standalone/${draftId}`;
      
      const draftRef = ref(db, path);
      await set(draftRef, draftData);
      
      console.log('💾 saveDraft success - Content saved at path:', path);
      return draftId;
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      throw new Error('Failed to save draft');
    }
  }
  
  static async getUserDrafts(userId) {
    console.log('📖 getUserDrafts called with userId:', userId);
    try {
      const draftsRef = ref(db, `drafts/${userId}`);
      const snapshot = await get(draftsRef);
      
      const drafts = snapshot.exists() ? snapshot.val() : {};
      
      console.log('📖 getUserDrafts success - Found drafts:', {
        workflow: Object.keys(drafts.workflow || {}).length,
        standalone: Object.keys(drafts.standalone || {}).length
      });
      
      return {
        workflow: drafts.workflow || {},
        standalone: drafts.standalone || {}
      };
    } catch (error) {
      console.error('❌ Error getting user drafts:', error);
      throw new Error('Failed to get user drafts');
    }
  }
  
  static async getDraftsByWorkflow(userId, workflowId) {
    console.log('📋 getDraftsByWorkflow called with:', { userId, workflowId });
    try {
      const workflowDraftsRef = ref(db, `drafts/${userId}/workflow/${workflowId}`);
      const snapshot = await get(workflowDraftsRef);
      
      const result = snapshot.exists() ? snapshot.val() : {};
      console.log('📋 getDraftsByWorkflow success - Found drafts:', Object.keys(result).length);
      return result;
    } catch (error) {
      console.error('❌ Error getting workflow drafts:', error);
      throw new Error('Failed to get workflow drafts');
    }
  }
  
  static async updateDraft(userId, draftId, content, workflowId = null) {
    console.log('✏️ updateDraft called with:', { userId, draftId, workflowId });
    try {
      const path = workflowId 
        ? `drafts/${userId}/workflow/${workflowId}/${draftId}`
        : `drafts/${userId}/standalone/${draftId}`;
      
      const draftRef = ref(db, path);
      const snapshot = await get(draftRef);
      
      if (!snapshot.exists()) {
        throw new Error('Draft not found');
      }
      
      const currentDraft = snapshot.val();
      const updatedDraft = {
        ...currentDraft,
        content,
        updatedAt: new Date().toISOString()
      };
      
      await set(draftRef, updatedDraft);
      console.log('✏️ updateDraft success - Draft updated');
      return updatedDraft;
    } catch (error) {
      console.error('❌ Error updating draft:', error);
      throw new Error('Failed to update draft');
    }
  }
  
  static async deleteDraft(userId, draftId, workflowId = null) {
    console.log('🗑️ deleteDraft called with:', { userId, draftId, workflowId });
    try {
      const path = workflowId 
        ? `drafts/${userId}/workflow/${workflowId}/${draftId}`
        : `drafts/${userId}/standalone/${draftId}`;
      
      const draftRef = ref(db, path);
      await remove(draftRef);
      
      console.log('🗑️ deleteDraft success - Draft deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting draft:', error);
      throw new Error('Failed to delete draft');
    }
  }
  
  static async getDraft(userId, draftId, workflowId = null) {
    console.log('📄 getDraft called with:', { userId, draftId, workflowId });
    try {
      const path = workflowId 
        ? `drafts/${userId}/workflow/${workflowId}/${draftId}`
        : `drafts/${userId}/standalone/${draftId}`;
      
      const draftRef = ref(db, path);
      const snapshot = await get(draftRef);
      
      if (!snapshot.exists()) {
        console.log('📄 getDraft - Draft not found');
        return null;
      }
      
      const result = snapshot.val();
      console.log('📄 getDraft success - Draft found');
      return { id: draftId, ...result };
    } catch (error) {
      console.error('❌ Error getting draft:', error);
      throw new Error('Failed to get draft');
    }
  }
  
  static async markDraftAsSubmitted(userId, draftId, workflowId = null) {
    console.log('📤 markDraftAsSubmitted called with:', { userId, draftId, workflowId });
    try {
      const path = workflowId 
        ? `drafts/${userId}/workflow/${workflowId}/${draftId}`
        : `drafts/${userId}/standalone/${draftId}`;
      
      const draftRef = ref(db, `${path}/submittedForApproval`);
      await set(draftRef, true);
      
      const timestampRef = ref(db, `${path}/submittedAt`);
      await set(timestampRef, new Date().toISOString());
      
      console.log('📤 markDraftAsSubmitted success - Draft marked as submitted');
      return true;
    } catch (error) {
      console.error('❌ Error marking draft as submitted:', error);
      throw new Error('Failed to mark draft as submitted');
    }
  }
}

export default DraftService;