import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut, FiMenu } from 'react-icons/fi';
import NotificationBell from '../../components/common/NotificationBell';
import { useUser } from '../../components/common/UserContext';
import GraphicDesignerSettings from './GraphicDesignerSettings';
import '../../styles/Admin.css';

import { FiHome, FiImage, FiClipboard } from 'react-icons/fi';

const sidebarItems = [
  { label: 'Dashboard', path: '/graphic/dashboard', icon: <span className="sidebar-icon-wrapper"><FiHome size={22} color="#F6C544" /></span> },
  { label: 'Graphic Creation', path: '/graphic/creation', icon: <span className="sidebar-icon-wrapper"><FiImage size={22} color="#F6C544" /></span> },
  { label: 'Task', path: '/graphic/task', icon: <span className="sidebar-icon-wrapper"><FiClipboard size={22} color="#F6C544" /></span> },
];

export default function GraphicDesignerLayout() {
  const { user, setUser } = useUser();
  const designerName = `${user?.firstName || 'Graphic'} ${user?.lastName || 'Designer'}`;
  const designerRole = user?.role || "role";
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
          <NotificationBell role="GraphicDesigner" style={{ marginRight: '20px' }} />
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
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  style={{ 
                    width: 40, height: 40, borderRadius: '50%', 
                    objectFit: 'cover', flexShrink: 0
                  }} 
                />
              ) : (
                <span style={{ 
                  width: 40, height: 40, borderRadius: '50%', 
                  background: '#e74c3c',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  flexShrink: 0
                }}>
                  <FiUser size={24} color="#fff" />
                </span>
              )}
            </button>
            {showProfile && (
              <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', borderRadius: 8, minWidth: 200, zIndex: 10, padding: '12px 0' }}>
                <div style={{ padding: '0 16px 10px 16px', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: '#222', fontSize: 16 }}>{user?.firstName || 'Graphic'} {user?.lastName || 'Designer'}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{designerRole.charAt(0).toUpperCase() + designerRole.slice(1)}</div>
                </div>
                <button 
                  onClick={() => {
                    setShowSettings(true);
                    setShowProfile(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
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
          <div className="sidebar" style={{ width: '240px', minWidth: '220px', background: '#ffffff', borderRight: '1px solid #ececec', padding: '32px 0 24px 0', borderRadius: 0, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'stretch', boxShadow: 'none', margin: 0, overflow: 'hidden' }}>
          {/* User Profile */}
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 16px', background: '#f8fafc', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', margin: '0 12px 32px 12px' }}>
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                style={{ 
                  width: 48, height: 48, borderRadius: '50%', 
                  objectFit: 'cover', flexShrink: 0
                }} 
              />
            ) : (
              <span style={{ 
                width: 48, height: 48, borderRadius: '50%', 
                background: '#e74c3c',
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                flexShrink: 0
              }}>
                <FiUser size={28} color="#fff" />
              </span>
            )}
            <div className="user-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
              <div className="user-name" style={{ fontWeight: 700, fontSize: 17, color: '#222', lineHeight: '1.2', whiteSpace: 'normal', maxHeight: '2.4em', overflow: 'hidden' }}>{user?.firstName || 'Graphic'} {user?.lastName || 'Designer'}</div>
              <div className="user-role" style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{designerRole.charAt(0).toUpperCase() + designerRole.slice(1)}</div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="navigation" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, padding: '0 12px' }}>
            {sidebarItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
                style={{ padding: '14px 20px', fontWeight: 600, borderRadius: 12, color: location.pathname === item.path ? '#fff' : '#374151', background: location.pathname === item.path ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent', marginBottom: 6, textDecoration: 'none', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', boxShadow: location.pathname === item.path ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none', fontSize: 15 }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          </div>
        )}
        <div className="main-content" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 0, margin: 0, boxShadow: 'none', padding: '0 0 0 0' }}>
          <div className="content-area" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
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
      
      <GraphicDesignerSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}