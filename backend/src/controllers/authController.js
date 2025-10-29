import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';

// Validation schemas
const loginSchema = z.object({
	email: z.string()
		.email('Please provide a valid email address')
		.toLowerCase()
		.trim(),
	password: z.string()
		.min(1, 'Password is required')
});

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, 'Current password is required'),
	newPassword: z.string()
		.min(8, 'New password must be at least 8 characters')
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
});

export async function seedAdmin(req, res, next) {
	try {
		const email = process.env.ADMIN_EMAIL || 'admin@urjjapratishthan.org';
		const name = process.env.ADMIN_NAME || 'Admin User';
		const password = process.env.ADMIN_PASSWORD || 'Admin@123';
		
		let user = await User.findOne({ email });
		
		if (!user) {
			const passwordHash = await bcrypt.hash(password, 12);
			user = await User.create({ 
				email, 
				name, 
				passwordHash,
				role: 'admin',
				isActive: true
			});
			
			console.log(`Admin user created: ${email}`);
		} else {
			console.log(`Admin user already exists: ${email}`);
		}
		
		res.json({ 
			message: 'Admin user ready',
			email,
			note: 'Please change the default password after first login'
		});
	} catch (err) {
		console.error('Error seeding admin:', err);
		next(err);
	}
}

export async function login(req, res, next) {
	try {
		// Validate request data
		const validatedData = loginSchema.parse(req.body);
		const { email, password } = validatedData;
		
		// Find user
		const user = await User.findOne({ email, isActive: true });
		
		if (!user) {
			// Use same error message to prevent email enumeration
			return res.status(401).json({ 
				message: 'Invalid email or password',
				code: 'INVALID_CREDENTIALS'
			});
		}
		
		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
		
		if (!isPasswordValid) {
			return res.status(401).json({ 
				message: 'Invalid email or password',
				code: 'INVALID_CREDENTIALS'
			});
		}
		
		// Generate JWT token
		const tokenPayload = {
			sub: user._id,
			email: user.email,
			role: user.role,
			iat: Math.floor(Date.now() / 1000)
		};
		
		const token = jwt.sign(
			tokenPayload, 
			process.env.JWT_SECRET || 'dev-secret', 
			{ 
				expiresIn: process.env.JWT_EXPIRES_IN || '8h',
				issuer: 'urjja-pratishthan-prakashalay',
				audience: 'admin-panel'
			}
		);
		
		// Update last login
		await User.findByIdAndUpdate(user._id, { 
			lastLoginAt: new Date() 
		});
		
		// Return success response
		res.json({
			message: 'Login successful',
			token,
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				role: user.role,
				lastLoginAt: new Date()
			},
			expiresIn: process.env.JWT_EXPIRES_IN || '8h'
		});
		
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({
				message: 'Validation failed',
				errors: err.errors.map(error => ({
					field: error.path.join('.'),
					message: error.message
				}))
			});
		}
		
		console.error('Login error:', err);
		next(err);
	}
}

export async function logout(req, res, next) {
	try {
		// In a more sophisticated setup, you might want to blacklist the token
		// For now, we'll just return a success message
		res.json({
			message: 'Logout successful',
			note: 'Please remove the token from client storage'
		});
	} catch (err) {
		next(err);
	}
}

export async function getProfile(req, res, next) {
	try {
		const user = await User.findById(req.user.id).select('-passwordHash');
		
		if (!user) {
			return res.status(404).json({
				message: 'User not found',
				code: 'USER_NOT_FOUND'
			});
		}
		
		res.json({
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				role: user.role,
				isActive: user.isActive,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				lastLoginAt: user.lastLoginAt
			}
		});
	} catch (err) {
		next(err);
	}
}

export async function changePassword(req, res, next) {
	try {
		// Validate request data
		const validatedData = changePasswordSchema.parse(req.body);
		const { currentPassword, newPassword } = validatedData;
		
		// Get user with password hash
		const user = await User.findById(req.user.id);
		
		if (!user) {
			return res.status(404).json({
				message: 'User not found',
				code: 'USER_NOT_FOUND'
			});
		}
		
		// Verify current password
		const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
		
		if (!isCurrentPasswordValid) {
			return res.status(400).json({
				message: 'Current password is incorrect',
				code: 'INVALID_CURRENT_PASSWORD'
			});
		}
		
		// Hash new password
		const newPasswordHash = await bcrypt.hash(newPassword, 12);
		
		// Update password
		await User.findByIdAndUpdate(user._id, {
			passwordHash: newPasswordHash,
			updatedAt: new Date()
		});
		
		res.json({
			message: 'Password changed successfully'
		});
		
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({
				message: 'Validation failed',
				errors: err.errors.map(error => ({
					field: error.path.join('.'),
					message: error.message
				}))
			});
		}
		
		next(err);
	}
}

export async function refreshToken(req, res, next) {
	try {
		// Get current user
		const user = await User.findById(req.user.id).select('-passwordHash');
		
		if (!user || !user.isActive) {
			return res.status(401).json({
				message: 'User not found or inactive',
				code: 'USER_INVALID'
			});
		}
		
		// Generate new token
		const tokenPayload = {
			sub: user._id,
			email: user.email,
			role: user.role,
			iat: Math.floor(Date.now() / 1000)
		};
		
		const newToken = jwt.sign(
			tokenPayload,
			process.env.JWT_SECRET || 'dev-secret',
			{
				expiresIn: process.env.JWT_EXPIRES_IN || '8h',
				issuer: 'urjja-pratishthan-prakashalay',
				audience: 'admin-panel'
			}
		);
		
		res.json({
			message: 'Token refreshed successfully',
			token: newToken,
			expiresIn: process.env.JWT_EXPIRES_IN || '8h'
		});
		
	} catch (err) {
		next(err);
	}
}

export async function validateToken(req, res, next) {
	try {
		// If we reach here, the token is valid (middleware already validated it)
		res.json({
			valid: true,
			user: req.user,
			message: 'Token is valid'
		});
	} catch (err) {
		next(err);
	}
}
