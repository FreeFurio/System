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
        // Fetch workflows using API endpoint for real-time data
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          const workflows = Array.isArray(data.data) ? data.data : [];
          let assignedTasks = 0;
          let completedTasks = 0;
          let pendingSubmissions = 0;
          let approvedContent = 0;
          const recentTasks = [];

          workflows.forEach((workflow) => {
            if (!workflow) return;
            
            // Count assigned tasks (content creation stage)
            if (workflow.currentStage === 'contentcreator' && workflow.status === 'content_creation') {
              assignedTasks++;
              recentTasks.push({
                id: workflow.id || Date.now() + Math.random(),
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
                id: workflow.id || Date.now() + Math.random(),
                title: workflow.objectives || 'Content Task',
                status: 'pending_approval',
                submittedAt: workflow.contentCreator.submittedAt
              });
            }
            
            // Count approved content
            if (workflow.marketingApproval && workflow.contentCreator) {
              approvedContent++;
              recentTasks.push({
                id: workflow.id || Date.now() + Math.random(),
                title: workflow.objectives || 'Content Task',
                status: 'approved',
                approvedAt: workflow.marketingApproval.approvedAt
              });
            }
          });

          // Sort recent tasks by date and take latest 5
          recentTasks.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.submittedAt || a.approvedAt || 0);
            const dateB = new Date(b.createdAt || b.submittedAt || b.approvedAt || 0);
            return dateB - dateA;
          });

          setStats({
            assignedTasks,
            completedTasks,
            pendingSubmissions,
            approvedContent,
            recentTasks: recentTasks.slice(0, 5)
          });
        } else {
          throw new Error('Invalid response format');
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

  const StatCard = ({ icon: Icon, title, value, badge, color = 'blue' }) => (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: color === 'blue' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                       color === 'green' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                       color === 'orange' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                       'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <Icon size={28} />
          </div>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#6b7280',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {title}
            </div>
          </div>
        </div>
        <span style={{
          background: color === 'blue' ? '#dbeafe' :
                     color === 'green' ? '#d1fae5' :
                     color === 'orange' ? '#fed7aa' :
                     '#e0e7ff',
          color: color === 'blue' ? '#1e40af' :
                color === 'green' ? '#065f46' :
                color === 'orange' ? '#9a3412' :
                '#5b21b6',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {badge}
        </span>
      </div>
      <div style={{
        fontSize: '36px',
        fontWeight: '800',
        color: '#111827',
        marginBottom: '8px',
        lineHeight: '1'
      }}>
        {value}
      </div>
    </div>
  );

  return (
    <div style={componentStyles.pageContainer}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        padding: '24px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          margin: 0,
          color: '#111827',
          fontSize: '32px',
          fontWeight: '800',
          letterSpacing: '-0.025em'
        }}>Content Creator Dashboard</h1>
        <p style={{
          margin: '8px 0 0 0',
          color: '#6b7280',
          fontSize: '16px',
          fontWeight: '400'
        }}>Manage your content creation tasks and track your progress</p>
      </div>

      {/* Stats Grid */}
      <div style={componentStyles.statsGrid}>
        <StatCard
          icon={FiEdit3}
          title="Assigned Tasks"
          value={stats.assignedTasks}
          badge="TASKS"
          color="blue"
        />
        <StatCard
          icon={FiClock}
          title="Pending Submissions"
          value={stats.pendingSubmissions}
          badge="PENDING"
          color="orange"
        />
        <StatCard
          icon={FiCheckCircle}
          title="Approved Content"
          value={stats.approvedContent}
          badge="APPROVED"
          color="green"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Total Completed"
          value={stats.completedTasks}
          badge="TOTAL"
          color="purple"
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