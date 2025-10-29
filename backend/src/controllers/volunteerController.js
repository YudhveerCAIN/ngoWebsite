import Volunteer from '../models/Volunteer.js';
import { sendVolunteerConfirmation, sendAdminNotification } from '../utils/brevoEmailService.js';
import { z } from 'zod';

// Validation schema for volunteer registration
const volunteerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .trim(),
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]?[\d\s\-\(\)]{10,}$/, 'Please provide a valid phone number')
    .trim(),
  areasOfInterest: z.array(z.string())
    .min(1, 'Please select at least one area of interest')
    .max(10, 'Please select no more than 10 areas'),
  availability: z.string()
    .min(1, 'Please select your availability'),
  experience: z.string()
    .max(1000, 'Experience description must be less than 1000 characters')
    .optional(),
  message: z.string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional(),
});

export async function createVolunteer(req, res, next) {
  try {
    console.log('🚀 Volunteer registration request received');
    console.log('📝 Request body:', req.body);
    
    // Validate request data
    const validatedData = volunteerSchema.parse(req.body);
    console.log('✅ Data validation passed');
    
    // Check if volunteer with this email already exists
    const existingVolunteer = await Volunteer.findOne({ email: validatedData.email });
    if (existingVolunteer) {
      return res.status(400).json({
        message: 'A volunteer application with this email already exists. Please use a different email address or contact us if you need to update your application.',
        code: 'DUPLICATE_EMAIL'
      });
    }
    
    // Create volunteer record
    const volunteer = await Volunteer.create(validatedData);
    console.log('✅ Volunteer created:', volunteer.fullName, volunteer.email);
    
    // Send confirmation email to volunteer (don't block the response)
    console.log('📧 Attempting to send volunteer confirmation email...');
    sendVolunteerConfirmation(volunteer).catch(error => {
      console.error('❌ Failed to send volunteer confirmation email:', error);
    });
    
    // Send notification email to admin (don't block the response)
    console.log('📧 Attempting to send admin notification email...');
    sendAdminNotification(volunteer).catch(error => {
      console.error('❌ Failed to send admin notification email:', error);
    });
    
    // Return success response (without sensitive data)
    const responseData = {
      id: volunteer._id,
      fullName: volunteer.fullName,
      email: volunteer.email,
      status: volunteer.status,
      createdAt: volunteer.createdAt,
      message: 'Volunteer application submitted successfully! You should receive a confirmation email shortly.'
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

export async function listVolunteers(req, res, next) {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get volunteers with pagination
    const volunteers = await Volunteer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reviewedBy', 'fullName email');
    
    // Get total count for pagination
    const total = await Volunteer.countDocuments(query);
    
    res.json({
      volunteers,
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

export async function getVolunteerById(req, res, next) {
  try {
    const { id } = req.params;
    
    const volunteer = await Volunteer.findById(id)
      .populate('reviewedBy', 'fullName email');
    
    if (!volunteer) {
      return res.status(404).json({
        message: 'Volunteer not found'
      });
    }
    
    res.json(volunteer);
  } catch (err) {
    next(err);
  }
}

export async function updateVolunteerStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['new', 'reviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      {
        status,
        notes,
        reviewedAt: new Date(),
        // TODO: Add reviewedBy when authentication is implemented
        // reviewedBy: req.user.id
      },
      { new: true, runValidators: true }
    );
    
    if (!volunteer) {
      return res.status(404).json({
        message: 'Volunteer not found'
      });
    }
    
    res.json({
      message: 'Volunteer status updated successfully',
      volunteer
    });
  } catch (err) {
    next(err);
  }
}

export async function getVolunteerStats(req, res, next) {
  try {
    const stats = await Volunteer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalVolunteers = await Volunteer.countDocuments();
    const recentVolunteers = await Volunteer.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    res.json({
      total: totalVolunteers,
      recent: recentVolunteers,
      byStatus: {
        new: statusCounts.new || 0,
        reviewed: statusCounts.reviewed || 0,
        accepted: statusCounts.accepted || 0,
        rejected: statusCounts.rejected || 0
      }
    });
  } catch (err) {
    next(err);
  }
}
