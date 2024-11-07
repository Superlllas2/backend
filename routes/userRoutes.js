// backend/routes/userRoutes.js
import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/register', (req, res) => {
    res.status(405).json({ message: 'Method Not Allowed: no get in register' });
});

export default router;
