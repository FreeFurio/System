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
    try {
        const { objectives, gender, minAge, maxAge, deadline, numContent } = req.body;
        const task = { objectives, gender, minAge, maxAge, deadline, numContent };
        console.log(task);
        if (!objectives || !gender || !minAge || !maxAge || !deadline || !numContent) {
            return next(new AppError('All fields are required', 400));
        }
        const taskID = await FirebaseService.setTaskContentCreator(task);
        io.emit('ongoingContentCreatorTask', {
            id: taskID,
            ...task
        })

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
        next(error);
    }
}

// ========================
// 2.2) GET  TASK
// ========================

const getTaskContentCreator = async (req, res, next) => {
    try {
        const taskObj = await FirebaseService.getTaskContentCreator();
        const task = taskObj
            ? Object.entries(taskObj).map(([key, value]) => ({ id: key, ...value }))
            : [];
        res.status(200).json({
            status: 'success',
            data: task
        });
    } catch (error) {
        next(error)
    }
}

const getTaskGraphicDesigner = async (req, res, next) => {
    try {
        const taskObj = await FirebaseService.getTaskGraphicDesigner();
        const task = taskObj
            ? Object.entries(taskObj).map(([key, value]) => ({ id: key, ...value }))
            : [];
        res.status(200).json({
            status: 'success',
            data: task
        })
    } catch (error) {

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