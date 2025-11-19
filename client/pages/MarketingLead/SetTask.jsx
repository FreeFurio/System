import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { componentStyles } from '../../styles/designSystem';
import PlatformSelector from '../../components/common/PlatformSelector';
import { FiSend } from 'react-icons/fi';
export default function SetTask() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [objective, setObjective] = useState('');
  const [gender, setGender] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const dateFromUrl = searchParams.get('date');
    if (dateFromUrl) {
      return dateFromUrl;
    }
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [submitted, setSubmitted] = useState(false);
  const [ageRange, setAgeRange] = useState([20, 40]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskSubmitted, setTaskSubmitted] = useState(false);

  useEffect(() => {
    const dateFromUrl = searchParams.get('date');
    if (dateFromUrl) {
      setDeadline(dateFromUrl);
    }
  }, [searchParams]);

  // Age groups definition
  const ageGroups = [
    { min: 3, max: 6, label: 'Toddlers' },
    { min: 7, max: 12, label: 'Kids' },
    { min: 13, max: 19, label: 'Teens' },
    { min: 20, max: 35, label: 'Adult' },
    { min: 36, max: 100, label: 'Oldies' },
  ];

  // Get all labels that overlap with the selected range
  const getAgeLabels = ([min, max]) => {
    return ageGroups
      .filter(group => group.max >= min && group.min <= max)
      .map(group => group.label);
  };

  // For deadline date limits
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDate = `${yyyy}-${mm}-${dd}`;
  const maxDate = `${yyyy + 3}-${mm}-${dd}`;

  const handlePlatformChange = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one social media platform');
      setLoading(false);
      return;
    }
    
    const payload = {
      objectives: objective,
      gender,
      minAge: ageRange[0],
      maxAge: ageRange[1],
      deadline: `${deadline}T${deadlineTime}:00`,
      selectedPlatforms
    };
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/content-creator/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok && data.status !== 'success') {
          const err = data.message || 'Failed to submit task';
          throw new Error(err);
        }
        return data;
      })
      .then(() => {
        setTaskSubmitted(true);
        
        // Redirect to Workflow Board after successful submission
        setTimeout(() => {
          navigate('/marketing/workflow-board');
        }, 2500);
      })
      .catch((err) => {
        setError(err.message || 'Submission failed');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: '0', maxWidth: '100%' }}>
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
        }}>Set Task - Content Writer</h1>
        <p style={{
          margin: '8px 0 0 0',
          color: '#6b7280',
          fontSize: '16px',
          fontWeight: '400'
        }}>Create and assign tasks to content writers with detailed specifications</p>
      </div>

      {/* Form Container */}
      <div style={{
        background: taskSubmitted ? '#f0fdf4' : '#fff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: taskSubmitted ? '2px solid #10b981' : '1px solid #e5e7eb',
        width: '100%',
        minHeight: '1138px',
        transition: 'all 0.3s ease'
      }}>
        {taskSubmitted ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            minHeight: '1130px'
          }}>
            <div style={{
              fontSize: '64px',
              color: '#10b981',
              marginBottom: '20px'
            }}>✓</div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#10b981',
              margin: '0 0 16px 0'
            }}>Task Submitted Successfully!</h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              margin: 0
            }}>Redirecting to ongoing tasks...</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Objective */}
          <div>
            <label htmlFor="objective" style={{ 
              fontWeight: '700', 
              display: 'block', 
              marginBottom: '12px', 
              color: '#1f2937', 
              fontSize: '16px',
              letterSpacing: '-0.025em'
            }}>
              Task Objective
            </label>
            <textarea
              id="objective"
              value={objective}
              onChange={e => setObjective(e.target.value)}
              placeholder="Describe the task objectives and requirements in detail..."
              rows={4}
              style={{ 
                width: '100%', 
                height: '120px',
                padding: '16px 20px', 
                borderRadius: '12px', 
                border: '2px solid #e5e7eb', 
                fontSize: '15px', 
                background: '#fafbfc', 
                resize: 'none', 
                outline: 'none', 
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                transition: 'all 0.2s ease',
                overflowY: 'auto'
              }}
              onFocus={e => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.background = '#fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#fafbfc';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label style={{ 
              fontWeight: '700', 
              display: 'block', 
              marginBottom: '12px', 
              color: '#1f2937', 
              fontSize: '16px',
              letterSpacing: '-0.025em'
            }}>
              Target Gender
            </label>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {['Male', 'Female'].map(option => (
                <label key={option} style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: `2px solid ${gender === option ? '#f59e0b' : '#e5e7eb'}`,
                  background: gender === option ? '#fef3c7' : '#fafbfc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '600',
                  fontSize: '15px',
                  color: gender === option ? '#d97706' : '#6b7280',
                  minWidth: '120px',
                  justifyContent: 'center',
                  boxShadow: gender === option ? '0 0 0 3px rgba(245, 158, 11, 0.1)' : 'none'
                }}>
                  <input 
                    type="radio" 
                    name="gender" 
                    value={option} 
                    checked={gender === option} 
                    onChange={e => setGender(e.target.value)} 
                    required 
                    style={{ display: 'none' }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Age Range Slider */}
          <div>
            <label style={{ 
              fontWeight: '700', 
              display: 'block', 
              marginBottom: '16px', 
              color: '#1f2937', 
              fontSize: '16px',
              letterSpacing: '-0.025em'
            }}>
              Target Age Range
            </label>
            
            {/* Age Display */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                minWidth: '60px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>{ageRange[0]}</div>
              <span style={{ color: '#374151', fontSize: '16px', fontWeight: '600' }}>to</span>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                minWidth: '60px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>{ageRange[1]}</div>
            </div>
            
            {/* Slider Container */}
            <div style={{ 
              padding: '32px 24px', 
              background: '#ffffff', 
              borderRadius: '16px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}>
              <Slider
                range
                min={3}
                max={60}
                value={ageRange}
                onChange={setAgeRange}
                allowCross={false}
                trackStyle={[{ 
                  backgroundColor: '#f59e0b', 
                  height: 8,
                  borderRadius: 4
                }]}
                handleStyle={[
                  { 
                    backgroundColor: '#ffffff', 
                    borderColor: '#f59e0b', 
                    borderWidth: 3,
                    height: 24, 
                    width: 24, 
                    marginTop: -8,
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                    cursor: 'pointer'
                  },
                  { 
                    backgroundColor: '#ffffff', 
                    borderColor: '#f59e0b', 
                    borderWidth: 3,
                    height: 24, 
                    width: 24, 
                    marginTop: -8,
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                    cursor: 'pointer'
                  }
                ]}
                railStyle={{ 
                  backgroundColor: '#e5e7eb', 
                  height: 8,
                  borderRadius: 4
                }}
                step={1}
              />
              
              {/* Age Markers */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '20px', 
                fontSize: '14px', 
                color: '#6b7280', 
                fontWeight: '600' 
              }}>
                <span>3</span>
                <span>15</span>
                <span>30</span>
                <span>45</span>
                <span>60+</span>
              </div>
              
              {/* Age Group Labels */}
              <div style={{ 
                marginTop: '20px', 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                justifyContent: 'center'
              }}>
                {getAgeLabels(ageRange).map(label => (
                  <span key={label} style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                    color: '#ffffff',
                    borderRadius: '20px', 
                    padding: '8px 16px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)'
                  }}>{label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <label style={{ 
              fontWeight: '700', 
              display: 'block', 
              marginBottom: '12px', 
              color: '#1f2937', 
              fontSize: '16px',
              letterSpacing: '-0.025em'
            }}>
              Target Social Media Platforms
            </label>
            <div style={{
              padding: '24px',
              background: '#fafbfc',
              borderRadius: '12px',
              border: '2px solid #e5e7eb'
            }}>
              <PlatformSelector 
                selectedPlatforms={selectedPlatforms}
                onPlatformChange={handlePlatformChange}
              />
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '12px 0 0 0',
                fontWeight: '500'
              }}>
                Select platforms where content will be automatically posted
              </p>
            </div>
          </div>

          {/* Posting Date & Time */}
          <div>
            <label style={{ 
              fontWeight: '700', 
              display: 'block', 
              marginBottom: '12px', 
              color: '#1f2937', 
              fontSize: '16px',
              letterSpacing: '-0.025em'
            }}>
              Posting Date & Time
            </label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label htmlFor="deadline" style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Date
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={deadline}
                  min={minDate}
                  max={maxDate}
                  onChange={e => setDeadline(e.target.value)}
                  onFocus={e => {
                    e.target.style.borderColor = '#f59e0b';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  style={{ 
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    border: '2px solid #e5e7eb', 
                    fontSize: '15px', 
                    background: '#fafbfc', 
                    outline: 'none', 
                    width: '200px',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>
              <div>
                <label htmlFor="deadlineTime" style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Time
                </label>
                <input
                  type="time"
                  id="deadlineTime"
                  value={deadlineTime}
                  min={deadline === minDate ? (() => {
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    return `${hours}:${minutes}`;
                  })() : undefined}
                  onChange={e => setDeadlineTime(e.target.value)}
                  onFocus={e => {
                    e.target.style.borderColor = '#f59e0b';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  style={{ 
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    border: '2px solid #e5e7eb', 
                    fontSize: '15px', 
                    background: '#fafbfc', 
                    outline: 'none', 
                    width: '160px',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '8px 0 0 0',
              fontWeight: '500'
            }}>
              Content will be automatically posted at the specified date and time
            </p>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
              marginTop: '24px',
              alignSelf: 'flex-start'
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }
            }}
          >
            <FiSend size={16} />
            {loading ? 'Submitting Task...' : 'Submit Task'}
          </button>

        </form>
        )}
        
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#dc2626',
            fontSize: '14px',
            marginTop: '16px'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}