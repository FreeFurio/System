// ========================
// 1) IMPORTS & INITIALIZATION
// ========================

import FirebaseService from '../services/firebase.service.mjs';
import { AppError } from '../utils/errorHandler.mjs';

// ========================
// 2) CONTROLLER FUNCTIONS
// ========================

// ========================
// 2.1) CREATING  TASK
// ========================

// ========================
// 2.1.1) CREATING CONTENT CREATOR TASK
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

// ========================
// 2.2.1) GET CONTENT CREATOR TASK
// ========================
const getTaskContentCreator = async (req,res,next) => {
    try{
        const Task = await FirebaseService.getTaskContentCreator();
        res.status(200).json({
            status: 'success',
            data: Task
        });
    } catch (error){
        next(error)
    }
}

// ========================
// 3) EXPORTS
// ========================

export {
    setTaskContentCreator,
    getTaskContentCreator
};