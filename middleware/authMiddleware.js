// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET); // Attach decoded user info to req object
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token.' });
    }
};

