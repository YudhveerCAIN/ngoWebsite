import { ZodError } from 'zod';

export function validateBody(schema) {
	return (req, res, next) => {
		try {
			req.body = schema.parse(req.body);
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				return res.status(400).json({ message: 'Validation failed', errors: err.errors });
			}
			next(err);
		}
	};
}

export function withPagination(defaultLimit = 20, maxLimit = 100) {
	return (req, res, next) => {
		const page = Math.max(1, parseInt(req.query.page || '1', 10));
		const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit || String(defaultLimit), 10)));
		req.pagination = { page, limit, skip: (page - 1) * limit };
		next();
	};
}
