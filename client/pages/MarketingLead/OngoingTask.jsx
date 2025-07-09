import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import ContentCard from '../../components/common/ContentCard';

export default function OngoingTask() {
  const [creatorTasks, setCreatorTasks] = useState([]);
  const [designerTasks, setDesignerTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all tasks, then divide by role
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/content-creator/task`)
      .then(res => res.json())
      .then(data => {
        setCreatorTasks(data.data.filter(task => task.role === "Content Creator"));
        setDesignerTasks(data.data.filter(task => task.role === "Graphic Designer"));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch tasks:", err);
        setLoading(false);
      });

    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });

    socket.on("ongoingContentCreatorTask", (data) => {
      if (data.role === "Content Creator") {
        setCreatorTasks(prev => [data, ...prev]);
      } else if (data.role === "Graphic Designer") {
        setDesignerTasks(prev => [data, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, []);

  // Dummy delete handler (replace with API call if needed)
  const handleDelete = (role, id) => {
    if (role === "Content Creator") {
      setCreatorTasks(prev => prev.filter(task => (task.id || task._id) !== id));
    } else if (role === "Graphic Designer") {
      setDesignerTasks(prev => prev.filter(task => (task.id || task._id) !== id));
    }
    // TODO: Add API call to delete content from backend
  };

  return (
    <div className="manage-accounts-page-container">
      <div className="role-section">
        <h2>Content Creator</h2>
        {loading ? "Loading..." : (
          creatorTasks.length === 0
            ? <div style={{ marginBottom: 20 }}>No pending content.</div>
            : creatorTasks.map(task => (
                <ContentCard
                  key={task.id || task._id}
                  content={task}
                  onDelete={() => handleDelete("Content Creator", task.id || task._id)}
                />
              ))
        )}
      </div>
      <div className="role-section">
        <h2>Graphic Designer</h2>
        {loading ? "Loading..." : (
          designerTasks.length === 0
            ? <div style={{ marginBottom: 20 }}>No pending content.</div>
            : designerTasks.map(task => (
                <ContentCard
                  key={task.id || task._id}
                  content={task}
                  onDelete={() => handleDelete("Graphic Designer", task.id || task._id)}
                />
              ))
        )}
      </div>
    </div>
  );
} 