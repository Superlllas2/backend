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

// router.post('/sessions', authenticateToken, createSession);
// router.get('/sessions', authenticateToken, listMySessions);
// router.get('/sessions/:code', authenticateToken, getSessionByCode);
// router.put('/sessions/:id', authenticateToken, updateSession);
// router.delete('/sessions/:id', authenticateToken, deleteSession);

router.post('/sessions', createSession);
router.get('/sessions', listMySessions);
router.get('/sessions/:code', getSessionByCode);
router.put('/sessions/:id', updateSession);
router.delete('/sessions/:id', deleteSession);

export default router;
