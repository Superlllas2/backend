import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    createSession,
    listMySessions,
    getSessionByCode,
    updateSession,
    deleteSession,
} from '../controllers/gameSessionController.js';

const router = express.Router();

router.post('/sessions', authenticateToken, createSession);
router.get('/sessions', authenticateToken, listMySessions);
router.get('/sessions/:code', authenticateToken, getSessionByCode);
router.put('/sessions/:id', authenticateToken, updateSession);
router.delete('/sessions/:id', authenticateToken, deleteSession);

export default router;
