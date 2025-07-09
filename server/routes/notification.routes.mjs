// ========================
// 1) IMPORTS & INITIALIZATION
// ========================
import express from 'express';
import { 
    adminNotification
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
    '/notification/admin',
    adminNotification
);

// ========================
// 3) EXPORTS
// ========================
export default router;