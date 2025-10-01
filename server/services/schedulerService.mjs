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

  // Check for workflows that need to be posted
  async checkAndPostWorkflows() {
    try {
      console.log('🔍 Checking for workflows ready to post...');
      
      const workflows = await FirebaseService.getAllWorkflows();
      const now = new Date();
      
      let postsTriggered = 0;
      
      for (const workflow of workflows) {
        if (workflow.status === 'design_approved' && workflow.deadline) {
          const deadline = new Date(workflow.deadline);
          
          if (now >= deadline) {
            console.log(`⏰ Workflow ${workflow.id} deadline reached, posting...`);
            
            await FirebaseService.updateWorkflowStatus(
              workflow.id, 
              'posted', 
              { currentStage: 'completed' }
            );
            
            postsTriggered++;
          }
        }
      }
      
      if (postsTriggered > 0) {
        console.log(`📤 Triggered ${postsTriggered} workflow posts`);
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