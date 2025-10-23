import React from 'react';
import { FiX, FiTarget, FiUser, FiCalendar } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const SEORadial = ({ score, label }) => {
  const getColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 75) return '#f59e0b';
    return '#ef4444';
  };
  
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r={radius} stroke="#e5e7eb" strokeWidth="6" fill="transparent" />
          <circle cx="40" cy="40" r={radius} stroke={getColor(score)} strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '18px', fontWeight: '700', color: getColor(score) }}>{score}</div>
      </div>
      <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{label}</div>
    </div>
  );
};

const WorkflowModal = ({ workflow, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = React.useState(null);
  
  React.useEffect(() => {
    if (workflow?.contentCreator?.content?.selectedContent) {
      const platforms = Object.keys(workflow.contentCreator.content.selectedContent);
      if (platforms.length > 0) setActiveTab(platforms[0]);
    }
  }, [workflow]);
  
  if (!workflow) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '700px', maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', borderRadius: '16px 16px 0 0' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Workflow Details</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <FiX size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>
                <FiTarget size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Objectives
              </div>
              <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>{workflow.objectives}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>Target Gender</div>
                <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>{workflow.gender || 'Not specified'}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>Age Range</div>
                <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>{workflow.minAge && workflow.maxAge ? `${workflow.minAge} - ${workflow.maxAge}` : 'Not specified'}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>
                  <FiCalendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Deadline
                </div>
                <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>{workflow.deadline ? new Date(workflow.deadline).toLocaleDateString() : 'No deadline'}</div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>
                  <FiUser size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Assigned To
                </div>
                <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>{workflow.assignedTo || workflow.graphicDesigner?.assignedTo || 'Unassigned'}</div>
              </div>
            </div>

            {workflow.selectedPlatforms && workflow.selectedPlatforms.length > 0 && (
              <div style={{ marginTop: '16px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>Target Platforms</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {workflow.selectedPlatforms.map((platform, idx) => (
                    <span key={idx} style={{ padding: '6px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', color: '#374151', fontWeight: '600' }}>
                      {platform.name || platform}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {workflow.contentCreator?.content && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>Submitted Content</h3>
              {workflow.contentCreator.content.selectedContent ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                    {Object.keys(workflow.contentCreator.content.selectedContent).map((platform) => {
                      const getPlatformIcon = (p) => {
                        if (p === 'facebook') return <FaFacebook size={16} color="#1877f2" />;
                        if (p === 'instagram') return <FaInstagram size={16} color="#e4405f" />;
                        if (p === 'twitter') return <FaTwitter size={16} color="#1da1f2" />;
                        return null;
                      };
                      const getPlatformName = (p) => {
                        if (p === 'facebook') return 'Facebook';
                        if (p === 'instagram') return 'Instagram';
                        if (p === 'twitter') return 'Twitter';
                        return p;
                      };
                      return (
                        <button
                          key={platform}
                          onClick={() => setActiveTab(platform)}
                          style={{
                            padding: '12px 24px',
                            background: '#ffffff',
                            color: activeTab === platform ? '#1f2937' : '#6b7280',
                            border: activeTab === platform ? '2px solid #fdba74' : '1px solid #e5e7eb',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {getPlatformIcon(platform)} {getPlatformName(platform)}
                        </button>
                      );
                    })}
                  </div>
                  {activeTab && workflow.contentCreator.content.selectedContent[activeTab] && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', alignItems: 'start' }}>
                        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f8fafc', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>📰 Headline</div>
                          <div style={{ fontSize: '16px', color: '#1f2937', lineHeight: 1.4 }}>{workflow.contentCreator.content.selectedContent[activeTab].headline}</div>
                        </div>
                        <div style={{ padding: '0', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px' }}>
                          <SEORadial score={workflow.contentCreator.content.seoAnalysis?.[activeTab]?.headlineScore || 0} label="Headline" />
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', alignItems: 'start' }}>
                        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f8fafc', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>📝 Caption</div>
                          <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{workflow.contentCreator.content.selectedContent[activeTab].caption}</div>
                        </div>
                        <div style={{ padding: '0', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px' }}>
                          <SEORadial score={workflow.contentCreator.content.seoAnalysis?.[activeTab]?.captionScore || 0} label="Content" />
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', alignItems: 'start' }}>
                        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f8fafc', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>🏷️ Hashtags</div>
                          <div style={{ fontSize: '15px', color: '#3b82f6', fontWeight: 600 }}>{workflow.contentCreator.content.selectedContent[activeTab].hashtag}</div>
                        </div>
                        <div style={{ padding: '0', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px' }}>
                          <SEORadial score={workflow.contentCreator.content.seoAnalysis?.[activeTab]?.overallScore || 0} label="Overall" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Headline:</div>
                    <div style={{ fontSize: '14px', color: '#1f2937' }}>{workflow.contentCreator.content.headline}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Caption:</div>
                    <div style={{ fontSize: '14px', color: '#1f2937' }}>{workflow.contentCreator.content.caption}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Hashtags:</div>
                    <div style={{ fontSize: '14px', color: '#1f2937' }}>{workflow.contentCreator.content.hashtag}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {workflow.graphicDesigner?.designUrl && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>Design</h3>
              <img src={workflow.graphicDesigner.designUrl} alt="Design" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
            </div>
          )}
        </div>

        <div style={{ padding: '20px 24px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: '0 0 16px 16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowModal;
