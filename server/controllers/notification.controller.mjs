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

const contentCreatorNotification = async (req, res, next) => {
    console.log('📬 contentCreatorNotification controller called');
    try {
        const notification = await FirebaseService.getContentCreatorNotifications();
        console.log('📬 contentCreatorNotification controller - notifications retrieved:', notification ? Object.keys(notification).length : 0);

        res.status(200).json({
            status: 'success',
            data: notification
        });
    } catch (error) {
        console.error('❌ contentCreatorNotification controller error:', error);
        next(error);
    }
}

const marketingNotification = async (req, res, next) => {
    console.log('📬 marketingNotification controller called');
    try {
        const notification = await FirebaseService.getMarketingNotifications();
        console.log('📬 marketingNotification controller - notifications retrieved:', notification ? Object.keys(notification).length : 0);

        res.status(200).json({
            status: 'success',
            data: notification
        });
    } catch (error) {
        console.error('❌ marketingNotification controller error:', error);
        next(error);
    }
}

const graphicDesignerNotification = async (req, res, next) => {
    console.log('📬 graphicDesignerNotification controller called');
    try {
        const notification = await FirebaseService.getGraphicDesignerNotifications();
        console.log('📬 graphicDesignerNotification controller - notifications retrieved:', notification ? Object.keys(notification).length : 0);

        res.status(200).json({
            status: 'success',
            data: notification
        });
    } catch (error) {
        console.error('❌ graphicDesignerNotification controller error:', error);
        next(error);
    }
}

// ========================
// 4) EXPORTS
// ========================

export {
    adminNotification,
    contentCreatorNotification,
    marketingNotification,
    graphicDesignerNotification
};

