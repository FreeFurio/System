import express from 'express';
import DraftController from '../controllers/draftController.mjs';

const router = express.Router();

// Save draft
router.post('/save', DraftController.saveDraft);

// Get all user drafts
router.get('/user', DraftController.getUserDrafts);

// Get drafts by workflow
router.get('/workflow/:workflowId', DraftController.getDraftsByWorkflow);

// Get specific draft
router.get('/:draftId', DraftController.getDraft);

// Update draft
router.put('/:draftId', DraftController.updateDraft);

// Delete draft
router.delete('/:draftId', DraftController.deleteDraft);

// Mark draft as submitted
router.put('/:draftId/submit', DraftController.markDraftAsSubmitted);

export default router;