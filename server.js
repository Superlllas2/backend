import express from 'express';
import path from 'path'; // Import path to serve static files properly
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './db.js';
import questionsRoute from './routes/questionsRoute.js';
import userRoutes from './routes/userRoutes.js';
import protectedRoute from './routes/protectedRoute.js';
import quizResultRoutes from './routes/quizResultRoutes.js';
import gameSessionRoutes from './routes/gameSessionRoutes.js';

dotenv.config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 5001;
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
};

// Connect to MongoDB
connectDB()
    .then(() => console.log('MongoDB connection successful'))
    .catch((error) => console.error('MongoDB connection failed:', error));

app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Define routes
app.use('/api/questions', questionsRoute);
app.use('/api/auth', userRoutes);
app.use('/api', quizResultRoutes);
app.use('/api', gameSessionRoutes);
app.use('/api', protectedRoute);
app.use('/api/protected', protectedRoute);

// Serve static files from the frontend build directory (replace 'public' with your actual frontend build folder)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist'))); // Adjust 'public' if your folder has a different name

// Serve the main HTML file for all other routes (useful for single-page applications)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html')); // Adjust 'public/index.html' as needed
});

const server = createServer(app);

const io = new SocketIOServer(server, {
    cors: corsOptions,
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('chat:message', (payload) => {
        io.emit('chat:message', payload);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});