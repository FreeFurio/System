// ========================
// 1) IMPORTS & INITIALIZATION
// ========================
import express from 'express';
import {
    createWorkflow,
    getWorkflowsByStage,
    submitContent,
    approveContent,
    submitDesign,
    approveDesign,
    updateWorkflow,
    deleteWorkflow,
    assignToGraphicDesigner
} from '../controllers/task.controller.mjs';
import { body } from 'express-validator';

const router = express.Router();

// ========================
// 2) ROUTE DEFINITIONS
// ========================

// ========================
// 2.1) CREATING TASK
// ========================

// Create new workflow
router.post(
    '/workflow',   
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
            .withMessage('Deadline is Required')
    ],
    createWorkflow
)


// ========================
// 2.2) GET TASK
// ========================

// Get workflows by stage
router.get(
    '/workflows/stage/:stage',
    getWorkflowsByStage
)

// Legacy routes for compatibility
router.get(
    '/marketing/content-creator/task',
    (req, res, next) => {
        req.params.stage = 'contentcreator';
        getWorkflowsByStage(req, res, next);
    }
)

router.get(
    '/marketing/graphic-designer/task',
    (req, res, next) => {
        req.params.stage = 'graphicdesigner';
        getWorkflowsByStage(req, res, next);
    }
)

router.get(
    '/content-creator/task',
    (req, res, next) => {
        req.params.stage = 'contentcreator';
        getWorkflowsByStage(req, res, next);
    }
)

// Legacy route compatibility - redirect to workflow creation
router.post(
    '/graphic-designer/task',
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
    createWorkflow
)

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
            .withMessage('Deadline is Required')
    ],
    createWorkflow
)

router.get(
    '/graphic-designer/task',
    (req, res, next) => {
        req.params.stage = 'graphicdesigner';
        getWorkflowsByStage(req, res, next);
    }
)

// Content submission and approval
router.post(
    '/workflow/:workflowId/submit-content',
    [
        body('headline').notEmpty().withMessage('Headline is required'),
        body('caption').notEmpty().withMessage('Caption is required'),
        body('hashtag').notEmpty().withMessage('Hashtag is required')
    ],
    submitContent
)

router.post(
    '/workflow/:workflowId/approve-content',
    approveContent
)

// Design submission and approval
router.post(
    '/workflow/:workflowId/submit-design',
    submitDesign
)

router.post(
    '/workflow/:workflowId/approve-design',
    approveDesign
)

// Workflow management routes
router.put(
    '/workflow/:workflowId',
    updateWorkflow
)

router.delete(
    '/workflow/:workflowId',
    deleteWorkflow
)

// Assign workflow to graphic designer
router.post(
    '/workflow/:workflowId/assign-to-graphic-designer',
    assignToGraphicDesigner
)

export default router;
