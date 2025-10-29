import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export function applySecurity(app) {
	const isProd = process.env.NODE_ENV === 'production';
	
	// CORS configuration
	const corsOptions = {
		origin: process.env.ALLOWED_ORIGINS ? 
			process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
			true,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization']
	};
	
	app.use(helmet());
	app.use(compression());
	app.use(cors(corsOptions));
	app.set('trust proxy', isProd ? 1 : 0);
	app.use(
		rateLimit({
			windowMs: 60 * 1000,
			max: isProd ? 100 : 200,
			standardHeaders: true,
			legacyHeaders: false,
		})
	);
}
