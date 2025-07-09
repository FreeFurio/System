import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import ContentCard from '../../components/common/ContentCard';

export default function OngoingTask() {
  const [creatorTasks, setCreatorTasks] = useState([]);
  const [designerTasks, setDesignerTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch Content Creator tasks
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/content-creator/task`)
      .then(res => res.json())
      .then(data => {
        setCreatorTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch content creator tasks:", err);
        setLoading(false);
      });
    // Fetch Graphic Designer tasks
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/graphic-designer/task`)
      .then(res => res.json())
      .then(data => {
        setDesignerTasks(data);
      })
      .catch(err => {
        console.error("Failed to fetch graphic designer tasks:", err);
      });

    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });

    socket.on("ongoingContentCreatorTask", (data) => {
      setCreatorTasks(prev => [data, ...prev]);
    });
    socket.on("ongoingGraphicDesignerTask", (data) => {
      setDesignerTasks(prev => [data, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  const handleDelete = (type, id) => {
    if (type === "Content Creator") {
      setCreatorTasks(prev => prev.filter(task => (task.id || task._id) !== id));
    } else if (type === "Graphic Designer") {
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