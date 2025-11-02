import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core';
import { FiSearch } from 'react-icons/fi';
import WorkflowModal from '../../components/WorkflowModal';
import RejectionModal from '../../components/RejectionModal';
import Toast from '../../components/common/Toast';
import '../../styles/Kanban.css';

const COLUMNS = [
  { id: 'content_creation', title: 'Content Creator Task', statuses: ['content_creation', 'content_rejected'] },
  { id: 'content_approval', title: 'Content Review', statuses: ['content_approval'] },
  { id: 'design_creation', title: 'Graphics Designer Task', statuses: ['ready_for_design_assignment', 'design_creation', 'design_rejected'] },
  { id: 'design_approval', title: 'Design Review', statuses: ['design_approval'] },
  { id: 'design_approved', title: 'Posting', statuses: ['design_approved'] }
];

const DroppableColumn = ({ column, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id }
  });
  
  return (
    <div ref={setNodeRef} style={{ minWidth: '305px', background: isOver ? '#f0f9ff' : '#f9fafb', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
};

const DraggableCard = ({ workflow, columnId, onViewDetails, onPostNow }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: workflow.id,
    data: { columnId }
  });
  
  const style = {
    marginBottom: '12px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
    cursor: isDragging ? 'grabbing' : 'grab',
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    opacity: isDragging ? 0 : 1
  };
  
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>{workflow.objectives?.substring(0, 50)}{workflow.objectives?.length > 50 ? '...' : ''}</div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Deadline: {workflow.deadline ? new Date(workflow.deadline).toLocaleDateString() : 'No deadline'}</div>
      {workflow.selectedPlatforms && workflow.selectedPlatforms.length > 0 && (<div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Platforms: {workflow.selectedPlatforms.map(p => p.name || p).join(', ')}</div>)}
      {(workflow.status === 'content_rejected' || workflow.status === 'design_rejected') && (<div style={{ marginTop: '8px', padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '11px', color: '#dc2626' }}>⚠️ Rejected</div>)}
      {columnId === 'design_approved' && (<button onClick={(e) => { e.stopPropagation(); onPostNow(workflow.id); }} style={{ marginTop: '8px', width: '100%', padding: '6px', background: '#10b981', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', color: '#fff', fontWeight: '600' }}>Post Now</button>)}
      <button onClick={(e) => { e.stopPropagation(); onViewDetails(workflow); }} style={{ marginTop: '8px', width: '100%', padding: '6px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', color: '#374151' }}>View Details</button>
    </div>
  );
};

const WorkflowBoard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [rejectionModal, setRejectionModal] = useState(null);
  const [postNowModal, setPostNowModal] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setWorkflows(data.data || []);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      setToast({ message: 'Failed to load workflows', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getWorkflowsByColumn = (columnId) => {
    const column = COLUMNS.find(col => col.id === columnId);
    if (!column) return [];
    
    return workflows.filter(wf => {
      return column.statuses.includes(wf.status);
    }).filter(wf => {
      if (!searchTerm) return true;
      return wf.objectives?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             wf.id?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const handleDragStart = (event) => {
    const id = event.active.id;
    setActiveId(id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const workflowId = active.id;
    const fromColumn = active.data.current?.columnId;
    const toColumn = over.data.current?.columnId || over.id;
    
    if (fromColumn === toColumn) return;
    
    await handleStatusChange(workflowId, fromColumn, toColumn);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const getActiveWorkflow = () => {
    if (!activeId) return null;
    return workflows.find(wf => wf.id === activeId);
  };

  const handleStatusChange = async (workflowId, fromColumn, toColumn) => {
    console.log('handleStatusChange:', { workflowId, fromColumn, toColumn });
    
    if (fromColumn === 'content_approval' && toColumn === 'design_creation') {
      await approveContent(workflowId);
      await assignDesigner(workflowId);
    } else if (fromColumn === 'content_approval' && toColumn === 'content_creation') {
      setRejectionModal({ workflowId, type: 'content' });
      return;
    } else if (fromColumn === 'design_approval' && toColumn === 'design_approved') {
      await approveDesign(workflowId);
    } else if (fromColumn === 'design_approval' && toColumn === 'design_creation') {
      setRejectionModal({ workflowId, type: 'design' });
      return;
    } else {
      console.log('No matching transition found');
    }
  };

  const approveContent = async (workflowId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/approve-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvedBy: 'Marketing Lead' })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setToast({ message: 'Content approved', type: 'success' });
        loadWorkflows();
      }
    } catch (error) {
      setToast({ message: 'Failed to approve content', type: 'error' });
    }
  };

  const rejectContent = async (workflowId, reason) => {
    console.log('rejectContent called:', { workflowId, reason });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/reject-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectedBy: 'Marketing Lead', feedback: reason })
      });
      const data = await response.json();
      console.log('rejectContent response:', data);
      if (data.status === 'success') {
        setToast({ message: 'Content rejected', type: 'success' });
        loadWorkflows();
      } else {
        setToast({ message: data.message || 'Failed to reject content', type: 'error' });
      }
    } catch (error) {
      console.error('rejectContent error:', error);
      setToast({ message: 'Failed to reject content', type: 'error' });
    }
  };

  const assignDesigner = async (workflowId, designer = 'All Graphic Designers') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/assign-to-graphic-designer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignedTo: designer })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setToast({ message: 'Designer assigned', type: 'success' });
        loadWorkflows();
      }
    } catch (error) {
      setToast({ message: 'Failed to assign designer', type: 'error' });
    }
  };

  const approveDesign = async (workflowId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/approve-design`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvedBy: 'Marketing Lead' })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setToast({ message: 'Design approved', type: 'success' });
        loadWorkflows();
      }
    } catch (error) {
      setToast({ message: 'Failed to approve design', type: 'error' });
    }
  };

  const rejectDesign = async (workflowId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/reject-design`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setToast({ message: 'Design rejected', type: 'success' });
        loadWorkflows();
      }
    } catch (error) {
      setToast({ message: 'Failed to reject design', type: 'error' });
    }
  };

  const postWorkflow = async (workflowId) => {
    setPostNowModal(workflowId);
  };

  const confirmPostNow = async () => {
    const workflowId = postNowModal;
    setPostNowModal(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/post-now`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setToast({ message: 'Content posted successfully', type: 'success' });
        loadWorkflows();
      }
    } catch (error) {
      setToast({ message: 'Failed to post content', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '24px', height: '82vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '32px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0', letterSpacing: '-0.025em' }}>Workflow Board</h1>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: '8px 0 0 0', fontWeight: '400' }}>Manage and track all workflow stages</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading workflows...</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', flex: 1, paddingBottom: '16px' }}>
            {COLUMNS.map(column => {
              const columnWorkflows = getWorkflowsByColumn(column.id);
              return (
                <DroppableColumn key={column.id} column={column}>
                  <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{column.title}</h3>
                    <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', display: 'block' }}>{columnWorkflows.length} workflows</span>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {columnWorkflows.map((workflow) => (
                      <DraggableCard 
                        key={workflow.id} 
                        workflow={workflow} 
                        columnId={column.id}
                        onViewDetails={(wf) => { setSelectedWorkflow(wf); setShowModal(true); }}
                        onPostNow={postWorkflow}
                      />
                    ))}
                  </div>
                </DroppableColumn>
              );
            })}
          </div>
          <DragOverlay>
            {activeId ? (
              <div style={{ marginBottom: '12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', cursor: 'grabbing', userSelect: 'none', WebkitUserSelect: 'none' }}>
                {(() => {
                  const workflow = getActiveWorkflow();
                  if (!workflow) return null;
                  return (
                    <>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>{workflow.objectives?.substring(0, 50)}{workflow.objectives?.length > 50 ? '...' : ''}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Deadline: {workflow.deadline ? new Date(workflow.deadline).toLocaleDateString() : 'No deadline'}</div>
                      {workflow.selectedPlatforms && workflow.selectedPlatforms.length > 0 && (<div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Platforms: {workflow.selectedPlatforms.map(p => p.name || p).join(', ')}</div>)}
                      {(workflow.status === 'content_rejected' || workflow.status === 'design_rejected') && (<div style={{ marginTop: '8px', padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '11px', color: '#dc2626' }}>⚠️ Rejected</div>)}
                      <button style={{ marginTop: '8px', width: '100%', padding: '6px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', color: '#374151' }}>View Details</button>
                    </>
                  );
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {showModal && selectedWorkflow && (<WorkflowModal workflow={selectedWorkflow} onClose={() => { setShowModal(false); setSelectedWorkflow(null); }} onRefresh={loadWorkflows} />)}
      {rejectionModal && (
        <RejectionModal
          title={rejectionModal.type === 'content' ? 'Reject Content' : 'Reject Design'}
          onClose={() => setRejectionModal(null)}
          onSubmit={(reason) => {
            if (rejectionModal.type === 'content') {
              rejectContent(rejectionModal.workflowId, reason);
            } else {
              rejectDesign(rejectionModal.workflowId, reason);
            }
          }}
        />
      )}
      {postNowModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Post Content Now?</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Are you sure you want to post this content immediately?</p>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setPostNowModal(null)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={confirmPostNow} style={{ padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#fff' }}>Post Now</button>
            </div>
          </div>
        </div>
      )}
      {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
    </div>
  );
};

export default WorkflowBoard;
