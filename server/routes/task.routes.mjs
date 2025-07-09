// ========================
// 1) IMPORTS & INITIALIZATION
// ========================
import express from 'express';
import {
    setTaskContentCreator,
    getTaskContentCreator
} from '../controllers/task.controller.mjs';
import { body } from 'express-validator';

const router = express.Router();

// ========================
// 2) ROUTE DEFINITIONS
// ========================

// ========================
// 2.1) CREATING TASK
// ========================

// ========================
// 2.1.1) CREATING CONTENT CREATOR TASK
// ========================
router.post(
    '/content-creator/task',
    [
        body('objectives')
            .notEmpty()
            .withMessage('Objectives is required'),
        body('gender')
            .notEmpty()
            .withMessage('Gender is required'),
        body('minAge')
            .notEmpty(),
        body('maxAge')
            .notEmpty(),
        body('deadline')
            .notEmpty()
            .withMessage('Deadline is Required'),
        body('numContent')
            .notEmpty()
            .withMessage('Number of Content is required')
    ],
    setTaskContentCreator
)

// ========================
// 2.2) GET TASK
// ========================

// ========================
// 2.2.1) GET CONTENT CREATOR TASK
// ========================
router.get(
    '/content-creator/task',
    getTaskContentCreator
)

export default router;
