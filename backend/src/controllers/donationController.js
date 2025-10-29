import Donation from "../models/Donation.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { z } from "zod";
import {
  sendDonationReceipt,
  sendDonationNotification,
} from "../utils/emailService.js";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
});

// Validation schema for donation
const donationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-\(\)]{10,}$/, "Please provide a valid phone number")
    .trim()
    .optional(),
  amountInInr: z
    .number()
    .min(1, "Minimum donation amount is ₹1")
    .max(1000000, "Maximum donation amount is ₹10,00,000"),
  currency: z.string().default("INR"),
  recurring: z.boolean().default(false),
  frequency: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  message: z
    .string()
    .max(1000, "Message must be less than 1000 characters")
    .optional(),
  paymentProvider: z.enum(["razorpay", "offline"]).default("razorpay"),
});

export async function createDonation(req, res, next) {
  try {
    // Validate request data
    const validatedData = donationSchema.parse(req.body);

    // Create donation record
    const donation = await Donation.create(validatedData);

    // Return success response (without sensitive data)
    const responseData = {
      id: donation._id,
      fullName: donation.fullName,
      email: donation.email,
      amountInInr: donation.amountInInr,
      currency: donation.currency,
      recurring: donation.recurring,
      paymentProvider: donation.paymentProvider,
      paymentStatus: donation.paymentStatus,
      createdAt: donation.createdAt,
      message: "Donation record created successfully",
    };

    res.status(201).json(responseData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((error) => ({
          field: error.path.join("."),
          message: error.message,
        })),
      });
    }
    next(err);
  }
}

export async function createPaymentOrder(req, res, next) {
  try {
    const { donationId, amount } = req.body;

    // Validate donation exists
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `donation_${donationId}`,
      notes: {
        donationId: donationId,
        donorName: donation.fullName,
        donorEmail: donation.email,
      },
    };

    const order = await razorpay.orders.create(options);

    // Update donation with Razorpay order ID
    await Donation.findByIdAndUpdate(donationId, {
      razorpayOrderId: order.id,
    });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    res.status(500).json({
      message: "Failed to create payment order",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const {
      donationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test_secret")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
        code: "SIGNATURE_MISMATCH",
      });
    }

    // Update donation status
    const donation = await Donation.findByIdAndUpdate(
      donationId,
      {
        paymentStatus: "success",
        razorpayPaymentId: razorpay_payment_id,
        transactionId: razorpay_payment_id,
      },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    // Send donation receipt email (don't block the response)
    sendDonationReceipt(donation).catch((error) => {
      console.error("Failed to send donation receipt:", error);
    });

    // Send admin notification (don't block the response)
    sendDonationNotification(donation).catch((error) => {
      console.error("Failed to send donation notification:", error);
    });

    res.json({
      message: "Payment verified successfully",
      donation: {
        id: donation._id,
        paymentStatus: donation.paymentStatus,
        transactionId: donation.transactionId,
      },
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    next(err);
  }
}

export async function listDonations(req, res, next) {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.paymentStatus = status;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { transactionId: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get donations with pagination
    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Donation.countDocuments(query);

    res.json({
      donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getDonationById(req, res, next) {
  try {
    const { id } = req.params;

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    res.json(donation);
  } catch (err) {
    next(err);
  }
}

export async function getDonationStats(req, res, next) {
  try {
    const stats = await Donation.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amountInInr" },
        },
      },
    ]);

    const totalDonations = await Donation.countDocuments();
    const totalAmount = await Donation.aggregate([
      { $match: { paymentStatus: "success" } },
      { $group: { _id: null, total: { $sum: "$amountInInr" } } },
    ]);

    const recentDonations = await Donation.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount,
      };
      return acc;
    }, {});

    res.json({
      total: totalDonations,
      totalAmount: totalAmount[0]?.total || 0,
      recent: recentDonations,
      byStatus: {
        pending: statusCounts.pending || { count: 0, amount: 0 },
        success: statusCounts.success || { count: 0, amount: 0 },
        failed: statusCounts.failed || { count: 0, amount: 0 },
      },
    });
  } catch (err) {
    next(err);
  }
}

// Email functions are now imported from emailService.js
