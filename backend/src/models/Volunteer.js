import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true, trim: true },
		email: { type: String, required: true, trim: true, unique: true },
		phone: { type: String, required: true, trim: true },
		areasOfInterest: [{ type: String, required: true }],
		availability: { type: String, required: true },
		experience: { type: String, trim: true },
		message: { type: String, trim: true },
		status: { type: String, enum: ['new', 'reviewed', 'accepted', 'rejected'], default: 'new' },
		reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		reviewedAt: { type: Date },
		notes: { type: String, trim: true },
	},
	{ timestamps: true }
);

// Add index for email for faster lookups
volunteerSchema.index({ email: 1 });

export default mongoose.model('Volunteer', volunteerSchema);
