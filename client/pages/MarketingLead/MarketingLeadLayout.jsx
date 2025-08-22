import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut, FiHome, FiCalendar, FiEdit, FiImage, FiClipboard, FiClock, FiRepeat, FiCheckCircle, FiThumbsUp, FiSend, FiChevronDown, FiMenu } from 'react-icons/fi';
import NotificationBell from '../../components/common/NotificationBell';
import { useUser } from '../../components/common/UserContext';
import '../../styles/Admin.css'; // Reuse Admin styles for consistency

const sidebarItems = [
  { label: 'Dashboard', path: '/marketing/dashboard', icon: <span className="sidebar-icon-wrapper"><FiHome size={22} color="#F6C544" /></span> },
  { label: 'Content Calendar', path: '/marketing/content-calendar', icon: <span className="sidebar-icon-wrapper"><FiCalendar size={22} color="#F6C544" /></span> },
  { 
    label: 'Set Task', 
    hasDropdown: true,
    icon: <span className="sidebar-icon-wrapper"><FiEdit size={22} color="#F6C544" /></span>,
    subItems: [
      { label: 'Content Creator', path: '/marketing/set-task', icon: '💻' },
      { label: 'Graphic Designer', path: '/marketing/set-task-graphic-designer', icon: '🎨' }
    ]
  },
  { label: 'Ongoing Task', path: '/marketing/ongoing-task', icon: <span className="sidebar-icon-wrapper"><FiClipboard size={22} color="#F6C544" /></span> },
  { label: 'Approval of Contents', path: '/marketing/approval', icon: <span className="sidebar-icon-wrapper"><FiCheckCircle size={22} color="#F6C544" /></span> },
  { label: 'Approved Contents', path: '/marketing/approved', icon: <span className="sidebar-icon-wrapper"><FiThumbsUp size={22} color="#F6C544" /></span> },
  { label: 'Posted Content', path: '/marketing/posted-content', icon: <span className="sidebar-icon-wrapper"><FiSend size={22} color="#F6C544" /></span> },
];

export default function MarketingLeadLayout() {
  const { user, setUser } = useUser();
  const leadName = user?.name || "Marketing Lead";
  const leadRole = user?.role || "role";
  const [showProfile, setShowProfile] = useState(false);
  const [showSetTaskDropdown, setShowSetTaskDropdown] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const profileRef = useRef(null);
  const setTaskRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (setTaskRef.current && !setTaskRef.current.contains(event.target)) {
        setShowSetTaskDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.replace("/login");
  };

  return (
    <div className="admin-dashboard" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Full Width Header */}
      <div className="header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        height: 64, 
        background: '#fff', 
        borderBottom: '1px solid #ececec', 
        padding: '0 32px', 
        position: 'relative', 
        flexShrink: 0, 
        borderRadius: 0,
        width: '100vw',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Logo */}
          <img src="/assets/infinitylogo.png" alt="infinitysalon" style={{ height: '40px', width: 'auto' }} />
          {/* Hamburger Menu */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.target.style.background = '#f0f0f0'}
            onMouseLeave={e => e.target.style.background = 'none'}
          >
            <FiMenu size={20} color="#666" />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Notification Bell */}
          <NotificationBell role="MarketingLead" style={{ marginRight: '20px' }} />
          {/* Profile Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={profileRef}>
            <button
              className="header-profile-btn"
              aria-label="Profile"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                marginLeft: '0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '40px',
                width: '40px',
              }}
              onClick={() => setShowProfile((prev) => !prev)}
            >
              <span className="header-profile-avatar" style={{ background: '#e0e7ff', color: '#2563eb', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
                <FiUser size={24} color="#F6C544" />
              </span>
            </button>
            {showProfile && (
              <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', borderRadius: 8, minWidth: 200, zIndex: 10, padding: '12px 0' }}>
                <div style={{ padding: '0 16px 10px 16px', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: '#222', fontSize: 16 }}>{leadName}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{leadRole.charAt(0).toUpperCase() + leadRole.slice(1)}</div>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <FiSettings style={{ marginRight: 8 }} /> Settings
                </button>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}>
                  <FiLogOut style={{ marginRight: 8 }} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="dashboard-container" style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
        {!sidebarCollapsed && (
          <div className="sidebar" style={{ 
            width: '240px', 
            minWidth: '220px', 
            background: '#f8f9fb', 
            borderRight: '1px solid #ececec', 
            padding: '32px 0 24px 0', 
            borderRadius: 0, 
            fontFamily: 'Inter, Segoe UI, Arial, sans-serif', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'stretch', 
            margin: 0, 
            minHeight: 0, 
            overflowY: 'auto', 
            maxHeight: 'calc(100vh - 124px)'
          }}>

            {/* User Profile */}
            <div className="user-profile-divider-wrapper" style={{ position: 'relative', marginBottom: 24, minHeight: 0 }}>
              <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 12px', background: '#f8f9fb', borderRadius: 0, boxShadow: 'none' }}>
                <span className="header-profile-avatar" style={{ width: 48, height: 48, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#2563eb', fontWeight: 700 }}>
                  <FiUser size={28} color="#F6C544" />
                </span>
                <div className="user-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                  <div className="user-name" style={{ fontWeight: 700, fontSize: 17, color: '#222', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leadName}</div>
                  <div className="user-role" style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{leadRole.charAt(0).toUpperCase() + leadRole.slice(1)}</div>
                </div>
              </div>
            </div>
            <nav className="navigation" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, minHeight: 0 }}>
              {sidebarItems.map((item, index) => (
                <div key={item.path || index} style={{ position: 'relative' }}>
                  {item.hasDropdown ? (
                    <div ref={setTaskRef}>
                      <button
                        onClick={() => setShowSetTaskDropdown(!showSetTaskDropdown)}
                        className={`nav-item${(location.pathname === '/marketing/set-task' || location.pathname === '/marketing/set-task-graphic-designer') ? ' active' : ''}`}
                        style={{ 
                          color: (location.pathname === '/marketing/set-task' || location.pathname === '/marketing/set-task-graphic-designer') ? '#1f2937' : 'inherit',
                          justifyContent: 'space-between'
                        }}
                      >
                        {item.icon}
                        {item.label}
                        <FiChevronDown 
                          size={16} 
                          style={{ 
                            transform: showSetTaskDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            marginLeft: 'auto'
                          }} 
                        />
                      </button>
                      {showSetTaskDropdown && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: '#fff',
                          borderRadius: 8,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          border: '1px solid #e5e7eb',
                          zIndex: 10,
                          marginTop: 4
                        }}>
                          {item.subItems.map(subItem => (
                            <button
                              key={subItem.path}
                              onClick={() => {
                                navigate(subItem.path);
                                setShowSetTaskDropdown(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: location.pathname === subItem.path ? '#fef2f2' : 'transparent',
                                color: location.pathname === subItem.path ? '#ef4444' : '#1f2937',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'all 0.2s ease',
                                borderRadius: location.pathname === subItem.path ? 6 : 0
                              }}
                              onMouseEnter={e => {
                                if (location.pathname !== subItem.path) {
                                  e.target.style.background = '#f9fafb';
                                }
                              }}
                              onMouseLeave={e => {
                                if (location.pathname !== subItem.path) {
                                  e.target.style.background = 'transparent';
                                }
                              }}
                            >
                              <span style={{ fontSize: 16 }}>{subItem.icon}</span>
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
        <div className="main-content" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 0, margin: 0, boxShadow: 'none', padding: 0, minHeight: 0 }}>
          <div className="content-area" style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#fff', borderRadius: 0, margin: 0, boxShadow: 'none', minHeight: 0 }}>
            <Outlet />
          </div>
        </div>
      </div>
      <footer className="admin-dashboard-footer" style={{ flexShrink: 0 }}>
        <div className="admin-dashboard-footer-container">
          <div className="admin-dashboard-footer-left">
            <img src="/assets/issalonnails.png" alt="infinitysalon" className="admin-dashboard-footer-logo" />
          </div>
        </div>
      </footer>
    </div>
  );
} 