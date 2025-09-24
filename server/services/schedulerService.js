import cron from 'node-cron';
import FirebaseService from './firebase.service.mjs';
import socialMediaService from './socialMediaService.js';

class SchedulerService {
  constructor() {
    this.scheduledTasks = new Map();
    this.initializeScheduler();
  }

  initializeScheduler() {
    // Check for pending posts every hour
    cron.schedule('0 * * * *', () => {
      this.checkPendingPosts();
    });
    
    console.log('📅 Scheduler service initialized');
  }

  async checkPendingPosts() {
    try {
      console.log('🔍 Checking for pending posts...');
      
      // Get workflows that are approved and ready for posting
      const workflows = await FirebaseService.getWorkflowsByStatus('design_approved');
      const now = new Date();
      
      for (const workflow of workflows) {
        const deadline = new Date(workflow.deadline);
        
        // If deadline has passed and not yet posted
        if (deadline <= now && workflow.status !== 'posted') {
          await this.executeAutomatedPost(workflow);
        }
      }
    } catch (error) {
      console.error('❌ Error checking pending posts:', error);
    }
  }

  async executeAutomatedPost(workflow) {
    try {
      console.log(`🚀 Executing automated post for workflow: ${workflow.id}`);
      
      const { selectedPlatforms, contentCreator } = workflow;
      
      if (!selectedPlatforms || selectedPlatforms.length === 0) {
        console.log('⚠️ No platforms selected for workflow:', workflow.id);
        return;
      }

      if (!contentCreator?.content) {
        console.log('⚠️ No content available for workflow:', workflow.id);
        return;
      }

      const content = {
        headline: contentCreator.content.headline,
        caption: contentCreator.content.caption,
        hashtag: contentCreator.content.hashtag,
        imageUrl: workflow.graphicDesigner?.designs?.[0] || null
      };

      // Prepare platform tokens (these should be configured in environment)
      const tokens = {
        facebook: {
          accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
          pageId: process.env.FACEBOOK_PAGE_ID
        },
        instagram: {
          accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
          accountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
        }
      };

      const platforms = selectedPlatforms.map(name => ({ name }));
      
      // Post to selected platforms
      const result = await socialMediaService.postToMultiplePlatforms(
        content, 
        platforms, 
        tokens
      );

      // Update workflow status to posted
      await FirebaseService.updateWorkflowStatus(workflow.id, 'posted', {
        postedAt: new Date().toISOString(),
        postingResults: result
      });

      console.log(`✅ Automated posting completed for workflow: ${workflow.id}`);
      
    } catch (error) {
      console.error(`❌ Error executing automated post for workflow ${workflow.id}:`, error);
      
      // Update workflow with error status
      await FirebaseService.updateWorkflowStatus(workflow.id, 'posting_failed', {
        error: error.message,
        failedAt: new Date().toISOString()
      });
    }
  }

  // Manual trigger for testing
  async triggerManualPost(workflowId) {
    try {
      const workflow = await FirebaseService.getWorkflowById(workflowId);
      if (workflow) {
        await this.executeAutomatedPost(workflow);
        return { success: true, message: 'Manual posting triggered successfully' };
      } else {
        throw new Error('Workflow not found');
      }
    } catch (error) {
      console.error('❌ Manual posting failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SchedulerService();