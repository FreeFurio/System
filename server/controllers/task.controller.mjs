// ========================
// 1) IMPORTS & INITIALIZATION
// ========================

import FirebaseService from '../services/firebase.service.mjs';
import { AppError } from '../utils/errorHandler.mjs';
import { io } from '../server.mjs';

// ========================
// 2) CONTROLLER FUNCTIONS
// ========================

// ========================
// 2.1) CREATING  TASK
// ========================

const createWorkflow = async (req, res, next) => {
    console.log('🔄 createWorkflow called with body:', req.body);
    try {
        const { objectives, gender, minAge, maxAge, deadline, numContent } = req.body;
        const workflowData = { objectives, gender, minAge, maxAge, deadline, numContent };
        
        if (!objectives || !gender || !minAge || !maxAge || !deadline) {
            return next(new AppError('All fields are required', 400));
        }
        
        const workflowId = await FirebaseService.createWorkflow(workflowData);
        
        io.emit('newWorkflow', {
            id: workflowId,
            ...workflowData,
            status: 'content_creation',
            currentStage: 'contentcreator'
        });

        res.status(200).json({
            status: 'success',
            message: 'Workflow created successfully',
            data: { id: workflowId, ...workflowData }
        });
    } catch (error) {
        console.error('❌ createWorkflow - Error:', error);
        next(error);
    }
}

const setTaskGraphicDesigner = async (req, res, next) => {
    console.log('🎨 setTaskGraphicDesigner called with body:', req.body);
    try {
        const { objectives, gender, minAge, maxAge, deadline, numContent } = req.body;
        const task = { objectives, gender, minAge, maxAge, deadline, numContent };
        console.log('🎨 setTaskGraphicDesigner task object:', task);
        
        if (!objectives || !gender || !minAge || !maxAge || !deadline || !numContent) {
            console.log('❌ setTaskGraphicDesigner - Missing required fields');
            return next(new AppError('All fields are required', 400));
        }
        console.log('✅ setTaskGraphicDesigner - All required fields present');
        
        console.log('🎨 setTaskGraphicDesigner - Saving task to Firebase');
        const taskID = await FirebaseService.setTaskGraphicDesigner(task);
        console.log('✅ setTaskGraphicDesigner - Task saved with ID:', taskID);
        
        console.log('🎨 setTaskGraphicDesigner - Emitting Socket.IO event');
        io.emit('ongoingGraphicDesignerTask', {
            id: taskID,
            ...task
        });
        console.log('✅ setTaskGraphicDesigner - Socket.IO event emitted');

        console.log('🎉 setTaskGraphicDesigner - Task creation completed successfully');
        res.status(200).json({
            status: 'success',
            message: 'Graphic Designer task created successfully',
            data: {
                objectives,
                gender,
                minAge,
                maxAge,
                deadline,
                numContent
            }
        });
    } catch (error) {
        console.error('❌ setTaskGraphicDesigner - Error occurred:', error);
        next(error);
    }
}

// ========================
// 2.2) GET  TASK
// ========================

const getWorkflowsByStage = async (req, res, next) => {
    console.log('📋 getWorkflowsByStage called');
    try {
        const { stage } = req.params;
        const workflows = await FirebaseService.getWorkflowsByStage(stage);
        
        res.status(200).json({
            status: 'success',
            data: workflows
        });
    } catch (error) {
        console.error('❌ getWorkflowsByStage - Error:', error);
        next(error);
    }
}

const getTaskGraphicDesigner = async (req, res, next) => {
    console.log('🎨 getTaskGraphicDesigner called');
    try {
        console.log('🎨 getTaskGraphicDesigner - Fetching tasks from Firebase');
        const taskObj = await FirebaseService.getTaskGraphicDesigner();
        
        const task = taskObj
            ? Object.entries(taskObj).map(([key, value]) => ({ id: key, ...value }))
            : [];
        console.log('🎨 getTaskGraphicDesigner - Tasks processed:', task.length, 'tasks found');
        
        console.log('✅ getTaskGraphicDesigner - Tasks retrieved successfully');
        res.status(200).json({
            status: 'success',
            data: task
        })
    } catch (error) {
        console.error('❌ getTaskGraphicDesigner - Error occurred:', error);
        next(error);
    }
}

// ========================
// 3) EXPORTS
// ========================

const submitContent = async (req, res, next) => {
    console.log('📤 submitContent called with body:', req.body);
    try {
        const { workflowId } = req.params;
        const { headline, caption, hashtag } = req.body;
        
        if (!headline || !caption || !hashtag) {
            return next(new AppError('Headline, caption, and hashtag are required', 400));
        }
        
        const contentData = { headline, caption, hashtag };
        const updatedWorkflow = await FirebaseService.submitContent(workflowId, contentData);
        
        io.emit('workflowUpdated', updatedWorkflow);
        
        res.status(200).json({
            status: 'success',
            message: 'Content submitted for approval',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ submitContent - Error:', error);
        next(error);
    }
};

const approveContent = async (req, res, next) => {
    console.log('✅ approveContent called with params:', req.params);
    try {
        const { workflowId } = req.params;
        const { approvedBy } = req.body;
        
        const updatedWorkflow = await FirebaseService.approveContent(workflowId, approvedBy);
        
        io.emit('workflowUpdated', updatedWorkflow);
        
        res.status(200).json({
            status: 'success',
            message: 'Content approved successfully',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ approveContent - Error:', error);
        next(error);
    }
};

const updateWorkflow = async (req, res, next) => {
    console.log('✏️ updateWorkflow called with params:', req.params, 'body:', req.body);
    try {
        const { workflowId } = req.params;
        const updateData = req.body;
        
        const updatedWorkflow = await FirebaseService.updateWorkflow(workflowId, updateData);
        
        io.emit('workflowUpdated', updatedWorkflow);
        
        res.status(200).json({
            status: 'success',
            message: 'Workflow updated successfully',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ updateWorkflow - Error:', error);
        next(error);
    }
};

const deleteWorkflow = async (req, res, next) => {
    console.log('🗑️ deleteWorkflow called with params:', req.params);
    try {
        const { workflowId } = req.params;
        
        await FirebaseService.deleteWorkflow(workflowId);
        
        io.emit('workflowDeleted', { workflowId });
        
        res.status(200).json({
            status: 'success',
            message: 'Workflow deleted successfully'
        });
    } catch (error) {
        console.error('❌ deleteWorkflow - Error:', error);
        next(error);
    }
};

const submitDesign = async (req, res, next) => {
    console.log('🎨 submitDesign called with body:', req.body);
    try {
        const { workflowId } = req.params;
        const designData = req.body;
        
        const updatedWorkflow = await FirebaseService.submitDesign(workflowId, designData);
        
        io.emit('workflowUpdated', updatedWorkflow);
        
        res.status(200).json({
            status: 'success',
            message: 'Design submitted for approval',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ submitDesign - Error:', error);
        next(error);
    }
};

const approveDesign = async (req, res, next) => {
    console.log('✅ approveDesign called with params:', req.params);
    try {
        const { workflowId } = req.params;
        const { approvedBy } = req.body;
        
        const updatedWorkflow = await FirebaseService.approveDesign(workflowId, approvedBy);
        
        io.emit('workflowUpdated', updatedWorkflow);
        
        res.status(200).json({
            status: 'success',
            message: 'Design approved and posted successfully',
            data: updatedWorkflow
        });
    } catch (error) {
        console.error('❌ approveDesign - Error:', error);
        next(error);
    }
};

export {
    createWorkflow,
    getWorkflowsByStage,
    submitContent,
    approveContent,
    submitDesign,
    approveDesign,
    updateWorkflow,
    deleteWorkflow
};