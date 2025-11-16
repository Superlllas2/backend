import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    createResult,
    listResults,
    getResultById,
    updateResult,
    deleteResult,
    getLeaderboard,
} from '../controllers/quizResultController.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.post('/results', authenticateToken, createResult);
router.get('/results', authenticateToken, listResults);
router.get('/results/:id', authenticateToken, getResultById);
router.put('/results/:id', authenticateToken, updateResult);
router.delete('/results/:id', authenticateToken, deleteResult);

export default router;
