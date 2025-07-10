import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import ContentCard from '../../components/common/ContentCard';
import TaskDetailsModal from '../../components/common/TaskDetailsModal';

export default function OngoingTask() {
  const [creatorTasks, setCreatorTasks] = useState([]);
  const [designerTasks, setDesignerTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Fetch Content Creator tasks
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/content-creator/task`)
      .then(res => res.json())
      .then(data => {
        setCreatorTasks(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(err => {
        setCreatorTasks([]);
        setLoading(false);
      });
    // Fetch Graphic Designer tasks
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/graphic-designer/task`)
      .then(res => res.json())
      .then(data => {
        setDesignerTasks(Array.isArray(data.data) ? data.data : []);
      })
      .catch(err => {
        setDesignerTasks([]);
      });

    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });

    socket.on("ongoingContentCreatorTask", (data) => {
      setCreatorTasks(prev => [data, ...(Array.isArray(prev) ? prev : [])]);
    });
    socket.on("ongoingGraphicDesignerTask", (data) => {
      setDesignerTasks(prev => [data, ...(Array.isArray(prev) ? prev : [])]);
    });

    return () => socket.disconnect();
  }, []);

  const handleDelete = (type, id) => {
    if (type === "Content Creator") {
      setCreatorTasks(prev => (Array.isArray(prev) ? prev.filter(task => (task.id || task._id) !== id) : []));
    } else if (type === "Graphic Designer") {
      setDesignerTasks(prev => (Array.isArray(prev) ? prev.filter(task => (task.id || task._id) !== id) : []));
    }
    // TODO: Add API call to delete content from backend
  };

  return (
    <div className="manage-accounts-page-container">
      <div className="role-section">
        <h2>Content Creator</h2>
        {loading ? "Loading..." : (
          Array.isArray(creatorTasks) && creatorTasks.length === 0
            ? <div style={{ marginBottom: 20 }}>No pending content.</div>
            : Array.isArray(creatorTasks)
              ? creatorTasks.map(task => (
                  <ContentCard
                    key={task.id || task._id}
                    content={task}
                    onDelete={() => handleDelete("Content Creator", task.id || task._id)}
                    onClick={() => setSelectedTask(task)}
                  />
                ))
              : <div style={{ color: 'red' }}>Error: Tasks data is not an array.</div>
        )}
      </div>
      <div className="role-section">
        <h2>Graphic Designer</h2>
        {loading ? "Loading..." : (
          Array.isArray(designerTasks) && designerTasks.length === 0
            ? <div style={{ marginBottom: 20 }}>No pending content.</div>
            : Array.isArray(designerTasks)
              ? designerTasks.map(task => (
                  <ContentCard
                    key={task.id || task._id}
                    content={task}
                    onDelete={() => handleDelete("Graphic Designer", task.id || task._id)}
                    onClick={() => setSelectedTask(task)}
                  />
                ))
              : <div style={{ color: 'red' }}>Error: Tasks data is not an array.</div>
        )}
      </div>
      <TaskDetailsModal task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
} 