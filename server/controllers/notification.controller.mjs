// ========================
// 1) IMPORTS & INITIALIZATION
// ========================
import FirebaseService from '../services/firebase.service.mjs';
import { AppError } from '../utils/errorHandler.mjs';

// ========================
// 2) CONTROLLER FUNCTIONS
// ========================

// ========================
// 2.1) ADMIN NOTIFICATION
// ========================

const adminNotification = async (req, res, next) => {
    try {
        const notification= await FirebaseService.adminNotification();

        res.status(200).json({
            status: 'success',
            data: notification
        })
    } catch (error) {
        next(error);
    }
}

// ========================
// 4) EXPORTS
// ========================

export {
    adminNotification
};

