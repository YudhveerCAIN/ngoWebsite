import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		email: { 
			type: String, 
			required: true, 
			unique: true, 
			trim: true,
			lowercase: true,
			index: true
		},
		name: { 
			type: String, 
			required: true, 
			trim: true 
		},
		passwordHash: { 
			type: String, 
			required: true 
		},
		role: { 
			type: String, 
			enum: ['admin', 'moderator'], 
			default: 'admin' 
		},
		isActive: { 
			type: Boolean, 
			default: true,
			index: true
		},
		lastLoginAt: { 
			type: Date 
		},
		passwordChangedAt: { 
			type: Date 
		},
		loginAttempts: { 
			type: Number, 
			default: 0 
		},
		lockUntil: { 
			type: Date 
		},
		preferences: {
			theme: { 
				type: String, 
				enum: ['light', 'dark'], 
				default: 'light' 
			},
			language: { 
				type: String, 
				default: 'en' 
			},
			notifications: {
				email: { type: Boolean, default: true },
				browser: { type: Boolean, default: true }
			}
		}
	},
	{ 
		timestamps: true,
		toJSON: {
			transform: function(doc, ret) {
				delete ret.passwordHash;
				delete ret.loginAttempts;
				delete ret.lockUntil;
				return ret;
			}
		}
	}
);

// Indexes for performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
	return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Methods
userSchema.methods.incLoginAttempts = function() {
	// If we have a previous lock that has expired, restart at 1
	if (this.lockUntil && this.lockUntil < Date.now()) {
		return this.updateOne({
			$unset: { lockUntil: 1 },
			$set: { loginAttempts: 1 }
		});
	}
	
	const updates = { $inc: { loginAttempts: 1 } };
	
	// Lock account after 5 failed attempts for 2 hours
	if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
		updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
	}
	
	return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
	return this.updateOne({
		$unset: { loginAttempts: 1, lockUntil: 1 }
	});
};

export default mongoose.model('User', userSchema);
