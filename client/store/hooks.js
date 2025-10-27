import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();

export const useWorkflows = () => {
  const items = useSelector((state) => state.workflows.items);
  const loading = useSelector((state) => state.workflows.loading);
  const error = useSelector((state) => state.workflows.error);
  return { items, loading, error };
};

export const useNotifications = () => {
  const notifications = useSelector((state) => state.notifications.items);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  return { notifications, unreadCount };
};

export const useSocket = () => {
  const connected = useSelector((state) => state.socket.connected);
  const socketId = useSelector((state) => state.socket.socketId);
  return { connected, socketId };
};

export const useContent = () => {
  const generatedContents = useSelector((state) => state.content.generatedContents);
  const selectedContent = useSelector((state) => state.content.selectedContent);
  const selectedIds = useSelector((state) => state.content.selectedIds);
  const availablePlatforms = useSelector((state) => state.content.availablePlatforms);
  const taskId = useSelector((state) => state.content.taskId);
  const workflowId = useSelector((state) => state.content.workflowId);
  const fromDraftEdit = useSelector((state) => state.content.fromDraftEdit);
  
  return {
    generatedContents,
    selectedContent,
    selectedIds,
    availablePlatforms,
    taskId,
    workflowId,
    fromDraftEdit
  };
};

export const useDesign = () => {
  const taskId = useSelector((state) => state.design.taskId);
  const workflow = useSelector((state) => state.design.workflow);
  const canvasData = useSelector((state) => state.design.canvasData);
  const selectedEditor = useSelector((state) => state.design.selectedEditor);
  const designUrl = useSelector((state) => state.design.designUrl);
  
  return {
    taskId,
    workflow,
    canvasData,
    selectedEditor,
    designUrl
  };
};
