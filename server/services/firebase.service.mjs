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
          console.log('🔍 findUserByUsername found user via direct lookup:', user.username, 'in role:', role);
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
      
      const result = Object.entries(workflows)
        .filter(([key, workflow]) => workflow.currentStage === stage)
        .map(([key, workflow]) => ({ id: key, ...workflow }));
      
      console.log('📋 getWorkflowsByStage result:', result.length + ' workflows found for stage:', stage);
      return result;
    } catch (error) {
      console.error('❌ Error getting workflows by stage:', error);
      throw new AppError('Failed to get workflows', 500);
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
          designs: designData,
          submittedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      console.log('🎨 submitDesign success - Design submitted');
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
      
      const result = snapshot.val();
      console.log('📄 getWorkflowById success - Workflow found');
      return { id: workflowId, ...result };
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
      const updatedWorkflow = {
        ...workflow,
        status: 'posted',
        currentStage: 'completed',
        finalApproval: {
          approvedAt: new Date().toISOString(),
          approvedBy: approvedBy,
          postedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      console.log('✅ approveDesign success - Design approved and posted');
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error approving design:', error);
      throw new Error('Failed to approve design');
    }
  }

  static async getAllWorkflows() {
    console.log('📋 getAllWorkflows called');
    try {
      const snapshot = await get(ref(db, 'workflows'));
      const workflows = snapshot.val();
      
      if (!workflows) return [];
      
      const result = Object.entries(workflows)
        .map(([key, workflow]) => ({ id: key, ...workflow }));
      
      console.log('📋 getAllWorkflows result:', result.length + ' workflows found');
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
        updatedAt: new Date().toISOString()
      };
      
      await set(workflowRef, updatedWorkflow);
      console.log('📤 submitContent success - Content submitted');
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
      console.log('✅ approveContent success - Content approved, ready for design assignment');
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ Error approving content:', error);
      throw new Error('Failed to approve content');
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
      
      const filteredWorkflows = Object.entries(workflows)
        .filter(([key, workflow]) => workflow.status === status)
        .map(([key, workflow]) => ({ id: key, ...workflow }));
      
      console.log('📈 getWorkflowsByStatus result:', filteredWorkflows.length + ' workflows found');
      return filteredWorkflows;
    } catch (error) {
      console.error('❌ Error getting workflows by status:', error);
      throw new AppError('Failed to get workflows', 500);
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
}

// ========================
// 7) EXPORTS
// ========================

export default FirebaseService;
