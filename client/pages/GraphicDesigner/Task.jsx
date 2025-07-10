import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import ContentCard from '../../components/common/ContentCard';
import TaskDetailsModal from '../../components/common/TaskDetailsModal';

export default function Task() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/graphic-designer/task`)
      .then(res => res.json())
      .then(data => {
        setTasks(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(err => {
        setTasks([]);
        setLoading(false);
      });

    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
    socket.on("ongoingGraphicDesignerTask", (data) => {
      setTasks(prev => [data, ...(Array.isArray(prev) ? prev : [])]);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div className="manage-accounts-page-container">
      <div className="role-section">
        <h2>Task</h2>
        {loading ? "Loading..." : (
          Array.isArray(tasks) && tasks.length === 0
            ? <div style={{ marginBottom: 20 }}>No pending content.</div>
            : Array.isArray(tasks)
              ? tasks.map(task => (
                  <ContentCard
                    key={task.id || task._id}
                    content={task}
                    showDelete={false}
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