import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true, trim: true },
		email: { type: String, required: true, trim: true },
		phone: { type: String, trim: true },
		amountInInr: { type: Number, required: true, min: 1 },
		currency: { type: String, default: 'INR' },
		recurring: { type: Boolean, default: false },
		frequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
		message: { type: String, trim: true },
		paymentProvider: { type: String, enum: ['razorpay', 'stripe', 'offline'], default: 'razorpay' },
		paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
		transactionId: { type: String },
		razorpayOrderId: { type: String },
		razorpayPaymentId: { type: String },
		receiptSent: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

// Add index for efficient queries
donationSchema.index({ email: 1 });
donationSchema.index({ paymentStatus: 1 });
donationSchema.index({ createdAt: -1 });

export default mongoose.model('Donation', donationSchema);
