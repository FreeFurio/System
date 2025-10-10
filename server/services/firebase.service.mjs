// ========================
// 1) IMPORTS & CONFIGURATION
// ========================
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  remove,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';
import { config } from '../config/config.mjs';
import { AppError } from '../utils/errorHandler.mjs';

const app = initializeApp(config.firebase);
const db = getDatabase(app, config.firebase.databaseURL);

// ========================
// 2) UTILITY FUNCTIONS
// ========================
const safeKey = (username) => {
  console.log('🔧 safeKey called with username:', username);
  if (!username) throw new Error('Username is required');
  const result = username.toLowerCase();
  console.log('🔧 safeKey result:', result);
  return result;
};

// ========================
// 3) DATABASE OPERATIONS
// ========================
class FirebaseService {
  // ========================
  // 3.1) OTP OPERATIONS
  // ========================
  static async saveOTP(username, userData) {
    console.log('💾 saveOTP called with username:', username, 'userData:', userData);
    try {
      const safeUsername = safeKey(username);
      const otpRef = ref(db, `OTPVerification/${safeUsername}`);
      console.log('💾 saveOTP Firebase path:', `OTPVerification/${safeUsername}`);

      await set(otpRef, userData);
      console.log('💾 saveOTP success - OTP saved to Firebase');
      return true;
    } catch (error) {
      console.error('❌ Error saving OTP:', error);
      throw new Error('Failed to save OTP');
    }
  }

  static async getOTP(username) {
    console.log('📖 getOTP called with username:', username);
    try {
      const safeUsername = safeKey(username);
      const otpRef = ref(db, `OTPVerification/${safeUsername}`);
      console.log('📖 getOTP Firebase path:', `OTPVerification/${safeUsername}`);
      const snapshot = await get(otpRef);
      
      const result = snapshot.exists() ? snapshot.val() : null;
      console.log('📖 getOTP result:', result ? 'Found OTP data' : 'No OTP data found');
      return result;
    } catch (error) {
      console.error('❌ Error getting OTP:', error);
      throw new Error('Failed to get OTP');
    }
  }

  static async deleteOTP(username) {
    console.log('🗑️ deleteOTP called with username:', username);
    try {
      const safeUsername = safeKey(username);
      const otpRef = ref(db, `OTPVerification/${safeUsername}`);
      console.log('🗑️ deleteOTP Firebase path:', `OTPVerification/${safeUsername}`);

      await remove(otpRef);
      console.log('🗑️ deleteOTP success - OTP deleted from Firebase');
      return true;
    } catch (error) {
      console.error('❌ Error deleting OTP:', error);
      throw new Error('Failed to delete OTP');
    }
  }

  // ========================
  // 3.2) USER OPERATIONS
  // ========================
  static async saveUser(userData) {
    console.log('👤 saveUser called with userData:', userData);
    try {
      const safeUsername = safeKey(userData.username);
      const userRef = ref(db, `ApprovalofAccounts/${safeUsername}`);
      console.log('👤 saveUser Firebase path: ApprovalofAccounts/', safeUsername);

      await set(userRef, userData);
      console.log('👤 saveUser success - User saved with username:', safeUsername);
      return userData.username;
    } catch (error) {
      console.error('❌ Error saving user info:', error);
      throw new Error('Failed to save user information');
    }
  }

  static async findUserByUsername(username) {
    console.log('🔍 findUserByUsername called with username:', username);
    try {
      const roles = ['Admin', 'ContentCreator', 'MarketingLead', 'GraphicDesigner'];
      console.log('🔍 findUserByUsername searching in roles:', roles);
      const safeUsername = safeKey(username);

      for (const role of roles) {
        console.log('🔍 findUserByUsername checking role:', role);
        
        // First try direct username lookup (new structure)
        const directRef = ref(db, `${role}/${safeUsername}`);
        const directSnapshot = await get(directRef);
        
        if (directSnapshot.exists()) {
          const user = directSnapshot.val();
          console.log('🔍 findUserByUsername found user via direct lookup:', user?.username || 'unknown', 'in role:', role);
          return { ...user, role };
        }
        
        // Fallback: search through all users in role (old structure)
        const nodeRef = ref(db, role);
        const snapshot = await get(nodeRef);

        if (snapshot.exists()) {
          const users = snapshot.val();
          console.log('🔍 findUserByUsername found users in', role, ':', Object.keys(users).length, 'users');
          const user = Object.values(users).find(
            u => u.username && u.username.toLowerCase() === username.toLowerCase()
          );

          if (user) {
            console.log('🔍 findUserByUsername found user via search:', user.username, 'in role:', role);
            return { ...user, role };
          }
        } else {
          console.log('🔍 findUserByUsername no users found in role:', role);
        }
      }
      console.log('🔍 findUserByUsername user not found');
      return null;
    } catch (error) {
      console.error('❌ Error finding user by username:', error);
      throw new Error('Failed to find user');
    }
  }

  static async isUsernameTaken(username) {
    console.log('✅ isUsernameTaken called with username:', username);
    try {
      const roles = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];
      console.log('✅ isUsernameTaken checking roles:', roles);

      for (const role of roles) {
        console.log('✅ isUsernameTaken checking role:', role);
        const nodeRef = ref(db, role);
        const snapshot = await get(nodeRef);

        if (snapshot.exists()) {
          const users = snapshot.val();
          console.log('✅ isUsernameTaken found users in', role, ':', Object.keys(users).length, 'users');

          if (Object.values(users).some(
            user => user.username && user.username.toLowerCase() === username.toLowerCase()
          )) {
            console.log('✅ isUsernameTaken username is taken in role:', role);
            return true;
          }
        } else {
          console.log('✅ isUsernameTaken no users in role:', role);
        }
      }
      console.log('✅ isUsernameTaken username is available');
      return false;
    } catch (error) {
      console.error('❌ Error checking username:', error);
      throw new AppError('Failed to check username', 500);
    }
  }

  // ========================
  // 4) WORKFLOW MANAGEMENT
  // ========================

  static async createWorkflow(workflowData) {
    console.log('🔄 createWorkflow called with data:', workflowData);
    try {
      const workflow = {
        objectives: workflowData.objectives,
        gender: workflowData.gender,
        minAge: workflowData.minAge,
        maxAge: workflowData.maxAge,
        deadline: workflowData.deadline,
        selectedPlatforms: workflowData.selectedPlatforms || [],
        status: 'content_creation',
        currentStage: 'contentcreator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        contentCreator: null,
        marketingApproval: null,
        graphicDesigner: null,
        finalApproval: null
      };
      
      if (workflowData.numContent !== undefined) {
        workflow.numContent = workflowData.numContent;
      }
      
      const workflowRef = push(ref(db, 'workflows'));
      await set(workflowRef, workflow);
      
      // Create notification for new task
      await this.createContentCreatorNotification({
        type: 'new_task',
        message: `New task assigned: ${workflow.objectives}`,
        workflowId: workflowRef.key,
        user: 'Content Creator'
      });
      
      console.log('🔄 createWorkflow success - Workflow created with key:', workflowRef.key);
      return workflowRef.key;
    } catch (error) {
      console.error('❌ Error creating workflow:', error);
      throw new AppError('Failed to create workflow', 500);
    }
  }

  static async getWorkflowsByStage(stage) {
    console.log('📋 getWorkflowsByStage called with stage:', stage);
    try {
      const snapshot = await get(ref(db, 'workflows'));
      const workflows = snapshot.val();
      
      if (!workflows) {
        console.log('📋 No workflows found in database');
        return [];
      }
      
      const now = new Date();
      const result = Object.entries(workflows)
        .filter(([key, workflow]) => {
          // Update status if deadline has passed for approved designs
          if (workflow.status === 'design_approved' && workflow.deadline) {
            const deadline = new Date(workflow.deadline);
            if (now >= deadline) {
              // Update to posted status
              this.updateWorkflowStatus(key, 'posted', { currentStage: 'completed' });
              workflow.status = 'posted';
              workflow.currentStage = 'completed';
            }
          }
          
          if (stage === 'contentcreator') {
            // Show tasks that are in content creation stage OR have been rejected and need rework
            const shouldShow = workflow.currentStage === stage && 
                   (workflow.status === 'content_creation' || workflow.status === 'content_rejected');
            console.log(`Content Creator filter - Workflow ${key}: currentStage=${workflow.currentStage}, status=${workflow.status}, shouldShow=${shouldShow}`);
            return shouldShow;
          }
          if (stage === 'graphicdesigner') {
            // Show tasks that are in graphic designer stage OR have been rejected and need rework
            const shouldShow = workflow.currentStage === stage && 
                   (workflow.status === 'design_creation' || workflow.status === 'design_rejected');
            console.log(`Graphic Designer filter - Workflow ${key}: currentStage=${workflow.currentStage}, status=${workflow.status}, shouldShow=${shouldShow}`);
            return shouldShow;
          }
          const shouldShow = workflow.currentStage === stage;
          console.log(`General filter - Workflow ${key}: currentStage=${workflow.currentStage}, stage=${stage}, shouldShow=${shouldShow}`);
          return shouldShow;
        })
        .map(([key, workflow]) => ({ id: key, ...workflow }));
      
      console.log('📋 getWorkflowsByStage result:', result.length + ' workflows found for stage:', stage);
      return result;
    } catch (error) {
      console.error('❌ Error getting workflows by stage:', error);
      throw new AppError('Failed to get workflows', 500);
    }
  }

  static async saveDesignDraft(workflowId, draftData) {
    console.log('💾 saveDesignDraft called with:', { workflowId, draftData });
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const snapshot = await get(workflowRef);
      
      if (!snapshot.exists()) {
        throw new Error('Workflow not found');
      }
      
      const workflow = snapshot.val();
      const updatedWorkflow = {
        ...workflow,
        graphicDesigner: {
          ...workflow.graphicDesigner,
          designUrl: draftData.designUrl,
          publicId: draftData.publicId,
          canvasData: draftData.canvasData,
          description: draftData.description,
          savedAt: draftData.savedAt
        },
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      console.log('💾 saveDesignDraft success - Design draft saved to Cloudinary');
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error saving design draft:', error);
      throw new Error('Failed to save design draft');
    }
  }

  static async submitDesign(workflowId, designData) {
    console.log('🎨 submitDesign called with:', { workflowId, designData });
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const snapshot = await get(workflowRef);
      
      if (!snapshot.exists()) {
        throw new Error('Workflow not found');
      }
      
      const workflow = snapshot.val();
      const updatedWorkflow = {
        ...workflow,
        status: 'design_approval',
        currentStage: 'marketinglead',
        graphicDesigner: {
          ...workflow.graphicDesigner,
          designs: designData,
          submittedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      
      // Create notification for Marketing Lead
      await this.createMarketingNotification({
        type: 'design_submitted',
        message: `Design submitted for approval: ${workflow.objectives}`,
        user: 'Graphic Designer'
      });
      
      console.log('🎨 submitDesign success - Design submitted with canvas data preserved');
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error submitting design:', error);
      throw new Error('Failed to submit design');
    }
  }

  static async getWorkflowById(workflowId) {
    console.log('📄 getWorkflowById called with:', workflowId);
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const snapshot = await get(workflowRef);
      
      if (!snapshot.exists()) {
        console.log('📄 getWorkflowById - Workflow not found');
        return null;
      }
      
      const workflow = snapshot.val();
      
      // Update status if deadline has passed for approved designs
      if (workflow.status === 'design_approved' && workflow.deadline) {
        const now = new Date();
        const deadline = new Date(workflow.deadline);
        if (now >= deadline) {
          // Update to posted status
          await this.updateWorkflowStatus(workflowId, 'posted', { currentStage: 'completed' });
          workflow.status = 'posted';
          workflow.currentStage = 'completed';
        }
      }
      
      console.log('📄 getWorkflowById success - Workflow found');
      return { id: workflowId, ...workflow };
    } catch (error) {
      console.error('❌ Error getting workflow by ID:', error);
      throw new AppError('Failed to get workflow', 500);
    }
  }

  static async approveDesign(workflowId, approvedBy) {
    console.log('✅ approveDesign called with workflowId:', workflowId);
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const snapshot = await get(workflowRef);
      
      if (!snapshot.exists()) {
        throw new Error('Workflow not found');
      }
      
      const workflow = snapshot.val();
      const now = new Date();
      const deadline = new Date(workflow.deadline);
      
      // Check if deadline has passed
      const status = now >= deadline ? 'posted' : 'design_approved';
      const currentStage = now >= deadline ? 'completed' : 'approved';
      
      const updatedWorkflow = {
        ...workflow,
        status: status,
        currentStage: currentStage,
        finalApproval: {
          approvedAt: new Date().toISOString(),
          approvedBy: approvedBy
        },
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      
      // Auto-post if deadline has passed
      if (status === 'posted') {
        console.log('📢 Triggering auto-post for approved design');
        await this.autoPostToSocialMedia(workflowId, updatedWorkflow);
      }
      
      console.log(`✅ approveDesign success - Design approved, status: ${status}`);
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error approving design:', error);
      throw new Error('Failed to approve design');
    }
  }

  static async rejectDesign(workflowId, rejectedBy, feedback) {
    console.log('❌ rejectDesign called with workflowId:', workflowId);
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const snapshot = await get(workflowRef);
      
      if (!snapshot.exists()) {
        throw new Error('Workflow not found');
      }
      
      const workflow = snapshot.val();
      console.log('❌ rejectDesign - Current workflow state:', {
        id: workflowId,
        currentStage: workflow.currentStage,
        status: workflow.status
      });
      
      const updatedWorkflow = {
        ...workflow,
        status: 'design_rejected',
        currentStage: 'graphicdesigner',
        marketingRejection: {
          rejectedAt: new Date().toISOString(),
          rejectedBy: rejectedBy,
          feedback: feedback
        },
        updatedAt: new Date().toISOString()
      };
      
      console.log('❌ rejectDesign - Setting workflow to:', {
        id: workflowId,
        currentStage: updatedWorkflow.currentStage,
        status: updatedWorkflow.status
      });
      
      await set(workflowRef, updatedWorkflow);
      
      // Verify the update was successful
      const verifySnapshot = await get(workflowRef);
      const verifiedWorkflow = verifySnapshot.val();
      console.log('❌ rejectDesign - Verified workflow state after update:', {
        id: workflowId,
        currentStage: verifiedWorkflow.currentStage,
        status: verifiedWorkflow.status
      });
      
      console.log('❌ rejectDesign success - Design rejected and returned to graphic designer');
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error rejecting design:', error);
      throw new Error('Failed to reject design');
    }
  }

  static async getAllWorkflows() {
    console.log('📋 getAllWorkflows called');
    try {
      const snapshot = await get(ref(db, 'workflows'));
      const workflows = snapshot.val();
      
      if (!workflows) return [];
      
      const now = new Date();
      const result = Object.entries(workflows)
        .map(([key, workflow]) => {
          // Update status if deadline has passed for approved designs
          if (workflow.status === 'design_approved' && workflow.deadline) {
            const deadline = new Date(workflow.deadline);
            if (now >= deadline) {
              // Update to posted status
              this.updateWorkflowStatus(key, 'posted', { currentStage: 'completed' });
              workflow.status = 'posted';
              workflow.currentStage = 'completed';
            }
          }
          return { id: key, ...workflow };
        });
      
      console.log('📋 getAllWorkflows result:', result.length + ' workflows found');
      console.log('📋 getAllWorkflows statuses:', result.map(w => ({ id: w.id, status: w.status, stage: w.currentStage })));
      return result;
    } catch (error) {
      console.error('❌ Error getting all workflows:', error);
      throw new AppError('Failed to get workflows', 500);
    }
  }

  static async updateWorkflow(workflowId, updateData) {
    console.log('✏️ updateWorkflow called with:', { workflowId, updateData });
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const snapshot = await get(workflowRef);
      
      if (!snapshot.exists()) {
        throw new Error('Workflow not found');
      }
      
      const currentWorkflow = snapshot.val();
      const updatedWorkflow = {
        ...currentWorkflow,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      console.log('✏️ updateWorkflow success - Workflow updated');
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error updating workflow:', error);
      throw new Error('Failed to update workflow');
    }
  }

  static async submitContent(workflowId, contentData) {
    console.log('📤 submitContent called with:', { workflowId, contentData });
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const snapshot = await get(workflowRef);
      
      if (!snapshot.exists()) {
        throw new Error('Workflow not found');
      }
      
      const workflow = snapshot.val();
      const updatedWorkflow = {
        ...workflow,
        status: 'content_approval',
        currentStage: 'marketinglead',
        contentCreator: {
          content: contentData,
          submittedAt: new Date().toISOString()
        },
        marketingRejection: null,
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      
      // Create notification for content submission
      await this.createContentCreatorNotification({
        type: 'content_submitted',
        message: `Content submitted successfully for: ${workflow.objectives}`,
        workflowId: workflowId,
        user: 'Content Creator'
      });
      
      console.log('📤 submitContent success - Content with SEO analysis saved to database');
      console.log('📊 SEO data saved:', contentData.seoAnalysis ? 'Yes' : 'No');
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error submitting content:', error);
      throw new Error('Failed to submit content');
    }
  }

  static async assignToGraphicDesigner(workflowId) {
    console.log('🎨 assignToGraphicDesigner called with workflowId:', workflowId);
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const snapshot = await get(workflowRef);
      
      if (!snapshot.exists()) {
        throw new Error('Workflow not found');
      }
      
      const workflow = snapshot.val();
      const updatedWorkflow = {
        ...workflow,
        status: 'design_creation',
        currentStage: 'graphicdesigner',
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      console.log('🎨 assignToGraphicDesigner success - Task assigned to graphic designer');
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error assigning to graphic designer:', error);
      throw new Error('Failed to assign to graphic designer');
    }
  }

  static async approveContent(workflowId, approvedBy) {
    console.log('✅ approveContent called with workflowId:', workflowId);
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const snapshot = await get(workflowRef);
      
      if (!snapshot.exists()) {
        throw new Error('Workflow not found');
      }
      
      const workflow = snapshot.val();
      const updatedWorkflow = {
        ...workflow,
        status: 'ready_for_design_assignment',
        currentStage: 'marketinglead',
        marketingApproval: {
          approvedAt: new Date().toISOString(),
          approvedBy: approvedBy
        },
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      
      // Create notification for content approval
      await this.createContentCreatorNotification({
        type: 'content_approved',
        message: `Your content has been approved: ${workflow.objectives}`,
        workflowId: workflowId,
        user: 'Content Creator'
      });
      
      console.log('✅ approveContent success - Content approved, ready for design assignment');
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error approving content:', error);
      throw new Error('Failed to approve content');
    }
  }

  static async rejectContent(workflowId, rejectedBy, feedback) {
    console.log('❌ rejectContent called with workflowId:', workflowId);
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const snapshot = await get(workflowRef);
      
      if (!snapshot.exists()) {
        throw new Error('Workflow not found');
      }
      
      const workflow = snapshot.val();
      const updatedWorkflow = {
        ...workflow,
        status: 'content_rejected',
        currentStage: 'contentcreator',
        marketingRejection: {
          rejectedAt: new Date().toISOString(),
          rejectedBy: rejectedBy,
          feedback: feedback
        },
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      
      // Create notification for content rejection
      await this.createContentCreatorNotification({
        type: 'content_rejected',
        message: `Your content has been rejected: ${workflow.objectives}. Please review feedback and resubmit.`,
        workflowId: workflowId,
        user: 'Content Creator'
      });
      
      console.log('❌ rejectContent success - Content rejected and returned to content creator');
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error rejecting content:', error);
      throw new Error('Failed to reject content');
    }
  }

  static async deleteWorkflow(workflowId) {
    console.log('🗑️ deleteWorkflow called with:', workflowId);
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      await remove(workflowRef);
      console.log('🗑️ deleteWorkflow success - Workflow deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting workflow:', error);
      throw new Error('Failed to delete workflow');
    }
  }

  static async getWorkflowsByStatus(status) {
    console.log('📈 getWorkflowsByStatus called with status:', status);
    try {
      const snapshot = await get(ref(db, 'workflows'));
      const workflows = snapshot.val();
      
      if (!workflows) return [];
      
      const now = new Date();
      const filteredWorkflows = Object.entries(workflows)
        .filter(([key, workflow]) => {
          // Update status if deadline has passed for approved designs
          if (workflow.status === 'design_approved' && workflow.deadline) {
            const deadline = new Date(workflow.deadline);
            if (now >= deadline) {
              // Update to posted status
              this.updateWorkflowStatus(key, 'posted', { currentStage: 'completed' });
              workflow.status = 'posted';
              workflow.currentStage = 'completed';
            }
          }
          return workflow.status === status;
        })
        .map(([key, workflow]) => ({ id: key, ...workflow }));
      
      console.log('📈 getWorkflowsByStatus result:', filteredWorkflows.length + ' workflows found');
      return filteredWorkflows;
    } catch (error) {
      console.error('❌ Error getting workflows by status:', error);
      throw new AppError('Failed to get workflows', 500);
    }
  }

  static async getWorkflowsByMultipleStatuses(statuses) {
    console.log('📈 getWorkflowsByMultipleStatuses called with statuses:', statuses);
    try {
      const snapshot = await get(ref(db, 'workflows'));
      const workflows = snapshot.val();
      
      if (!workflows) return [];
      
      const now = new Date();
      const filteredWorkflows = Object.entries(workflows)
        .filter(([key, workflow]) => {
          // Update status if deadline has passed for approved designs
          if (workflow.status === 'design_approved' && workflow.deadline) {
            const deadline = new Date(workflow.deadline);
            if (now >= deadline) {
              // Update to posted status
              this.updateWorkflowStatus(key, 'posted', { currentStage: 'completed' });
              workflow.status = 'posted';
              workflow.currentStage = 'completed';
            }
          }
          
          // For design-related statuses, check if graphicDesigner exists
          if (statuses.includes('design_approval') || statuses.includes('design_rejected') || statuses.includes('posted') || statuses.includes('design_approved')) {
              return statuses.includes(workflow.status);
          }
          // For content-related statuses, check if contentCreator exists
          return workflow.contentCreator && statuses.includes(workflow.status);
        })
        .map(([key, workflow]) => ({ id: key, ...workflow }));
      
      console.log('📈 getWorkflowsByMultipleStatuses result:', filteredWorkflows.length + ' workflows found');
      return filteredWorkflows;
    } catch (error) {
      console.error('❌ Error getting workflows by multiple statuses:', error);
      throw new AppError('Failed to get workflows', 500);
    }
  }

  static async updateWorkflowStatus(workflowId, status, additionalData = {}) {
    console.log('🔄 updateWorkflowStatus called with:', { workflowId, status, additionalData });
    try {
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const snapshot = await get(workflowRef);
      
      if (!snapshot.exists()) {
        throw new Error('Workflow not found');
      }
      
      const currentWorkflow = snapshot.val();
      const updatedWorkflow = {
        ...currentWorkflow,
        status,
        ...additionalData,
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      
      // Auto-post to social media when status changes to 'posted'
      if (status === 'posted' && currentWorkflow.status !== 'posted') {
        console.log('📢 Triggering auto-post for workflow:', workflowId);
        await this.autoPostToSocialMedia(workflowId, updatedWorkflow);
      }
      
      console.log('🔄 updateWorkflowStatus success - Status updated to:', status);
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error updating workflow status:', error);
      throw new Error('Failed to update workflow status');
    }
  }

  // ========================
  // 5)  NOTIFICATIONS
  // ========================

  // ========================
  // 5.1) CREATE NOTIFICATIONS
  // ========================

  static async createAdminNotification(notificationData) {
    console.log('🔔 createAdminNotification called with data:', notificationData);
    try {
      const createNotifAdminRef = push(ref(db, 'notification/admin'));
      console.log('🔔 createAdminNotification Firebase path: notification/admin/', createNotifAdminRef.key);

      const notifData = {
        type: notificationData.type,
        message: notificationData.message,
        read: notificationData.read || false,
        timestamp: notificationData.timestamp || new Date().toISOString(),
        user: notificationData.user
      };
      console.log('🔔 createAdminNotification saving notification:', notifData);
      
      await set(createNotifAdminRef, notifData);
      console.log('🔔 createAdminNotification success - Notification saved with key:', createNotifAdminRef.key);
      return createNotifAdminRef.key;
    } catch (error) {
      console.error('❌ Error saving Admin notification:', error);
      throw new Error('Failed to save Admin notification');
    }
  }

  static async createMarketingNotification(notificationData) {
    console.log('🔔 createMarketingNotification called with data:', notificationData);
    try {
      const createNotifRef = push(ref(db, 'notification/marketing'));
      const notifData = {
        type: notificationData.type,
        message: notificationData.message,
        read: notificationData.read || false,
        timestamp: notificationData.timestamp || new Date().toISOString(),
        user: notificationData.user
      };
      
      await set(createNotifRef, notifData);
      console.log('🔔 createMarketingNotification success - Notification saved');
      return createNotifRef.key;
    } catch (error) {
      console.error('❌ Error saving Marketing notification:', error);
      throw new Error('Failed to save Marketing notification');
    }
  }

  static async createContentCreatorNotification(notificationData) {
    console.log('🔔 createContentCreatorNotification called with data:', notificationData);
    try {
      const createNotifRef = push(ref(db, 'notification/contentcreator'));
      const notifData = {
        type: notificationData.type,
        message: notificationData.message,
        read: notificationData.read || false,
        timestamp: notificationData.timestamp || new Date().toISOString(),
        workflowId: notificationData.workflowId,
        user: notificationData.user
      };
      
      await set(createNotifRef, notifData);
      console.log('🔔 createContentCreatorNotification success - Notification saved');
      return createNotifRef.key;
    } catch (error) {
      console.error('❌ Error saving Content Creator notification:', error);
      throw new Error('Failed to save Content Creator notification');
    }
  }

  // ========================
  // 5.2) GET NOTIFICATIONS
  // ========================
  static async getadminNotification() {
    console.log('📬 getadminNotification called');
    try {
      const snapshot = await get(ref(db, 'notification/admin'));
      const result = snapshot.val();
      console.log('📬 getadminNotification result:', result ? Object.keys(result).length + ' notifications found' : 'No notifications found');
      return result;
    } catch (error) {
      console.error('❌ Error getting admin notifications:', error);
      throw new Error('Failed to get admin notifications');
    }
  }

  static async getContentCreatorNotifications() {
    console.log('📬 getContentCreatorNotifications called');
    try {
      const snapshot = await get(ref(db, 'notification/contentcreator'));
      const result = snapshot.val();
      console.log('📬 getContentCreatorNotifications result:', result ? Object.keys(result).length + ' notifications found' : 'No notifications found');
      return result;
    } catch (error) {
      console.error('❌ Error getting content creator notifications:', error);
      throw new Error('Failed to get content creator notifications');
    }
  }

  // ========================
  // 6) APPROVAL OPERATIONS
  // ========================
  static async approveUser(username) {
    console.log('✅ approveUser called with username:', username);
    try {
      const safeUsername = safeKey(username);
      const approvalRef = ref(db, `ApprovalofAccounts/${safeUsername}`);
      const snapshot = await get(approvalRef);
      
      if (!snapshot.exists()) {
        console.log('❌ approveUser - User not found in approval queue:', username);
        throw new Error('User not found in approval queue');
      }
      
      const userData = snapshot.val();
      console.log('✅ approveUser - User data retrieved:', userData.username);
      
      const roleRef = ref(db, `${userData.role}/${safeUsername}`);
      await set(roleRef, userData);
      console.log('✅ approveUser - User moved to role:', userData.role);
      
      await remove(approvalRef);
      console.log('✅ approveUser - User removed from approval queue');
      
      return userData;
    } catch (error) {
      console.error('❌ Error approving user:', error);
      throw new Error('Failed to approve user');
    }
  }

  static async rejectUser(username) {
    console.log('❌ rejectUser called with username:', username);
    try {
      const safeUsername = safeKey(username);
      const approvalRef = ref(db, `ApprovalofAccounts/${safeUsername}`);
      await remove(approvalRef);
      console.log('❌ rejectUser - User removed from approval queue');
      return true;
    } catch (error) {
      console.error('❌ Error rejecting user:', error);
      throw new Error('Failed to reject user');
    }
  }

  static async updateUserLastLogin(username, role) {
    console.log('🕒 updateUserLastLogin called with username:', username, 'role:', role);
    try {
      const safeUsername = safeKey(username);
      const userRef = ref(db, `${role}/${safeUsername}/lastLogin`);
      await set(userRef, new Date().toISOString());
      console.log('🕒 updateUserLastLogin success - Last login updated');
      return true;
    } catch (error) {
      console.error('❌ Error updating last login:', error);
      throw new Error('Failed to update last login');
    }
  }

  static async updateUserPassword(userPath, hashedPassword) {
    console.log('🔒 updateUserPassword called for path:', userPath);
    try {
      const passwordRef = ref(db, `${userPath}/password`);
      const forceResetRef = ref(db, `${userPath}/forcePasswordReset`);
      
      await set(passwordRef, hashedPassword);
      await set(forceResetRef, false);
      
      console.log('🔒 updateUserPassword success - Password updated and reset flag cleared');
      return true;
    } catch (error) {
      console.error('❌ Error updating password:', error);
      throw new Error('Failed to update password');
    }
  }

  static async getLoginSecuritySettings() {
    try {
      const settingsRef = ref(db, 'systemSettings/loginSecurity');
      const snapshot = await get(settingsRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      // Default settings
      return {
        enableAccountLockout: true,
        maxLoginAttempts: 5,
        lockoutDuration: 30
      };
    } catch (error) {
      console.error('❌ Error getting login security settings:', error);
      return {
        enableAccountLockout: true,
        maxLoginAttempts: 5,
        lockoutDuration: 30
      };
    }
  }

  static async checkAccountLockout(username) {
    try {
      const safeUsername = safeKey(username);
      const lockoutRef = ref(db, `loginAttempts/${safeUsername}`);
      const snapshot = await get(lockoutRef);
      
      if (!snapshot.exists()) {
        return { isLocked: false };
      }
      
      const data = snapshot.val();
      const now = Date.now();
      
      if (data.lockedUntil && data.lockedUntil > now) {
        return {
          isLocked: true,
          unlockTime: data.lockedUntil
        };
      }
      
      return { isLocked: false };
    } catch (error) {
      console.error('❌ Error checking account lockout:', error);
      return { isLocked: false };
    }
  }

  static async recordFailedAttempt(username, securitySettings) {
    try {
      if (!securitySettings.enableAccountLockout) {
        return;
      }
      
      const safeUsername = safeKey(username);
      const attemptsRef = ref(db, `loginAttempts/${safeUsername}`);
      const snapshot = await get(attemptsRef);
      
      let attempts = 1;
      if (snapshot.exists()) {
        const data = snapshot.val();
        attempts = (data.attempts || 0) + 1;
      }
      
      const now = Date.now();
      const updateData = {
        attempts,
        lastAttempt: now,
        username
      };
      
      // Lock account if max attempts reached
      if (attempts >= securitySettings.maxLoginAttempts) {
        updateData.lockedUntil = now + (securitySettings.lockoutDuration * 60 * 1000);
        updateData.lockedAt = now;
        console.log('🔒 Account locked:', username, 'until', new Date(updateData.lockedUntil));
      }
      
      await set(attemptsRef, updateData);
      console.log('📈 Failed attempt recorded:', username, 'attempts:', attempts);
    } catch (error) {
      console.error('❌ Error recording failed attempt:', error);
    }
  }

  static async clearFailedAttempts(username) {
    try {
      const safeUsername = safeKey(username);
      const attemptsRef = ref(db, `loginAttempts/${safeUsername}`);
      await remove(attemptsRef);
      console.log('✅ Failed attempts cleared for:', username);
    } catch (error) {
      console.error('❌ Error clearing failed attempts:', error);
    }
  }

  // ========================
  // 8) SOCIAL MEDIA AUTO-POSTING
  // ========================
  
  static async autoPostToSocialMedia(workflowId, workflow) {
    console.log('📢 autoPostToSocialMedia called for workflow:', workflowId);
    try {
      // Check if workflow has content and design
      const content = workflow.contentCreator?.content;
      const designUrl = workflow.graphicDesigner?.designUrl || workflow.graphicDesigner?.designs?.designUrl;
      const selectedPlatforms = workflow.selectedPlatforms || [];
      
      if (!content || !designUrl || selectedPlatforms.length === 0) {
        console.log('⚠️ Skipping auto-post - missing content, design, or platforms');
        return;
      }
      
      console.log('📢 Auto-posting to platforms:', selectedPlatforms.map(p => p.name || p));
      
      // Import social media service dynamically
      const { default: SocialMediaService } = await import('./socialMediaService.mjs');
      
      // Post to each selected platform
      const results = [];
      for (const platform of selectedPlatforms) {
        const platformName = platform.name || platform;
        
        try {
          // Get platform-specific content from selectedContent structure or fallback to legacy format
          let platformContent;
          
          if (content.selectedContent?.[platformName.toLowerCase()]) {
            // New multi-platform format
            platformContent = content.selectedContent[platformName.toLowerCase()];
          } else if (content.headline && content.caption && content.hashtag) {
            // Legacy single-platform format
            platformContent = {
              headline: content.headline,
              caption: content.caption,
              hashtag: content.hashtag
            };
          } else {
            console.log(`⚠️ No content found for platform: ${platformName}`);
            continue;
          }
          
          // Prepare content for posting with platform-specific data
          const postContent = {
            headline: platformContent.headline,
            caption: platformContent.caption,
            hashtag: platformContent.hashtag,
            imageUrl: designUrl
          };
          
          console.log(`📝 Posting ${platformName} content:`, {
            headline: postContent.headline?.substring(0, 50) + '...',
            caption: postContent.caption?.substring(0, 50) + '...',
            hashtag: postContent.hashtag?.substring(0, 30) + '...'
          });
          
          let result;
          
          switch (platformName.toLowerCase()) {
            case 'facebook':
              console.log('📘 Facebook posting - checking credentials...');
              console.log('📘 Facebook posting using Firebase page tokens...');
              
              // Get all active Facebook pages and post to each
              const { ref: fbRef, get: fbGet } = await import('firebase/database');
              const { getDatabase: fbGetDb } = await import('firebase/database');
              const { initializeApp: fbInitApp } = await import('firebase/app');
              const { config: fbConfig } = await import('../config/config.mjs');
              
              const fbApp = fbInitApp(fbConfig.firebase);
              const fbDb = fbGetDb(fbApp, fbConfig.firebase.databaseURL);
              
              const pagesRef = fbRef(fbDb, 'connectedPages/admin');
              const pagesSnapshot = await fbGet(pagesRef);
              
              if (pagesSnapshot.exists()) {
                const pages = Object.values(pagesSnapshot.val());
                const activePages = pages.filter(page => page.active === true);
                
                console.log(`📘 Posting to ${activePages.length} active Facebook pages`);
                
                for (const page of activePages) {
                  try {
                    console.log(`📘 Facebook posting using Firebase page tokens...`);
                    console.log(`🔍 Using active page: ${page.name} ID: ${page.id}`);
                    const fbResult = await SocialMediaService.postToFacebook(postContent, page.id);
                    console.log(`✅ Posted to facebook: ${fbResult.postId}`);
                  } catch (fbError) {
                    console.error(`❌ Failed to post to Facebook page ${page.name}:`, fbError.message);
                  }
                }
                
                result = { success: true, platform: 'facebook', message: `Posted to ${activePages.length} Facebook pages` };
              } else {
                result = await SocialMediaService.postToFacebook(postContent);
              }
              break;
              
            case 'twitter':
              console.log('🐦 Twitter posting - checking credentials...');
              console.log('🐦 Twitter posting using OAuth 2.0 user tokens from Firebase...');
              result = await SocialMediaService.postToTwitter(postContent);
              break;
              
            case 'instagram':
              console.log('📷 Instagram posting - checking credentials...');
              console.log('📷 Instagram posting using Firebase page tokens...');
              console.log('📷 Instagram posting using Firebase tokens...');
              result = await SocialMediaService.postToInstagram(postContent);
              break;
              
            default:
              console.log('⚠️ Unsupported platform:', platformName);
              continue;
          }
          
          results.push(result);
          console.log(`✅ Posted to ${platformName}:`, result.postId);
          
        } catch (error) {
          console.error(`❌ Failed to post to ${platformName}:`, error.message);
          results.push({
            success: false,
            platform: platformName,
            error: error.message
          });
        }
      }
      
      // Update workflow with posting results
      const workflowRef = ref(db, `workflows/${workflowId}`);
      const updatedWorkflow = {
        ...workflow,
        socialMediaPosts: {
          postedAt: new Date().toISOString(),
          results: results,
          platforms: selectedPlatforms
        },
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      console.log('📢 Auto-posting completed for workflow:', workflowId);
      
    } catch (error) {
      console.error('❌ Error in auto-posting:', error);
    }
  }
}

// ========================
// 7) EXPORTS
// ========================

export default FirebaseService;
