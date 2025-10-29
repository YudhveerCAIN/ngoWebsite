import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export function applySecurity(app) {
	const isProd = process.env.NODE_ENV === 'production';
	app.use(helmet());
	app.use(compression());
	app.use(cors({ origin: true }));
	app.set('trust proxy', isProd ? 1 : 0);
	app.use(
		rateLimit({
			windowMs: 60 * 1000,
			max: 200,
			standardHeaders: true,
			legacyHeaders: false,
		})
	);
}
