import ContactInquiry from '../models/ContactInquiry.js';
import { sendContactConfirmation, sendContactNotification } from '../utils/resendEmailService.js';
import { z } from 'zod';

// Validation schema for contact inquiry
const contactInquirySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .regex(/^[+]?[\d\s\-\(\)]{10,}$/, 'Please provide a valid phone number')
    .trim()
    .optional(),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters')
    .trim(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .trim(),
});

export async function submitContact(req, res, next) {
  try {
    // Validate request data
    const validatedData = contactInquirySchema.parse(req.body);
    
    // Create contact inquiry
    const inquiry = await ContactInquiry.create(validatedData);
    
    // Send confirmation email to user (don't block the response)
    sendContactConfirmation(inquiry).catch(error => {
      console.error('Failed to send contact confirmation email:', error);
    });
    
    // Send notification email to admin (don't block the response)
    sendContactNotification(inquiry).catch(error => {
      console.error('Failed to send contact notification email:', error);
    });
    
    // Return success response (without sensitive data)
    const responseData = {
      id: inquiry._id,
      name: inquiry.name,
      email: inquiry.email,
      subject: inquiry.subject,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
      message: 'Your message has been sent successfully! We will get back to you within 24-48 hours.'
    };
    
    res.status(201).json(responseData);
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

export async function listContactInquiries(req, res, next) {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get inquiries with pagination
    const inquiries = await ContactInquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('respondedBy', 'fullName email');
    
    // Get total count for pagination
    const total = await ContactInquiry.countDocuments(query);
    
    res.json({
      inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getContactInquiryById(req, res, next) {
  try {
    const { id } = req.params;
    
    const inquiry = await ContactInquiry.findById(id)
      .populate('respondedBy', 'fullName email');
    
    if (!inquiry) {
      return res.status(404).json({
        message: 'Contact inquiry not found'
      });
    }
    
    res.json(inquiry);
  } catch (err) {
    next(err);
  }
}

export async function updateContactInquiryStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    
    // Validate status
    const validStatuses = ['new', 'responded', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    const updateData = {
      status,
      response
      // TODO: Add respondedBy when authentication is implemented
      // respondedBy: req.user.id
    };
    
    const inquiry = await ContactInquiry.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!inquiry) {
      return res.status(404).json({
        message: 'Contact inquiry not found'
      });
    }
    
    res.json({
      message: 'Contact inquiry updated successfully',
      inquiry
    });
  } catch (err) {
    next(err);
  }
}

export async function getContactStats(req, res, next) {
  try {
    const stats = await ContactInquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalInquiries = await ContactInquiry.countDocuments();
    const recentInquiries = await ContactInquiry.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    res.json({
      total: totalInquiries,
      recent: recentInquiries,
      byStatus: {
        new: statusCounts.new || 0,
        responded: statusCounts.responded || 0,
        closed: statusCounts.closed || 0
      }
    });
  } catch (err) {
    next(err);
  }
}

// Email functions are now imported from emailService.js
