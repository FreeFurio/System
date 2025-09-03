import React, { useState } from 'react';
import './ContentCalendar.css';

export default function ContentCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Sample data - replace with actual data from backend later
  const [calendarData, setCalendarData] = useState({
    '2024-01-15': [
      { id: 1, type: 'ongoing', title: 'Blog post creation', status: 'in-progress' },
      { id: 2, type: 'approval', title: 'Instagram story', status: 'pending' }
    ],
    '2024-01-16': [
      { id: 3, type: 'approved', title: 'Facebook campaign', status: 'ready' },
      { id: 4, type: 'scheduled', title: 'Product launch post', time: '10:00 AM' }
    ],
    '2024-01-17': [
      { id: 5, type: 'rejected', title: 'Twitter post', status: 'needs-revision' }
    ]
  });

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
        title={item.title}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 
            item.type === 'ongoing' ? '#3b82f6' :
            item.type === 'approval' ? '#f59e0b' :
            item.type === 'approved' ? '#10b981' :
            item.type === 'rejected' ? '#ef4444' :
            item.type === 'scheduled' ? '#8b5cf6' : '#6b7280'
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
            e.target.style.background = hasContent ? '#dbeafe' : '#f8fafc';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
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
                    <div className="item-status">{item.status}</div>
                  </div>
                ))
              ) : (
                <div className="no-content">
                  <p>No content scheduled for this date.</p>
                  <button className="add-content-btn">Set Task</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}