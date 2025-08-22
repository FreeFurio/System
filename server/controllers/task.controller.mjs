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

const setTaskContentCreator = async (req, res, next) => {
    console.log('📝 setTaskContentCreator called with body:', req.body);
    try {
        const { objectives, gender, minAge, maxAge, deadline, numContent } = req.body;
        const task = { objectives, gender, minAge, maxAge, deadline, numContent };
        console.log('📝 setTaskContentCreator task object:', task);
        
        if (!objectives || !gender || !minAge || !maxAge || !deadline || !numContent) {
            console.log('❌ setTaskContentCreator - Missing required fields');
            return next(new AppError('All fields are required', 400));
        }
        console.log('✅ setTaskContentCreator - All required fields present');
        
        console.log('📝 setTaskContentCreator - Saving task to Firebase');
        const taskID = await FirebaseService.setTaskContentCreator(task);
        console.log('✅ setTaskContentCreator - Task saved with ID:', taskID);
        
        console.log('📝 setTaskContentCreator - Emitting Socket.IO event');
        io.emit('ongoingContentCreatorTask', {
            id: taskID,
            ...task
        });
        console.log('✅ setTaskContentCreator - Socket.IO event emitted');

        console.log('🎉 setTaskContentCreator - Task creation completed successfully');
        res.status(200).json({
            status: 'success',
            message: 'Task created successfully',
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
        console.error('❌ setTaskContentCreator - Error occurred:', error);
        next(error);
    }
}

// ========================
// 2.2) GET  TASK
// ========================

const getTaskContentCreator = async (req, res, next) => {
    console.log('📋 getTaskContentCreator called');
    try {
        console.log('📋 getTaskContentCreator - Fetching tasks from Firebase');
        const taskObj = await FirebaseService.getTaskContentCreator();
        
        const task = taskObj
            ? Object.entries(taskObj).map(([key, value]) => ({ id: key, ...value }))
            : [];
        console.log('📋 getTaskContentCreator - Tasks processed:', task.length, 'tasks found');
        
        console.log('✅ getTaskContentCreator - Tasks retrieved successfully');
        res.status(200).json({
            status: 'success',
            data: task
        });
    } catch (error) {
        console.error('❌ getTaskContentCreator - Error occurred:', error);
        next(error)
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

export {
    setTaskContentCreator,
    getTaskContentCreator,
    getTaskGraphicDesigner
};