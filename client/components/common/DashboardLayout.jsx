import React, { useState, useRef, useEffect } from "react";
import { FiBell, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useUser } from './UserContext';
import "../../styles/Admin.css";
import { Link, useLocation, Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  const { user } = useUser();
  const adminName = user?.name || "Admin";
  const adminRole = user?.role || "role";
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="admin-dashboard" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="dashboard-container" style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
        <div className="sidebar">
          {/* Logo */}
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
                <div className="user-name">{adminName}</div>
                <div className="user-role">{adminRole}</div>
              </div>
            </div>
            <hr style={{ position: 'absolute', left: '-24px', right: '-24px', border: 'none', borderTop: '1px solid #e0e0e0', margin: 0, width: 'calc(100% + 48px)' }} />
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '0 0 24px 0', width: '100%' }} />
          {/* Navigation - can be customized per role in the future */}
          <nav className="navigation">
            <Link to="/admin" className={`nav-item${location.pathname === '/admin' ? ' active' : ''}`}>Dashboard</Link>
            <Link to="/admin/approval" className={`nav-item${location.pathname === '/admin/approval' ? ' active' : ''}`}>Approval of Accounts</Link>
            <Link to="/admin/manage" className={`nav-item${location.pathname === '/admin/manage' ? ' active' : ''}`}>Manage Accounts</Link>
            <Link to="/admin/socials" className={`nav-item${location.pathname === '/admin/socials' ? ' active' : ''}`}>Socials & Insights</Link>
          </nav>
        </div>
        <div className="main-content" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: 64, background: '#fafafa', borderBottom: '1px solid #e0e0e0', padding: '0 24px', position: 'relative', flexShrink: 0 }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className="notification-bell"
                aria-label="Notifications"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginRight: 16 }}
                onClick={() => setShowNotif((prev) => !prev)}
              >
                <FiBell size={24} />
              </button>
              {showNotif && (
                <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 8, minWidth: 220, zIndex: 10, padding: 16 }}>
                  <div style={{ color: '#888', textAlign: 'center', fontSize: 14 }}>No notification</div>
                </div>
              )}
            </div>
            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                className="header-profile-btn"
                aria-label="Profile"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
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
                  <button style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}>
                    <FiLogOut style={{ marginRight: 8 }} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Children content for each role/page */}
          <div className="content-area" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <Outlet />
          </div>
        </div>
      </div>
      {/* Admin Footer (self-contained, always at bottom) */}
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
};

export default DashboardLayout; 