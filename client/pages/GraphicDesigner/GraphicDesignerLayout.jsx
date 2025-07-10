import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import NotificationBell from '../../components/common/NotificationBell';
import { useUser } from '../../components/common/UserContext';
import '../../styles/Admin.css';

const sidebarItems = [
  { label: 'Dashboard', path: '/graphic/dashboard' },
  { label: 'Graphic Creation', path: '/graphic/creation' },
  { label: 'Task', path: '/graphic/task' },
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
        <div className="sidebar" style={{ maxHeight: 'calc(100vh - 60px)', overflowY: 'auto', flexShrink: 0 }}>
          <div className="logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src="/assets/issalonlogo.jpg" alt="infinitysalon" style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} />
          </div>
          {/* User Profile */}
          <div className="user-profile-divider-wrapper" style={{ position: 'relative', marginBottom: 24 }}>
            <div className="user-profile">
              <button className="header-profile-btn" aria-label="Profile">
                <span className="header-profile-avatar">
                  <FiUser size={24} />
                </span>
              </button>
              <div className="user-info">
                <div className="user-name">{designerName}</div>
                <div className="user-role">{designerRole.charAt(0).toUpperCase() + designerRole.slice(1)}</div>
              </div>
            </div>
            <hr style={{ position: 'absolute', left: '-24px', right: '-24px', border: 'none', borderTop: '1px solid #e0e0e0', margin: 0, width: 'calc(100% + 48px)' }} />
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '0 0 24px 0', width: '100%' }} />
          <nav className="navigation">
            {sidebarItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="main-content" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: 64, background: '#fafafa', borderBottom: '1px solid #e0e0e0', padding: '0 24px', position: 'relative', flexShrink: 0 }}>
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
                <span className="header-profile-avatar">
                  <FiUser size={24} />
                </span>
              </button>
              {showProfile && (
                <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 8, minWidth: 160, zIndex: 10 }}>
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