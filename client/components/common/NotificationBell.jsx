import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase"; // Adjust path if needed
import { ref, onValue, update } from "firebase/database";
import { TbBellRinging } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import { getSocket } from '../../store/socketMiddleware';

const NotificationBell = ({ role }) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = role || user?.role || 'Admin';
    // Map MarketingLead to 'marketing' for database path
    const roleKey = userRole === 'MarketingLead' ? 'marketing' : userRole.toLowerCase().replace(/\s+/g, '');
    console.log('🔔 NotificationBell - Role:', userRole, 'RoleKey:', roleKey);
    
    const notificationsRef = ref(db, `notification/${roleKey}`);
    console.log('🔔 NotificationBell - Firebase path:', `notification/${roleKey}`);
    
    // Firebase real-time listener
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val() || {};
      console.log('🔔 NotificationBell - Firebase data received:', Object.keys(data).length, 'notifications');
      const notifList = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));
      setNotifications(notifList.reverse()); // newest first
    });

    // Use existing Socket.IO connection from socketMiddleware
    const socket = getSocket();
    
    if (socket) {
      console.log('🔔 NotificationBell - Using existing socket:', socket.id);
      
      // Listen for role-specific notifications (use full role name for event)
      const notificationEvent = userRole === 'MarketingLead' ? 'marketingNotification' : `${roleKey}Notification`;
      console.log('🔔 NotificationBell - Listening for event:', notificationEvent);
      
      const handleNotification = (data) => {
        console.log(`🔔 Received ${notificationEvent}:`, data);
      };
      
      socket.on(notificationEvent, handleNotification);
      
      // Listen to ALL events for debugging
      const handleAnyEvent = (eventName, ...args) => {
        console.log('🔔 Socket received ANY event:', eventName, args);
      };
      socket.onAny(handleAnyEvent);
      
      return () => {
        unsubscribe();
        socket.off(notificationEvent, handleNotification);
        socket.offAny(handleAnyEvent);
      };
    } else {
      console.error('🔔 NotificationBell - No socket available!');
      return () => unsubscribe();
    }
  }, [role, user?.role]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleBellClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleNotificationClick = (notif) => {
    const userRole = role || user?.role || 'Admin';
    const roleKey = userRole.toLowerCase().replace(/\s+/g, '');
    
    // Mark as read in the database
    if (!notif.read) {
      const notifRef = ref(db, `notification/${roleKey}/${notif.id}`);
      update(notifRef, { read: true });
    }
    
    // Role-specific navigation
    const roleRoutes = {
      admin: {
        approval_needed: '/admin/approval',
        user_management: '/admin/manage',
        system_alert: '/admin'
      },
      marketinglead: {
        content_approval: '/marketing/approval',
        task_assignment: '/marketing/ongoing-task',
        content_ready: '/marketing/approved'
      },
      contentcreator: {
        task_assigned: '/content/task',
        content_feedback: '/content/output',
        deadline_reminder: '/content/dashboard'
      },
      graphicdesigner: {
        design_task: '/graphic/task',
        design_feedback: '/graphic/creation',
        asset_request: '/graphic/dashboard'
      }
    };
    
    const routes = roleRoutes[roleKey];
    if (routes && routes[notif.type]) {
      navigate(routes[notif.type]);
    }
  };

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        className="notification-bell"
        onClick={handleBellClick}
        style={{
          fontSize: "28px",
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          marginRight: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "auto",
          width: "auto",
          boxShadow: "none",
          borderRadius: 0,
          padding: 0
        }}
        aria-label="Notifications"
      >
        <TbBellRinging className={unreadCount > 0 ? "bell-animate" : ""} color="#F6C544" size={28} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "40px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "320px",
            zIndex: 100,
            maxHeight: "350px",
            overflowY: "auto",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {notifications.length === 0 && (
              <li style={{ padding: "16px", textAlign: "center", color: "#888" }}>
                No notifications
              </li>
            )}
            {notifications.map((notif) => (
              <li
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  padding: "12px 16px",
                  background: notif.read ? "#f9f9f9" : "#e6f7ff",
                  borderBottom: "1px solid #eee",
                  fontSize: "15px",
                  cursor: "pointer",
                  fontWeight: notif.read ? "normal" : "bold",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div>{notif.message}</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                    {notif.timestamp
                      ? new Date(notif.timestamp).toLocaleString()
                      : ""}
                  </div>
                </div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                  {notif.read ? "Read" : <span style={{ color: "#f44336" }}>Unread</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
