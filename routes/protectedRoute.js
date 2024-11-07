// backend/routes/protectedRoute.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect these routes with authenticateToken
router.get('/create', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Access granted to create page.' });
});

router.get('/game', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Access granted to game page.' });
});

export default router;
