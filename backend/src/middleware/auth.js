import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function requireApiKey(req, res, next) {
	const apiKey = req.header('x-api-key') || req.query.apiKey;
	const configured = process.env.ADMIN_API_KEY || '';
	if (!configured) {
		return res.status(500).json({ message: 'Admin API key not configured' });
	}
	if (apiKey !== configured) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	next();
}

export function devOnly(req, res, next) {
	if (process.env.NODE_ENV === 'production') {
		return res.status(403).json({ message: 'Not allowed in production' });
	}
	next();
}

// Enhanced JWT authentication middleware
export async function requireAuth(req, res, next) {
	try {
		const authHeader = req.header('authorization') || req.header('Authorization');
		
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ 
				message: 'Access denied. No token provided.',
				code: 'NO_TOKEN'
			});
		}
		
		const token = authHeader.substring(7); // Remove 'Bearer ' prefix
		
		if (!token) {
			return res.status(401).json({ 
				message: 'Access denied. Invalid token format.',
				code: 'INVALID_TOKEN_FORMAT'
			});
		}
		
		// Verify JWT token
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
		
		// Get user from database to ensure they still exist and are active
		const user = await User.findById(decoded.sub).select('-passwordHash');
		
		if (!user) {
			return res.status(401).json({ 
				message: 'Access denied. User not found.',
				code: 'USER_NOT_FOUND'
			});
		}
		
		if (!user.isActive) {
			return res.status(401).json({ 
				message: 'Access denied. User account is inactive.',
				code: 'USER_INACTIVE'
			});
		}
		
		// Add user info to request
		req.user = {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			isActive: user.isActive
		};
		
		next();
	} catch (error) {
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ 
				message: 'Access denied. Invalid token.',
				code: 'INVALID_TOKEN'
			});
		}
		
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ 
				message: 'Access denied. Token expired.',
				code: 'TOKEN_EXPIRED'
			});
		}
		
		console.error('Auth middleware error:', error);
		return res.status(500).json({ 
			message: 'Internal server error during authentication.',
			code: 'AUTH_ERROR'
		});
	}
}

// Admin role requirement middleware
export function requireAdmin(req, res, next) {
	if (!req.user) {
		return res.status(401).json({ 
			message: 'Authentication required.',
			code: 'AUTH_REQUIRED'
		});
	}
	
	if (req.user.role !== 'admin') {
		return res.status(403).json({ 
			message: 'Access denied. Admin privileges required.',
			code: 'INSUFFICIENT_PRIVILEGES'
		});
	}
	
	next();
}

// Combined middleware for admin authentication
export function requireAdminAuth(req, res, next) {
	requireAuth(req, res, (err) => {
		if (err) return next(err);
		requireAdmin(req, res, next);
	});
}

// Optional authentication middleware (doesn't fail if no token)
export async function optionalAuth(req, res, next) {
	try {
		const authHeader = req.header('authorization') || req.header('Authorization');
		
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return next(); // Continue without authentication
		}
		
		const token = authHeader.substring(7);
		
		if (!token) {
			return next(); // Continue without authentication
		}
		
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
		const user = await User.findById(decoded.sub).select('-passwordHash');
		
		if (user && user.isActive) {
			req.user = {
				id: user._id,
				email: user.email,
				name: user.name,
				role: user.role,
				isActive: user.isActive
			};
		}
		
		next();
	} catch (error) {
		// Ignore auth errors in optional auth
		next();
	}
}
