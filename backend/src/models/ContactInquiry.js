import mongoose from 'mongoose';

const contactInquirySchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, trim: true },
		phone: { type: String, trim: true },
		subject: { type: String, required: true, trim: true },
		message: { type: String, required: true, trim: true },
		status: { type: String, enum: ['new', 'responded', 'closed'], default: 'new' },
		respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		response: { type: String, trim: true },
	},
	{ timestamps: true }
);

// Add indexes for efficient queries
contactInquirySchema.index({ email: 1 });
contactInquirySchema.index({ status: 1 });
contactInquirySchema.index({ createdAt: -1 });

export default mongoose.model('ContactInquiry', contactInquirySchema);