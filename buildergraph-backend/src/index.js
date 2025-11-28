/**
 * BuilderGraph DKG Backend - Main Server
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { initializeDatabase } from './database/db.js';
import profilesRouter from './routes/profiles.js';
import projectsRouter from './routes/projects.js';
import endorsementsRouter from './routes/endorsements.js';
import paymentsRouter from './routes/payments.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true // Allow credentials (cookies, authorization headers)
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware (required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'buildergraph-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Initialize database
try {
    initializeDatabase();
    console.log('✅ Database initialized');
} catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
}

// Routes
app.get('/', (req, res) => {
    res.json({
        name: 'BuilderGraph DKG Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            auth: '/api/auth',
            profiles: '/api/profiles',
            projects: '/api/projects',
            endorsements: '/api/endorsements',
            health: '/health'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        dkg_api: process.env.DKG_API_URL,
        github_oauth: process.env.GITHUB_CLIENT_ID ? 'configured' : 'not configured'
    });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/endorsements', endorsementsRouter);
app.use('/api/payments', paymentsRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 BuilderGraph DKG Backend Server');
    console.log('='.repeat(60));
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🔗 DKG Node API: ${process.env.DKG_API_URL}`);
    console.log(`💾 Database: ${process.env.DATABASE_PATH}`);
    console.log(`🌐 Frontend CORS: ${FRONTEND_URL}`);
    console.log('='.repeat(60));
    console.log('\n📋 Available endpoints:');
    console.log('   GET  /                      - API info');
    console.log('   GET  /health                - Health check');
    console.log('   POST /api/profiles          - Create profile');
    console.log('   GET  /api/profiles          - List all profiles');
    console.log('   GET  /api/profiles/:id      - Get profile by ID');
    console.log('   GET  /api/profiles/ual/:ual - Get profile by UAL');
    console.log('   POST /api/projects          - Create project');
    console.log('   GET  /api/projects          - List all projects');
    console.log('   GET  /api/projects/:id      - Get project by ID');
    console.log('   GET  /api/projects/user/:userUal - Get projects by user UAL');
    console.log('   POST /api/endorsements      - Create endorsement');
    console.log('   GET  /api/endorsements/user/:ual - Get endorsements for user');
    console.log('   GET  /api/endorsements/project/:id - Get endorsements for project');
    console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

export default app;
