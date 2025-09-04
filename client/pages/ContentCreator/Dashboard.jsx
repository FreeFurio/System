import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { ref, get } from 'firebase/database';
import { FiEdit3, FiClock, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { componentStyles, statusColors } from '../../styles/designSystem';

export default function Dashboard() {
  const [stats, setStats] = useState({
    assignedTasks: 0,
    completedTasks: 0,
    pendingSubmissions: 0,
    approvedContent: 0,
    recentTasks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch workflows for content creator tasks
        const workflowsRef = ref(db, 'workflows');
        const workflowsSnapshot = await get(workflowsRef);
        
        if (workflowsSnapshot.exists()) {
          const workflows = workflowsSnapshot.val();
          let assignedTasks = 0;
          let completedTasks = 0;
          let pendingSubmissions = 0;
          let approvedContent = 0;
          const recentTasks = [];

          Object.entries(workflows).forEach(([id, workflow]) => {
            // Count assigned tasks (content creation stage)
            if (workflow.currentStage === 'contentcreator' && workflow.status === 'content_creation') {
              assignedTasks++;
              recentTasks.push({
                id,
                title: workflow.objectives || 'Content Task',
                status: 'assigned',
                deadline: workflow.deadline,
                createdAt: workflow.createdAt
              });
            }
            
            // Count completed tasks (submitted for approval)
            if (workflow.status === 'content_approval' && workflow.contentCreator) {
              completedTasks++;
              pendingSubmissions++;
              recentTasks.push({
                id,
                title: workflow.objectives || 'Content Task',
                status: 'pending_approval',
                submittedAt: workflow.contentCreator.submittedAt
              });
            }
            
            // Count approved content
            if (workflow.marketingApproval && workflow.contentCreator) {
              approvedContent++;
              recentTasks.push({
                id,
                title: workflow.objectives || 'Content Task',
                status: 'approved',
                approvedAt: workflow.marketingApproval.approvedAt
              });
            }
          });

          // Sort recent tasks by date and take latest 5
          recentTasks.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.submittedAt || a.approvedAt);
            const dateB = new Date(b.createdAt || b.submittedAt || b.approvedAt);
            return dateB - dateA;
          });

          setStats({
            assignedTasks,
            completedTasks,
            pendingSubmissions,
            approvedContent,
            recentTasks: recentTasks.slice(0, 5)
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div style={componentStyles.statCard}>
      <div style={{ ...componentStyles.statIcon, background: bgColor }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <h3 style={componentStyles.statValue}>{value}</h3>
        <p style={componentStyles.statLabel}>{title}</p>
      </div>
    </div>
  );

  return (
    <div style={componentStyles.pageContainer}>
      {/* Header */}
      <div style={componentStyles.pageHeader}>
        <h1 style={componentStyles.pageTitle}>Content Creator Dashboard</h1>
        <p style={componentStyles.pageSubtitle}>
          Manage your content creation tasks and track your progress
        </p>
      </div>

      {/* Stats Grid */}
      <div style={componentStyles.statsGrid}>
        <StatCard
          icon={FiEdit3}
          title="Assigned Tasks"
          value={stats.assignedTasks}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          icon={FiClock}
          title="Pending Submissions"
          value={stats.pendingSubmissions}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatCard
          icon={FiCheckCircle}
          title="Approved Content"
          value={stats.approvedContent}
          color="#10b981"
          bgColor="#f0fdf4"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Total Completed"
          value={stats.completedTasks}
          color="#8b5cf6"
          bgColor="#faf5ff"
        />
      </div>

      {/* Recent Tasks */}
      <div style={componentStyles.card}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
          Recent Tasks
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stats.recentTasks.length > 0 ? stats.recentTasks.map((task, index) => (
            <div key={task.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px', background: '#f8fafc', borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  ...componentStyles.statusDot,
                  background: statusColors[task.status] || statusColors.inactive
                }}></div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {
                      task.status === 'assigned' ? 'Ready to work on' :
                      task.status === 'pending_approval' ? 'Waiting for approval' :
                      task.status === 'approved' ? 'Approved by Marketing Lead' : task.status
                    }
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {task.deadline && new Date(task.deadline).toLocaleDateString()}
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <FiCalendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>No recent tasks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 