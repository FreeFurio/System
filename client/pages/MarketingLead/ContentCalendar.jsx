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
    return items.map(item => (
      <span 
        key={item.id} 
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 
            item.type === 'ongoing' ? '#ffc107' :
            item.type === 'approval' ? '#007bff' :
            item.type === 'approved' ? '#28a745' :
            item.type === 'rejected' ? '#dc3545' :
            item.type === 'scheduled' ? '#6f42c1' : '#6b7280'
        }}
      ></span>
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
      
      days.push(
        <div 
          key={day} 
          style={{
            minHeight: '120px',
            padding: '8px',
            background: hasContent ? '#f0f9ff' : '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onClick={() => handleDateClick(day)}
          onMouseEnter={(e) => {
            if (hasContent) {
              const rect = e.target.getBoundingClientRect();
              setHoverPosition({ x: rect.left + rect.width / 2, y: rect.top });
              setHoveredDate(dateKey);
            }
            e.target.style.background = hasContent ? '#dbeafe' : '#f8fafc';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            setHoveredDate(null);
            e.target.style.background = hasContent ? '#f0f9ff' : '#fff';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>{day}</span>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            marginTop: '4px'
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
        <div className="modal-overlay" onClick={closeModal}>
          <div className="date-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Content for {selectedDate}</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-content">
              {getSelectedDateItems().length > 0 ? (
                getSelectedDateItems().map(item => (
                  <div key={item.id} className={`content-item ${item.type}`}>
                    <div className="item-header">
                      <span className={`status-badge ${item.type}`}>
                        {item.type.replace('-', ' ').toUpperCase()}
                      </span>
                      {item.time && <span className="time">{item.time}</span>}
                    </div>
                    <div className="item-title">{item.title}</div>
                    {item.description && (
                      <div className="item-description" style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>{item.description}</div>
                    )}
                    <div className="item-status" style={{ textTransform: 'capitalize' }}>
                      {item.status.replace('_', ' ').replace('-', ' ')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-content">
                  <p>No content scheduled for this date.</p>
                  <button 
                    className="add-content-btn"
                    onClick={() => {
                      navigate(`/marketing/set-task?date=${selectedDate}`);
                      closeModal();
                    }}
                  >
                    Set Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}