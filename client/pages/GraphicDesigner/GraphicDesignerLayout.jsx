import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import NotificationBell from '../../components/common/NotificationBell';
import { useUser } from '../../components/common/UserContext';
import '../../styles/Admin.css';

import { FiHome, FiImage, FiClipboard } from 'react-icons/fi';

const sidebarItems = [
  { label: 'Dashboard', path: '/graphic/dashboard', icon: <FiHome size={18} style={{ marginRight: 12 }} /> },
  { label: 'Graphic Creation', path: '/graphic/creation', icon: <FiImage size={18} style={{ marginRight: 12 }} /> },
  { label: 'Task', path: '/graphic/task', icon: <FiClipboard size={18} style={{ marginRight: 12 }} /> },
];

export default function GraphicDesignerLayout() {
  const { user, setUser } = useUser();
  const designerName = user?.name || "Graphic Designer";
  const designerRole = user?.role || "role";
  const [showProfile, setShowProfile] = useState(false);
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
      <div className="dashboard-container" style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
        <div className="sidebar" style={{ width: '240px', minWidth: '220px', background: '#f8f9fb', borderRight: '1px solid #ececec', padding: '32px 0 24px 0', borderRadius: 0, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'stretch', boxShadow: 'none', margin: 0, overflow: 'hidden' }}>
          {/* Logo */}
          <div className="logo" style={{ marginBottom: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src="/assets/issalonlogo.jpg" alt="infinitysalon" style={{ display: 'block', maxWidth: '60%', height: 'auto', borderRadius: '12px' }} />
          </div>
          {/* User Profile */}
          <div className="user-profile" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, padding: '14px 12px', background: '#f8f9fb', borderRadius: 0, boxShadow: 'none', width: '100%', marginBottom: 32 }}>
            <span className="header-profile-avatar" style={{ width: 48, height: 48, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#2563eb', fontWeight: 700 }}>
              <FiUser size={28} />
            </span>
            <div className="user-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
              <div className="user-name" style={{ fontWeight: 700, fontSize: 17, color: '#222', lineHeight: 1.1, maxWidth: 120, whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{designerName}</div>
              <div className="user-role" style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{designerRole.charAt(0).toUpperCase() + designerRole.slice(1)}</div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="navigation" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
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
        <div className="main-content" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 0, margin: 0, boxShadow: 'none', padding: '0 0 0 0' }}>
          {/* Header */}
          <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: 64, background: '#fff', borderBottom: '1px solid #ececec', padding: '0 32px', position: 'relative', flexShrink: 0, boxShadow: 'none', borderRadius: 0 }}>
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
                <span className="header-profile-avatar" style={{ width: 40, height: 40, borderRadius: '50%', background: '#f8f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#2563eb', fontWeight: 700 }}>
                  <FiUser size={24} />
                </span>
              </button>
              {showProfile && (
                <div style={{ position: 'absolute', right: 0, top: 44, background: '#fff', border: '1px solid #ececec', borderRadius: 10, minWidth: 160, zIndex: 10, boxShadow: 'none', padding: 0 }}>
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
          <div className="admin-dashboard-footer-links">
            <svg className="admin-dashboard-facebook-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <a href="#" className="admin-dashboard-footer-link">Terms & Condition</a>
            <a href="#" className="admin-dashboard-footer-link">Policy Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}