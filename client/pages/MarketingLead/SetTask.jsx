import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function SetTask() {
  const [objective, setObjective] = useState('');
  const [gender, setGender] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [submitted, setSubmitted] = useState(false);
  const [ageRange, setAgeRange] = useState([20, 40]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      objectives: objective,
      gender,
      minAge: ageRange[0],
      maxAge: ageRange[1],
      deadline
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
        setSubmitted(true);
        setObjective('');
        setGender('');
        setAgeRange([20, 40]);
        setDeadline('');
      })
      .catch((err) => {
        setError(err.message || 'Submission failed');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: '0', maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
          Set Task - Content Creator
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Create and assign tasks to content creators with detailed specifications
        </p>
      </div>

      {/* Form Container */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        width: '100%'
      }}>
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
                e.target.style.borderColor = '#3b82f6';
                e.target.style.background = '#fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
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
                  border: `2px solid ${gender === option ? '#3b82f6' : '#e5e7eb'}`,
                  background: gender === option ? '#eff6ff' : '#fafbfc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '600',
                  fontSize: '15px',
                  color: gender === option ? '#3b82f6' : '#6b7280',
                  minWidth: '120px',
                  justifyContent: 'center',
                  boxShadow: gender === option ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
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
              marginBottom: '12px', 
              color: '#1f2937', 
              fontSize: '16px',
              letterSpacing: '-0.025em'
            }}>
              Target Age Range
            </label>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                minWidth: '50px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
              }}>{ageRange[0]}</div>
              <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', margin: '0 16px' }}>to</span>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                minWidth: '50px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
              }}>{ageRange[1]}</div>
            </div>
            <div style={{ 
              padding: '24px', 
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
              borderRadius: '16px', 
              border: '2px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <Slider
                range
                min={3}
                max={60}
                value={ageRange}
                onChange={setAgeRange}
                allowCross={false}
                trackStyle={[{ 
                  backgroundColor: '#3b82f6', 
                  height: 8,
                  borderRadius: 4
                }]}
                handleStyle={[
                  { 
                    backgroundColor: '#ffffff', 
                    borderColor: '#3b82f6', 
                    borderWidth: 3,
                    height: 24, 
                    width: 24, 
                    marginTop: -8,
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                  },
                  { 
                    backgroundColor: '#ffffff', 
                    borderColor: '#3b82f6', 
                    borderWidth: 3,
                    height: 24, 
                    width: 24, 
                    marginTop: -8,
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                  }
                ]}
                railStyle={{ 
                  backgroundColor: '#e5e7eb', 
                  height: 8,
                  borderRadius: 4
                }}
                step={1}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '16px', 
                fontSize: '12px', 
                color: '#6b7280', 
                fontWeight: '500' 
              }}>
                <span>3</span>
                <span>15</span>
                <span>30</span>
                <span>45</span>
                <span>60+</span>
              </div>
              <div style={{ 
                marginTop: '16px', 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                justifyContent: 'center' 
              }}>
                {getAgeLabels(ageRange).map(label => (
                  <span key={label} style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                    color: '#ffffff',
                    borderRadius: '16px', 
                    padding: '6px 16px', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}>{label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Deadline Date */}
          <div>
            <label htmlFor="deadline" style={{ 
              fontWeight: '700', 
              display: 'block', 
              marginBottom: '12px', 
              color: '#1f2937', 
              fontSize: '16px',
              letterSpacing: '-0.025em'
            }}>
              Posting Date
            </label>
            <input
              type="date"
              id="deadline"
              value={deadline}
              min={minDate}
              max={maxDate}
              onChange={e => setDeadline(e.target.value)}
              onFocus={e => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
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
                width: '240px',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
              }}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              marginTop: '24px', 
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '16px 32px', 
              fontWeight: '700', 
              fontSize: '16px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              alignSelf: 'flex-start',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)',
              letterSpacing: '-0.025em'
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            {loading ? 'Submitting Task...' : 'Submit Task'}
          </button>
          
          {error && (
            <div style={{ 
              color: '#ef4444', 
              padding: '16px 20px',
              background: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}
          
          {submitted && (
            <div style={{ 
              color: '#059669', 
              padding: '16px 20px',
              background: '#f0fdf4',
              border: '2px solid #bbf7d0',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600'
            }}>
              Task submitted successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
}