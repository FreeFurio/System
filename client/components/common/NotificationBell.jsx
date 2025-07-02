import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase"; // Adjust path if needed
import { ref, onValue, update } from "firebase/database";
import { FiBell } from "react-icons/fi";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const notificationsRef = ref(db, "AdminNotification");
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
    // Mark all as read when opening dropdown
    notifications.forEach((notif) => {
      if (!notif.read) {
        const notifRef = ref(db, `AdminNotification/${notif.id}`);
        update(notifRef, { read: true });
      }
    });
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
              color: "white",
              background: "red",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "12px",
              marginLeft: "4px",
              position: "absolute",
              top: 0,
              right: 0,
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
            width: "300px",
            zIndex: 100,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {notifications.length === 0 && (
              <li style={{ padding: "10px" }}>No notifications</li>
            )}
            {notifications.map((notif) => (
              <li
                key={notif.id}
                style={{
                  padding: "10px",
                  background: notif.read ? "#f9f9f9" : "#e6f7ff",
                  borderBottom: "1px solid #eee",
                }}
              >
                {notif.message}
                <br />
                <span style={{ fontSize: "10px", color: "#888" }}>
                  {notif.timestamp
                    ? new Date(notif.timestamp).toLocaleString()
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
