// ========================
// 1) IMPORTS & INITIALIZATION
// ========================
import express from 'express';
import {
    setTaskContentCreator,
    getTaskContentCreator,
    getTaskGraphicDesigner
} from '../controllers/task.controller.mjs';
import { body } from 'express-validator';

const router = express.Router();

// ========================
// 2) ROUTE DEFINITIONS
// ========================

// ========================
// 2.1) CREATING TASK
// ========================

router.post(
    '/marketing/content-creator/task',
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

router.get(
    '/marketing/content-creator/task',
    getTaskContentCreator
)

router.get(
    '/marketing/graphic-designer/task',
    getTaskGraphicDesigner
)

router.get(
    '/content-creator/task',
    getTaskContentCreator
)

router.get(
    '/graphic-designer/task',
    getTaskGraphicDesigner
)

export default router;
