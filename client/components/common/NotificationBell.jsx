import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase"; // Adjust path if needed
import { ref, onValue, update } from "firebase/database";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const notificationsRef = ref(db, "notification/admin");
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val() || {};
      // Convert object to array and add the id
      const notifList = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));
      setNotifications(notifList.reverse()); // newest first
    });

    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleBellClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleNotificationClick = (notif) => {
    // Mark as read in the database
    if (!notif.read) {
      const notifRef = ref(db, `notification/admin/${notif.id}`);
      update(notifRef, { read: true });
    }
    // Navigate if type is approval_needed
    if (notif.type === "approval_needed") {
      navigate("/admin/approval");
    }
    // You can add more types and navigation logic here if needed
  };

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        onClick={handleBellClick}
        style={{
          fontSize: "24px",
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          marginRight: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "40px",
          width: "40px",
        }}
        aria-label="Notifications"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "12px",
              fontWeight: "bold",
              minWidth: "18px",
              textAlign: "center",
              lineHeight: "16px",
            }}
          >
            {unreadCount}
          </span>
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
