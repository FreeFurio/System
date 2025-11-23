// ========================
// 1) IMPORTS & INITIALIZATION
// ========================
import express from 'express';
import { 
    adminNotification,
    contentCreatorNotification,
    marketingNotification,
    graphicDesignerNotification
} from '../controllers/notification.controller.mjs';
import { body } from 'express-validator';

const router = express.Router();

// ========================
// 2) ROUTE DEFINITIONS
// ========================

// ========================
// 2.1) ADMIN NOTIFICATION
// ========================

router.get(
    '/admin',
    adminNotification
);

router.get(
    '/contentcreator',
    contentCreatorNotification
);

router.get(
    '/marketing',
    marketingNotification
);

router.get(
    '/graphicdesigner',
    graphicDesignerNotification
);

// ========================
// 3) EXPORTS
// ========================
export default router;