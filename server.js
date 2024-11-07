import express from 'express';
import path from 'path'; // Import path to serve static files properly
// import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import questionsRoute from './routes/questionsRoute.js';
import userRoutes from './routes/userRoutes.js';
import protectedRoute from './routes/protectedRoute.js';

dotenv.config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB()
    .then(() => console.log('MongoDB connection successful'))
    .catch((error) => console.error('MongoDB connection failed:', error));

if (process.env.MODE === 'development') {
    // app.use(cors()); // Allow all origins in development
    // console.log("CORS is in dev mode");
} else if (process.env.MODE === 'production') {
    // app.use(cors({ origin: 'https://questnest-fd5edf2051c1.herokuapp.com' }));
    // console.log("CORS is in production mode");
}

// app.use(
//     cors({
//         origin: true, // Allow all origins
//         credentials: true,
//     })
// );
// app.options("*", cors());

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*")
//     res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested, Content-Type, Accept Authorization"
//     )
//     if (req.method === "OPTIONS") {
//         res.header(
//             "Access-Control-Allow-Methods",
//             "POST, PUT, PATCH, GET, DELETE"
//         )
//         return res.status(200).json({})
//     }
//     next()
// })

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Middleware to parse JSON
app.use(express.json());

// Define routes
app.use('/api/questions', questionsRoute);
app.use('/api/auth', userRoutes);
app.use('/api', protectedRoute);
app.use('/api/protected', protectedRoute);

// Serve static files from the frontend build directory (replace 'public' with your actual frontend build folder)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist'))); // Adjust 'public' if your folder has a different name

// Serve the main HTML file for all other routes (useful for single-page applications)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html')); // Adjust 'public/index.html' as needed
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});