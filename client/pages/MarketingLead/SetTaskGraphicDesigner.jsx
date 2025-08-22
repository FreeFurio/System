import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function SetTaskGraphicDesigner() {
  const [objective, setObjective] = useState('');
  const [gender, setGender] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [submitted, setSubmitted] = useState(false);
  const [ageRange, setAgeRange] = useState([20, 40]);
  const [numContents, setNumContents] = useState(1);
  const [numContentsTouched, setNumContentsTouched] = useState(false);
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
      deadline,
      numContent: numContents
    };
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/graphic-designer/task`, {
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
        setNumContents(1);
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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #ffffff 0%, #fef7ed 100%)', 
      padding: '40px 20px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: 580,
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: 24,
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(251, 191, 36, 0.1)',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(251, 191, 36, 0.2)'
      }}>
        {/* Decorative gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #ef4444, #fbbf24, #ef4444, #fbbf24)',
          borderRadius: '24px 24px 0 0'
        }} />
        
        <div style={{textAlign: 'center', marginBottom: 32}}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ef4444',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 20,
            padding: '8px 20px',
            marginBottom: 16,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
          }}>
            <span style={{fontSize: '16px'}}>🎨</span>
            Graphic Designer
          </div>
          <h1 style={{
            fontWeight: 800,
            fontSize: 36,
            color: '#ef4444',
            margin: 0,
            letterSpacing: '-0.8px'
          }}>Set Task</h1>
          <p style={{
            color: '#6b7280',
            fontSize: 17,
            margin: '8px 0 0 0',
            fontWeight: 500
          }}>Create and assign design tasks with precision</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Objective */}
        <div style={{ position: 'relative' }}>
          <label htmlFor="objective" style={{ 
            fontWeight: 700, 
            display: 'block', 
            marginBottom: 12, 
            color: '#1f2937', 
            fontSize: 16,
            letterSpacing: '0.3px'
          }}>Design Objective</label>
          <textarea
            id="objective"
            value={objective}
            onChange={e => setObjective(e.target.value)}
            placeholder="Describe the design requirements and creative objectives..."
            rows={4}
            style={{ 
              width: '100%', 
              minHeight: 100, 
              maxHeight: 200, 
              padding: '16px 20px', 
              borderRadius: 16, 
              border: '2px solid #e5e7eb', 
              fontSize: 15, 
              background: '#fafbfc', 
              resize: 'none', 
              outline: 'none', 
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              lineHeight: 1.6,
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              overflowY: 'auto'
            }}
            onFocus={e => {
              e.target.style.borderColor = '#fbbf24';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            required
          />
        </div>
        {/* Number of Contents */}
        <div>
          <label htmlFor="numContents" style={{ 
            fontWeight: 700, 
            display: 'block', 
            marginBottom: 12, 
            color: '#1f2937', 
            fontSize: 16,
            letterSpacing: '0.3px'
          }}>Number of Designs</label>
          <input
            type="number"
            id="numContents"
            min={1}
            value={numContentsTouched ? numContents : 1}
            onFocus={(e) => {
              if (!numContentsTouched && numContents === 1) {
                setNumContents("");
              }
              setNumContentsTouched(true);
              e.target.style.borderColor = '#fbbf24';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            onBlur={e => {
              if (e.target.value === '' || isNaN(Number(e.target.value))) {
                setNumContents(1);
                setNumContentsTouched(false);
              }
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            onChange={e => {
              const val = e.target.value;
              if (val === '' || isNaN(Number(val))) {
                setNumContents("");
              } else {
                setNumContents(Math.max(1, Number(val)));
              }
            }}
            style={{ 
              width: '100%', 
              padding: '16px 20px', 
              borderRadius: 16, 
              border: '2px solid #e5e7eb', 
              fontSize: 15, 
              background: '#fafbfc', 
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            required
          />
        </div>
        {/* Gender */}
        <div>
          <label style={{ 
            fontWeight: 700, 
            display: 'block', 
            marginBottom: 12, 
            color: '#1f2937', 
            fontSize: 16,
            letterSpacing: '0.3px'
          }}>Target Gender</label>
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            padding: '8px 0',
            flexWrap: 'wrap'
          }}>
            {['Male', 'Female'].map(option => (
              <label key={option} style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: 12,
                border: `2px solid ${gender === option ? '#ef4444' : '#e5e7eb'}`,
                background: gender === option ? '#fef2f2' : '#fafbfc',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: 600,
                fontSize: 15,
                color: gender === option ? '#ef4444' : '#6b7280',
                minWidth: '80px',
                justifyContent: 'center',
                boxShadow: gender === option ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
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
                <span style={{fontSize: '16px', marginRight: '4px'}}>
                  {option === 'Male' ? '👨' : option === 'Female' ? '👩' : '👤'}
                </span>
                {option}
              </label>
            ))}
          </div>
        </div>
        {/* Age Range Slider */}
        <div>
          <label style={{ 
            fontWeight: 700, 
            display: 'block', 
            marginBottom: 12, 
            color: '#1f2937', 
            fontSize: 16,
            letterSpacing: '0.3px'
          }}>Target Age Range</label>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16, 
            padding: '0 4px'
          }}>
            <div style={{
              background: '#ef4444',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 600,
              minWidth: '50px',
              textAlign: 'center'
            }}>{ageRange[0]}</div>
            <span style={{ color: '#9ca3af', fontSize: 14, fontWeight: 500 }}>to</span>
            <div style={{
              background: '#ef4444',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 600,
              minWidth: '50px',
              textAlign: 'center'
            }}>{ageRange[1]}</div>
          </div>
          <div style={{ 
            padding: '24px 20px 20px 20px', 
            background: '#fefce8', 
            borderRadius: 20, 
            border: '2px solid #fde047', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
          }}>
            <Slider
              range
              min={3}
              max={60}
              value={ageRange}
              onChange={setAgeRange}
              allowCross={false}
              trackStyle={[{ 
                backgroundColor: '#fbbf24', 
                height: 8,
                borderRadius: 4
              }]}
              handleStyle={[
                { 
                  backgroundColor: '#ffffff', 
                  borderColor: '#ef4444', 
                  borderWidth: 3,
                  height: 24, 
                  width: 24, 
                  marginTop: -8, 
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                  borderRadius: '50%'
                },
                { 
                  backgroundColor: '#ffffff', 
                  borderColor: '#ef4444', 
                  borderWidth: 3,
                  height: 24, 
                  width: 24, 
                  marginTop: -8, 
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                  borderRadius: '50%'
                }
              ]}
              railStyle={{ 
                backgroundColor: '#fde047', 
                height: 8,
                borderRadius: 4,
                opacity: 0.6
              }}
              step={1}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: 16, 
              fontSize: 12, 
              color: '#a16207', 
              fontWeight: 500 
            }}>
              <span>3</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
              <span>50</span>
              <span>60+</span>
            </div>
            <div style={{ 
              marginTop: 16, 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 8, 
              justifyContent: 'center' 
            }}>
              {getAgeLabels(ageRange).map(label => (
                <span key={label} style={{ 
                  background: '#ef4444', 
                  color: '#ffffff',
                  borderRadius: 16, 
                  padding: '6px 14px', 
                  fontSize: 13, 
                  fontWeight: 600, 
                  letterSpacing: '0.3px',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                }}>{label}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Deadline Date */}
        <div>
          <label htmlFor="deadline" style={{ 
            fontWeight: 700, 
            display: 'block', 
            marginBottom: 12, 
            color: '#1f2937', 
            fontSize: 16,
            letterSpacing: '0.3px'
          }}>Posting Date</label>
          <input
            type="date"
            id="deadline"
            value={deadline}
            min={minDate}
            max={maxDate}
            onChange={e => setDeadline(e.target.value)}
            onFocus={e => {
              e.target.style.borderColor = '#fbbf24';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            style={{ 
              padding: '16px 20px', 
              borderRadius: 16, 
              border: '2px solid #e5e7eb', 
              fontSize: 15, 
              background: '#fafbfc', 
              outline: 'none', 
              width: '100%',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            marginTop: 24, 
            background: loading ? '#9ca3af' : '#ef4444', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: 16, 
            padding: '18px 32px', 
            fontWeight: 600, 
            fontSize: 17, 
            cursor: loading ? 'not-allowed' : 'pointer', 
            letterSpacing: '0.8px', 
            boxShadow: loading 
              ? '0 4px 12px rgba(156, 163, 175, 0.4)' 
              : '0 8px 25px rgba(239, 68, 68, 0.4)', 
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            textTransform: 'uppercase',
            fontFamily: 'inherit'
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 35px rgba(239, 68, 68, 0.5)';
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
            }
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #ffffff', 
                borderTop: '2px solid transparent', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }} />
              Submitting...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{fontSize: '18px'}}>🎨</span>
              Submit Task
            </span>
          )}
        </button>
        
        {error && (
          <div style={{ 
            color: '#ef4444', 
            marginTop: 16, 
            fontWeight: 500, 
            textAlign: 'center',
            padding: '12px 20px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            fontSize: 14
          }}>
            ❌ {error}
          </div>
        )}
        
        {submitted && (
          <div style={{ 
            color: '#059669', 
            marginTop: 16, 
            fontWeight: 500, 
            textAlign: 'center',
            padding: '12px 20px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            fontSize: 14
          }}>
            ✅ Task submitted successfully!
          </div>
        )}
      </form>
      </div>
    </div>
  );
} 