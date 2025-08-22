import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut, FiHome, FiEdit, FiClipboard, FiMenu } from 'react-icons/fi';
import NotificationBell from '../../components/common/NotificationBell';
import { useUser } from '../../components/common/UserContext';
import '../../styles/Admin.css';

const sidebarItems = [
  { label: 'Dashboard', path: '/content/dashboard', icon: <span className="sidebar-icon-wrapper"><FiHome size={22} color="#F6C544" /></span> },
  { label: 'Create Content', path: '/content/create', icon: <span className="sidebar-icon-wrapper"><FiEdit size={22} color="#F6C544" /></span> },
  { label: 'Task', path: '/content/task', icon: <span className="sidebar-icon-wrapper"><FiClipboard size={22} color="#F6C544" /></span> },
];

export default function ContentCreatorLayout() {
  const { user, setUser } = useUser();
  const creatorName = user?.name || "Content Creator";
  const creatorRole = user?.role || "role";
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
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
          <NotificationBell role="ContentCreator" style={{ marginRight: '20px' }} />
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
                  <div style={{ fontWeight: 700, color: '#222', fontSize: 16 }}>{creatorName}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{creatorRole.charAt(0).toUpperCase() + creatorRole.slice(1)}</div>
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
          <div className="sidebar" style={{ width: '240px', minWidth: '220px', background: '#f8f9fb', borderRight: '1px solid #ececec', padding: '32px 0 24px 0', borderRadius: 0, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'stretch', margin: 0, overflow: 'hidden', minHeight: 0 }}>
          {/* User Profile */}
          <div className="user-profile-divider-wrapper" style={{ position: 'relative', marginBottom: 24, minHeight: 0 }}>
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 12px', background: '#f8f9fb', borderRadius: 0, boxShadow: 'none' }}>
              <span className="header-profile-avatar" style={{ width: 48, height: 48, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#F6C544', fontWeight: 700 }}>
                <FiUser size={28} color="#F6C544" />
              </span>
              <div className="user-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                <div className="user-name" style={{ fontWeight: 700, fontSize: 17, color: '#222', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{creatorName}</div>
                <div className="user-role" style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{creatorRole.charAt(0).toUpperCase() + creatorRole.slice(1)}</div>
              </div>
            </div>
            {/* Removed wide HR */}
          </div>
          {/* Removed extra HR at top */}
          <nav className="navigation" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, minHeight: 0 }}>
            {sidebarItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
                style={{ padding: '12px 24px', fontWeight: 600, borderRadius: 8, color: location.pathname === item.path ? '#fff' : '#222', background: location.pathname === item.path ? '#e53935' : 'none', marginBottom: 4, textDecoration: 'none', transition: 'background 0.2s, color 0.2s', display: 'flex', alignItems: 'center' }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          </div>
        )}
        <div className="main-content" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 0, margin: 0, boxShadow: 'none', padding: 0, minHeight: 0 }}>
          <div
            className="content-area"
            style={{
              flex: 1,
              padding: '24px',
              overflowY: 'auto',
              paddingTop: 24
            }}
          >
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