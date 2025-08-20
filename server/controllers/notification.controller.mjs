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
    console.log('📬 adminNotification controller called');
    try {
        const notification = await FirebaseService.getadminNotification();
        console.log('📬 adminNotification controller - notifications retrieved:', notification ? Object.keys(notification).length : 0);

        res.status(200).json({
            status: 'success',
            data: notification
        });
    } catch (error) {
        console.error('❌ adminNotification controller error:', error);
        next(error);
    }
}

// ========================
// 4) EXPORTS
// ========================

export {
    adminNotification
};

