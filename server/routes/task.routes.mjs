// ========================
// 1) IMPORTS & INITIALIZATION
// ========================
import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    createWorkflow,
    getWorkflowsByStage,
    getWorkflowsByMultipleStatuses,
    getWorkflowById,
    getAllWorkflows,
    generateAIContent,
    submitContent,
    approveContent,
    rejectContent,
    saveDesignDraft,
    submitDesign,
    approveDesign,
    rejectDesign,
    updateWorkflow,
    deleteWorkflow,
    assignToGraphicDesigner,
    postNow
} from '../controllers/task.controller.mjs';
import FirebaseService from '../services/firebase.service.mjs';
import { body } from 'express-validator';

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

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

// Get all workflows
router.get(
    '/workflows',
    getAllWorkflows
)

// Get workflows by stage
router.get(
    '/workflows/stage/:stage',
    getWorkflowsByStage
)

// Get individual workflow by ID
router.get(
    '/workflow/:workflowId',
    async (req, res) => {
        try {
            const { workflowId } = req.params;
            const workflow = await getWorkflowById(workflowId);
            if (!workflow) {
                return res.status(404).json({ status: 'error', message: 'Workflow not found' });
            }
            res.json({ status: 'success', data: workflow });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
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
    '/workflows/stage/marketinglead',
    (req, res, next) => {
        req.params.stage = 'marketinglead';
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

// AI Content Generation
router.post(
    '/generate-ai-content',
    [
        body('topic').notEmpty().withMessage('Topic is required')
    ],
    generateAIContent
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

router.post(
    '/workflow/:workflowId/reject-content',
    rejectContent
)

// Design draft saving
router.post(
    '/workflow/:workflowId/save-design-draft',
    saveDesignDraft
)

// Design submission and approval
router.post(
    '/workflow/:workflowId/submit-design',
    upload.single('design'),
    submitDesign
)

router.post(
    '/workflow/:workflowId/approve-design',
    approveDesign
)

router.post(
    '/workflow/:workflowId/reject-design',
    rejectDesign
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

router.get(
    '/workflow/:workflowId/post-now',
    postNow
)

router.post(
    '/workflow/:workflowId/post-now',
    postNow
)

// Get approved workflows (design_approved status)
router.get(
    '/workflows/approved',
    (req, res, next) => {
        req.statuses = ['ready_for_design_assignment', 'design_approved'];
        getWorkflowsByMultipleStatuses(req, res, next);
    }
)

// Get content creator approval status
router.get(
    '/workflows/content-creator/approval-status',
    (req, res, next) => {
        req.statuses = ['content_approval', 'ready_for_design_assignment', 'content_rejected'];
        getWorkflowsByMultipleStatuses(req, res, next);
    }
)

// Get graphic designer approval status
router.get(
    '/workflows/graphic-designer/approval-status',
    (req, res, next) => {
        req.statuses = ['design_approval', 'design_approved', 'design_rejected', 'posted'];
        getWorkflowsByMultipleStatuses(req, res, next);
    }
)

// Get posted workflows
router.get(
    '/workflows/posted',
    (req, res, next) => {
        req.statuses = ['posted'];
        getWorkflowsByMultipleStatuses(req, res, next);
    }
)

export default router;
