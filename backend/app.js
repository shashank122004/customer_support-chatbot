import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import query from './routes/router.query.js';

// Load environment variables
dotenv.config();

const app = express();

// Security: Helmet sets various HTTP headers for protection
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Security: CORS - restrict to specific origin in production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || 'http://localhost:5173'
        : 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security: Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Security: Limit payload size to prevent large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logger (without logging sensitive data)
app.use((req, res, next) => {
    // Only log method and URL, NOT body content which may contain sensitive info
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Security: Sanitize request data
app.use((req, res, next) => {
    // Remove any potentially dangerous characters from inputs
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                // Basic XSS protection - remove script tags
                req.body[key] = req.body[key].replace(/<script[^>]*>.*?<\/script>/gi, '');
            }
        });
    }
    next();
});

// Sample route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/query', query);

export default app;