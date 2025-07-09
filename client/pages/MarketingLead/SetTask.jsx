import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function SetTask() {
  const [objective, setObjective] = useState('');
  const [gender, setGender] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ageRange, setAgeRange] = useState([20, 40]);
  const [numContents, setNumContents] = useState(1);
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
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/content-creator/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || 'Failed to submit task');
        }
        return res.json();
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
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 0' }}>
      <div style={{
        maxWidth: 520,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
        padding: '36px 32px 32px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28
      }}>
        <div style={{textAlign: 'center', marginBottom: 8}}>
          <span style={{
            display: 'inline-block',
            background: '#e0e7ff',
            color: '#2563eb',
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 8,
            padding: '4px 18px',
            marginBottom: 8,
            letterSpacing: 0.5
          }}>Content Creator</span>
        </div>
        <h2 style={{
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: 0.5,
          color: '#f87171',
          marginBottom: 8,
          textAlign: 'center',
          textShadow: '0 1px 0 #fff'
        }}>Set Task</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Objective */}
        <div>
          <label htmlFor="objective" style={{ fontWeight: 700, display: 'block', marginBottom: 8, color: '#374151', fontSize: 16 }}>Objective</label>
          <textarea
            id="objective"
            value={objective}
            onChange={e => setObjective(e.target.value)}
            placeholder="Write here..."
            rows={3}
            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            required
          />
        </div>
        {/* Number of Contents */}
        <div>
          <label htmlFor="numContents" style={{ fontWeight: 700, display: 'block', marginBottom: 8, color: '#374151', fontSize: 16 }}>Number of Contents</label>
          <input
            type="number"
            id="numContents"
            min={1}
            value={numContents}
            onChange={e => setNumContents(Math.max(1, Number(e.target.value)))}
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', outline: 'none' }}
            required
          />
        </div>
        {/* Gender */}
        <div>
          <label style={{ fontWeight: 700, display: 'block', marginBottom: 8, color: '#374151', fontSize: 16 }}>Gender</label>
          <div style={{ display: 'flex', gap: 24, padding: '6px 0 0 2px' }}>
            <label style={{ fontWeight: 500, color: '#6b7280', fontSize: 15 }}><input type="radio" name="gender" value="Male" checked={gender === 'Male'} onChange={e => setGender(e.target.value)} required style={{ marginRight: 6 }} /> Male</label>
            <label style={{ fontWeight: 500, color: '#6b7280', fontSize: 15 }}><input type="radio" name="gender" value="Female" checked={gender === 'Female'} onChange={e => setGender(e.target.value)} style={{ marginRight: 6 }} /> Female</label>
            <label style={{ fontWeight: 500, color: '#6b7280', fontSize: 15 }}><input type="radio" name="gender" value="Other" checked={gender === 'Other'} onChange={e => setGender(e.target.value)} style={{ marginRight: 6 }} /> Other</label>
          </div>
        </div>
        {/* Age Range Slider */}
        <div>
          <label style={{ fontWeight: 700, display: 'block', marginBottom: 8, color: '#374151', fontSize: 16 }}>Age Range</label>
          <div style={{ padding: '18px 14px 12px 14px', background: '#f9fafb', borderRadius: 12, border: '1.5px solid #e5e7eb', boxShadow: '0 1px 4px 0 #f3f4f6' }}>
            <Slider
              range
              min={3}
              max={60}
              value={ageRange}
              onChange={setAgeRange}
              allowCross={false}
              trackStyle={[{ backgroundColor: '#f87171', height: 10 }]}
              handleStyle={[
                { backgroundColor: '#fff', borderColor: '#f87171', height: 28, width: 28, marginTop: -10, boxShadow: '0 2px 8px #fca5a5' },
                { backgroundColor: '#fff', borderColor: '#f87171', height: 28, width: 28, marginTop: -10, boxShadow: '0 2px 8px #fca5a5' }
              ]}
              railStyle={{ backgroundColor: '#fee2e2', height: 10 }}
              step={1}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 15, color: '#6b7280', fontWeight: 500 }}>
              <span>3</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
              <span>50</span>
              <span>60+</span>
            </div>
            <div style={{ marginTop: 12, fontWeight: 700, color: '#f87171', textAlign: 'center', fontSize: 17, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {getAgeLabels(ageRange).map(label => (
                <span key={label} style={{ background: '#fff1f2', borderRadius: 8, padding: '4px 16px', border: '1.5px solid #fca5a5', fontSize: 15, fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Deadline Date */}
        <div>
          <label htmlFor="deadline" style={{ fontWeight: 700, display: 'block', marginBottom: 8, color: '#374151', fontSize: 16 }}>Deadline Date</label>
          <input
            type="date"
            id="deadline"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', outline: 'none', width: '100%' }}
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 16, background: loading ? '#fca5a5' : '#f87171', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 0', fontWeight: 700, fontSize: '1.08rem', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 0.5, boxShadow: '0 2px 8px #fca5a5', transition: 'background 0.2s' }}>{loading ? 'Submitting...' : 'Submit'}</button>
        {error && <div style={{ color: '#ef4444', marginTop: 12, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
        {submitted && <div style={{ color: '#22c55e', marginTop: 12, fontWeight: 600, textAlign: 'center' }}>Task submitted successfully!</div>}
      </form>
      </div>
    </div>
  );
} 