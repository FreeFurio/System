import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import { ref, get, onValue } from 'firebase/database';
import './ContentCalendar.css';

export default function ContentCalendar() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const data = {};
        
        // Fetch Ongoing Tasks
        const ongoingRef = ref(db, 'workflows');
        const ongoingSnapshot = await get(ongoingRef);
        if (ongoingSnapshot.exists()) {
          Object.entries(ongoingSnapshot.val()).forEach(([id, workflow]) => {
            if (workflow.status === 'content_creation' || workflow.status === 'design_creation') {
              const date = workflow.deadline || workflow.createdAt;
              const dateKey = formatDateKey(date);
              if (!data[dateKey]) data[dateKey] = [];
              data[dateKey].push({
                id,
                type: 'ongoing',
                title: workflow.objectives || 'Content Task',
                status: workflow.status,
                description: `Target: ${workflow.gender || 'All'}, Age: ${workflow.minAge || 0}-${workflow.maxAge || 100}`,
                deadline: workflow.deadline
              });
            }
          });
        }

        // Fetch Pending Approvals
        const approvalRef = ref(db, 'workflows');
        const approvalSnapshot = await get(approvalRef);
        if (approvalSnapshot.exists()) {
          Object.entries(approvalSnapshot.val()).forEach(([id, workflow]) => {
            if (workflow.status === 'content_approval' || workflow.status === 'design_approval') {
              const date = workflow.deadline || workflow.updatedAt;
              const dateKey = formatDateKey(date);
              if (!data[dateKey]) data[dateKey] = [];
              data[dateKey].push({
                id,
                type: 'approval',
                title: workflow.objectives || 'Pending Approval',
                status: 'pending',
                description: `Awaiting ${workflow.status === 'content_approval' ? 'content' : 'design'} approval`,
                submittedBy: workflow.contentCreator ? 'Content Creator' : 'Graphic Designer'
              });
            }
          });
        }

        // Fetch Approved Content
        const approvedRef = ref(db, 'workflows');
        const approvedSnapshot = await get(approvedRef);
        if (approvedSnapshot.exists()) {
          Object.entries(approvedSnapshot.val()).forEach(([id, workflow]) => {
            if (workflow.status === 'ready_for_design_assignment') {
              const date = workflow.deadline || workflow.marketingApproval?.approvedAt || workflow.updatedAt;
              const dateKey = formatDateKey(date);
              if (!data[dateKey]) data[dateKey] = [];
              data[dateKey].push({
                id,
                type: 'approved',
                title: workflow.objectives || 'Approved Content',
                status: 'ready',
                description: `Approved by ${workflow.marketingApproval?.approvedBy || 'Marketing Lead'}`,
                approvedAt: workflow.marketingApproval?.approvedAt
              });
            }
          });
        }

        // Fetch Posted/Scheduled Content
        const postedRef = ref(db, 'workflows');
        const postedSnapshot = await get(postedRef);
        if (postedSnapshot.exists()) {
          Object.entries(postedSnapshot.val()).forEach(([id, workflow]) => {
            if (workflow.status === 'posted') {
              const date = workflow.finalApproval?.postedAt || workflow.updatedAt;
              const dateKey = formatDateKey(date);
              if (!data[dateKey]) data[dateKey] = [];
              data[dateKey].push({
                id,
                type: 'scheduled',
                title: workflow.objectives || 'Posted Content',
                status: 'published',
                time: new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                description: `Published at ${new Date(date).toLocaleTimeString()}`,
                publishedBy: workflow.finalApproval?.approvedBy || 'System'
              });
            }
          });
        }

        setCalendarData(data);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();

    // Set up real-time listener for workflows
    const workflowsRef = ref(db, 'workflows');
    const unsubscribe = onValue(workflowsRef, () => {
      fetchCalendarData();
    });

    return () => unsubscribe();
  }, []);

  const formatDateKey = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (day) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const renderIndicators = (day) => {
    const dateKey = formatDate(day);
    const items = calendarData[dateKey] || [];
    return items.slice(0, 3).map(item => (
      <div 
        key={item.id} 
        style={{
          fontSize: '10px',
          fontWeight: '600',
          padding: '2px 6px',
          borderRadius: '4px',
          marginBottom: '2px',
          textAlign: 'center',
          background: 
            item.type === 'ongoing' ? '#fef3c7' :
            item.type === 'approval' ? '#dbeafe' :
            item.type === 'approved' ? '#d1fae5' :
            item.type === 'rejected' ? '#fee2e2' :
            item.type === 'scheduled' ? '#e9d5ff' : '#f3f4f6'
        }}
      >
        {
          item.type === 'ongoing' ? 'IN PROGRESS' :
          item.type === 'approval' ? 'PENDING' :
          item.type === 'approved' ? 'APPROVED' :
          item.type === 'rejected' ? 'REJECTED' :
          item.type === 'scheduled' ? 'POSTED' : item.type.toUpperCase()
        }
      </div>
    ));
  };

  const handleDateClick = (day) => {
    const dateKey = formatDate(day);
    setSelectedDate(dateKey);
  };

  const closeModal = () => {
    setSelectedDate(null);
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{
        minHeight: '120px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDate(day);
      const hasContent = calendarData[dateKey] && calendarData[dateKey].length > 0;
      const isPastDate = dateKey < todayDateString;
      
      days.push(
        <div 
          key={day} 
          style={{
            minHeight: '120px',
            padding: '8px',
            background: isPastDate ? '#f9fafb' : (hasContent ? '#f0f9ff' : '#fff'),
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: isPastDate ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            opacity: isPastDate ? 0.5 : 1
          }}
          onClick={() => !isPastDate && handleDateClick(day)}
          onMouseEnter={(e) => {
            if (!isPastDate) {
              if (hasContent) {
                const rect = e.target.getBoundingClientRect();
                setHoverPosition({ x: rect.left + rect.width / 2, y: rect.top });
                setHoveredDate(dateKey);
              }
              e.target.style.background = hasContent ? '#dbeafe' : '#f8fafc';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isPastDate) {
              setHoveredDate(null);
              e.target.style.background = hasContent ? '#f0f9ff' : '#fff';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isPastDate ? '#9ca3af' : '#374151'
          }}>{day}</span>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            marginTop: '4px',
            maxHeight: '80px',
            overflow: 'hidden'
          }}>
            {renderIndicators(day)}
          </div>
        </div>
      );
    }

    return days;
  };

  const getSelectedDateItems = () => {
    return selectedDate ? calendarData[selectedDate] || [] : [];
  };

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="content-calendar">
      <div className="calendar-header">
        <h2>Content Calendar</h2>
        <div className="month-navigation">
          <button onClick={() => navigateMonth('prev')}>&lt;</button>
          <div className="date-selectors">
            <select 
              value={currentMonth} 
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              className="month-selector"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select 
              value={currentYear} 
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="year-selector"
            >
              {Array.from({length: 10}, (_, i) => currentYear - 5 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button onClick={() => navigateMonth('next')}>&gt;</button>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="indicator ongoing"></span>
          <span>Ongoing Tasks</span>
        </div>
        <div className="legend-item">
          <span className="indicator approval"></span>
          <span>Pending Approval</span>
        </div>
        <div className="legend-item">
          <span className="indicator approved"></span>
          <span>Approved Content</span>
        </div>
        <div className="legend-item">
          <span className="indicator rejected"></span>
          <span>Rejected Content</span>
        </div>
        <div className="legend-item">
          <span className="indicator scheduled"></span>
          <span>Scheduled Posts</span>
        </div>
      </div>

      <div className="calendar-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-grid">
        {renderCalendarGrid()}
      </div>

      {/* Hover Card */}
      {hoveredDate && (
        <div 
          style={{
            position: 'fixed',
            left: hoverPosition.x - 150,
            top: hoverPosition.y - 10,
            width: '300px',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 1000,
            padding: '12px',
            transform: 'translateY(-100%)'
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            {hoveredDate}
          </div>
          {(calendarData[hoveredDate] || []).map(item => (
            <div key={item.id} style={{
              padding: '6px 0',
              borderBottom: '1px solid #f3f4f6',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: '500', color: '#111827' }}>{item.title}</div>
              <div style={{ color: '#6b7280', marginTop: '2px' }}>{item.description}</div>
              <div style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '500',
                marginTop: '4px',
                background: 
                  item.type === 'ongoing' ? '#fef3c7' :
                  item.type === 'approval' ? '#dbeafe' :
                  item.type === 'approved' ? '#d1fae5' :
                  item.type === 'rejected' ? '#fee2e2' :
                  item.type === 'scheduled' ? '#e9d5ff' : '#f3f4f6',
                color: 
                  item.type === 'ongoing' ? '#92400e' :
                  item.type === 'approval' ? '#1e40af' :
                  item.type === 'approved' ? '#065f46' :
                  item.type === 'rejected' ? '#991b1b' :
                  item.type === 'scheduled' ? '#5b21b6' : '#374151'
              }}>
                {
                  item.type === 'ongoing' ? 'In Progress' :
                  item.type === 'approval' ? 'Pending Review' :
                  item.type === 'approved' ? 'Approved' :
                  item.type === 'rejected' ? 'Rejected' :
                  item.type === 'scheduled' ? 'Published' : item.type
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDate && (
        <div className="modal-overlay" onClick={closeModal} style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div className="date-modal" onClick={(e) => e.stopPropagation()} style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: 0,
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e5e7eb',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#fff',
              borderRadius: '16px 16px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  📅
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                    Content for {selectedDate}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                    Scheduled content and tasks
                  </p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '12px',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontSize: '18px'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#fafbfc' }}>
              {getSelectedDateItems().length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {getSelectedDateItems().map(item => (
                    <div key={item.id} className="text-bg" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '18px 20px',
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      gap: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        background: 
                          item.type === 'ongoing' ? '#fef3c7' :
                          item.type === 'approval' ? '#dbeafe' :
                          item.type === 'approved' ? '#d1fae5' :
                          item.type === 'rejected' ? '#fee2e2' :
                          item.type === 'scheduled' ? '#e9d5ff' : '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {
                          item.type === 'ongoing' ? '⏳' :
                          item.type === 'approval' ? '👀' :
                          item.type === 'approved' ? '✅' :
                          item.type === 'rejected' ? '❌' :
                          item.type === 'scheduled' ? '🚀' : '📋'
                        }
                      </div>
                      <div className="text-bg" style={{ flex: 1 }}>
                        <div className="text-bg" style={{
                          fontSize: '0.8rem',
                          color: '#8b9dc3',
                          fontWeight: 500,
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {item.type.replace('-', ' ')}
                        </div>
                        <div className="text-bg" style={{
                          fontSize: '1rem',
                          color: '#2d3748',
                          fontWeight: 600,
                          marginBottom: '2px'
                        }}>
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-bg" style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            lineHeight: 1.4
                          }}>
                            {item.description}
                          </div>
                        )}
                        {item.time && (
                          <div className="text-bg" style={{
                            fontSize: '0.75rem',
                            color: '#667eea',
                            fontWeight: 500,
                            marginTop: '4px'
                          }}>
                            📅 {item.time}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                  <h4 className="text-bg" style={{
                    color: '#6b7280',
                    fontSize: '1.125rem',
                    margin: '0 0 8px 0',
                    fontWeight: 500
                  }}>
                    No content scheduled
                  </h4>
                  <p className="text-bg" style={{
                    color: '#9ca3af',
                    margin: '0 0 20px 0',
                    fontSize: '0.875rem'
                  }}>
                    No tasks or content found for this date
                  </p>
                  {selectedDate >= getTodayDateString() && (
                    <button 
                      onClick={() => {
                        navigate(`/marketing/set-task?date=${selectedDate}`);
                        closeModal();
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                      onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                      onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                    >
                      📝 Set Task
                    </button>
                  )}
                  {selectedDate < getTodayDateString() && (
                    <div style={{
                      padding: '12px 24px',
                      background: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}>
                      ⏰ Cannot create tasks for past dates
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}