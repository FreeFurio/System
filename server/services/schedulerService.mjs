import cron from 'node-cron';
import FirebaseService from './firebase.service.mjs';

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  // Initialize scheduler
  init() {
    console.log('📅 Initializing scheduler service...');
    
    // Check for workflows to post every minute
    this.scheduleWorkflowPosting();
    
    // Auto-refresh insights at 12:00 AM daily
    this.scheduleInsightsRefresh();
    
    console.log('✅ Scheduler service initialized');
  }

  // Schedule workflow posting check
  scheduleWorkflowPosting() {
    const job = cron.schedule('* * * * *', async () => {
      await this.checkAndPostWorkflows();
    }, {
      scheduled: false
    });

    this.jobs.set('workflow-posting', job);
    job.start();
    
    console.log('📅 Workflow posting scheduler started (runs every minute)');
  }

  // Schedule insights refresh at 12:00 AM
  scheduleInsightsRefresh() {
    const job = cron.schedule('0 0 * * *', async () => {
      await this.triggerInsightsRefresh();
    }, {
      scheduled: false
    });

    this.jobs.set('insights-refresh', job);
    job.start();
    
    console.log('📅 Insights refresh scheduler started (runs at 12:00 AM)');
  }

  // Trigger the same refresh function as the button
  async triggerInsightsRefresh() {
    try {
      console.log('🔄 Auto-refreshing insights at 12:00 AM...');
      
      const axios = await import('axios');
      
      // Call the same endpoint as the refresh button with force refresh
      await axios.default.post('http://localhost:3000/api/v1/admin/refresh-insights', {
        accountId: 'admin'
      });
      
      console.log('✅ Insights auto-refresh completed');
    } catch (error) {
      console.error('❌ Error in auto-refresh:', error.message);
    }
  }

  // Check for workflows that need to be posted
  async checkAndPostWorkflows() {
    try {
      const now = new Date();
      console.log(`🔍 [${now.toISOString()}] Checking for workflows ready to post...`);
      
      const workflows = await FirebaseService.getAllWorkflows();
      console.log(`📊 Found ${workflows.length} total workflows`);
      
      let postsTriggered = 0;
      let expiredWorkflows = 0;
      let approvedCount = 0;
      
      for (const workflow of workflows) {
        if (workflow.status === 'design_approved') {
          approvedCount++;
          const deadline = new Date(workflow.deadline);
          const timeUntilDeadline = deadline - now;
          const minutesUntil = Math.floor(timeUntilDeadline / 60000);
          
          console.log(`✅ Workflow ${workflow.id}: status=${workflow.status}, deadline=${workflow.deadline}, minutes until deadline=${minutesUntil}`);
        }
        
        if (workflow.deadline) {
          const deadline = new Date(workflow.deadline);
          
          if (now >= deadline) {
            if (workflow.status === 'design_approved') {
              console.log(`⏰ Workflow ${workflow.id} deadline reached! Posting now...`);
              console.log(`   - Deadline: ${workflow.deadline}`);
              console.log(`   - Current time: ${now.toISOString()}`);
              console.log(`   - Status: ${workflow.status}`);
              
              // Call actual social media posting
              await FirebaseService.autoPostToSocialMedia(workflow.id, workflow);
              
              await FirebaseService.updateWorkflowStatus(
                workflow.id, 
                'posted', 
                { currentStage: 'completed' }
              );
              
              postsTriggered++;
              console.log(`✅ Workflow ${workflow.id} posted successfully!`);
            } else if (workflow.status !== 'posted' && workflow.status !== 'expired') {
              console.log(`⚠️ Workflow ${workflow.id} expired without completion. Status: ${workflow.status}`);
              
              // Mark as expired
              await FirebaseService.updateWorkflowStatus(
                workflow.id, 
                'expired', 
                { 
                  currentStage: 'expired',
                  expiredAt: now.toISOString(),
                  expiredStatus: workflow.status
                }
              );
              
              expiredWorkflows++;
            }
          }
        }
      }
      
      console.log(`📊 Summary: ${approvedCount} approved workflows, ${postsTriggered} posted, ${expiredWorkflows} expired`);
      
      if (postsTriggered > 0) {
        console.log(`📤 ✅ Triggered ${postsTriggered} workflow posts`);
      }
      
      if (expiredWorkflows > 0) {
        console.log(`⚠️ Marked ${expiredWorkflows} workflows as expired`);
      }
      
    } catch (error) {
      console.error('❌ Error in workflow posting scheduler:', error);
    }
  }

  // Stop all scheduled jobs
  stop() {
    console.log('🛑 Stopping scheduler service...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`🛑 Stopped job: ${name}`);
    });
    
    this.jobs.clear();
    console.log('✅ Scheduler service stopped');
  }
}

export default new SchedulerService();