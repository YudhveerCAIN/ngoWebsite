import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { applySecurity } from './middleware/security.js';
import impactRouter from './routes/impactRoutes.js';
import aboutRouter from './routes/aboutRoutes.js';
import donationRouter from './routes/donationRoutes.js';
import volunteerRouter from './routes/volunteerRoutes.js';
import contactRouter from './routes/contactRoutes.js';
import authRouter from './routes/authRoutes.js';

const app = express();

applySecurity(app);
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/impact', impactRouter);
app.use('/api/about', aboutRouter);
app.use('/api/donations', donationRouter);
app.use('/api/volunteers', volunteerRouter);
app.use('/api/contact', contactRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
