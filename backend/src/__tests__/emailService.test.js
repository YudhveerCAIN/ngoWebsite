import { sendVolunteerConfirmation, sendAdminNotification } from '../utils/emailService.js';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id-123'
    })
  }))
}));

describe('Email Service', () => {
  const mockVolunteer = {
    _id: '507f1f77bcf86cd799439011',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    areasOfInterest: ['Education & Tutoring', 'Community Development'],
    availability: 'Weekends only',
    experience: 'I have volunteered at local schools for 2 years',
    message: 'I am passionate about education and want to help',
    status: 'new',
    createdAt: new Date('2024-01-15T10:00:00Z')
  };

  describe('sendVolunteerConfirmation', () => {
    test('should send confirmation email to volunteer', async () => {
      const result = await sendVolunteerConfirmation(mockVolunteer);
      
      expect(result).toEqual({
        messageId: 'test-message-id-123'
      });
    });

    test('should handle email sending errors', async () => {
      // Mock transporter to throw error
      const nodemailer = require('nodemailer');
      nodemailer.createTransporter.mockReturnValueOnce({
        sendMail: jest.fn().mockRejectedValue(new Error('SMTP connection failed'))
      });

      await expect(sendVolunteerConfirmation(mockVolunteer))
        .rejects
        .toThrow('SMTP connection failed');
    });

    test('should include volunteer details in email content', async () => {
      const nodemailer = require('nodemailer');
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-123' });
      nodemailer.createTransporter.mockReturnValueOnce({
        sendMail: mockSendMail
      });

      await sendVolunteerConfirmation(mockVolunteer);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockVolunteer.email,
          subject: expect.stringContaining('Thank you for volunteering'),
          html: expect.stringContaining(mockVolunteer.fullName),
          text: expect.stringContaining(mockVolunteer.fullName)
        })
      );

      const emailCall = mockSendMail.mock.calls[0][0];
      expect(emailCall.html).toContain(mockVolunteer.areasOfInterest.join(', '));
      expect(emailCall.html).toContain(mockVolunteer.availability);
      expect(emailCall.html).toContain(mockVolunteer.experience);
      expect(emailCall.html).toContain(mockVolunteer.message);
    });
  });

  describe('sendAdminNotification', () => {
    test('should send notification email to admin', async () => {
      const result = await sendAdminNotification(mockVolunteer);
      
      expect(result).toEqual({
        messageId: 'test-message-id-123'
      });
    });

    test('should include volunteer details in admin notification', async () => {
      const nodemailer = require('nodemailer');
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-123' });
      nodemailer.createTransporter.mockReturnValueOnce({
        sendMail: mockSendMail
      });

      await sendAdminNotification(mockVolunteer);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.stringContaining('admin'),
          subject: expect.stringContaining('New Volunteer Application'),
          html: expect.stringContaining(mockVolunteer.fullName),
          text: expect.stringContaining(mockVolunteer.fullName)
        })
      );

      const emailCall = mockSendMail.mock.calls[0][0];
      expect(emailCall.html).toContain(mockVolunteer.email);
      expect(emailCall.html).toContain(mockVolunteer.phone);
      expect(emailCall.html).toContain(mockVolunteer.areasOfInterest.join(', '));
    });

    test('should handle admin notification errors', async () => {
      const nodemailer = require('nodemailer');
      nodemailer.createTransporter.mockReturnValueOnce({
        sendMail: jest.fn().mockRejectedValue(new Error('Admin email not configured'))
      });

      await expect(sendAdminNotification(mockVolunteer))
        .rejects
        .toThrow('Admin email not configured');
    });
  });

  describe('Email Templates', () => {
    test('volunteer confirmation should have proper structure', async () => {
      const nodemailer = require('nodemailer');
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-123' });
      nodemailer.createTransporter.mockReturnValueOnce({
        sendMail: mockSendMail
      });

      await sendVolunteerConfirmation(mockVolunteer);

      const emailCall = mockSendMail.mock.calls[0][0];
      
      // Check HTML structure
      expect(emailCall.html).toContain('Welcome to Our Volunteer Community!');
      expect(emailCall.html).toContain('Your Application Details:');
      expect(emailCall.html).toContain('What\'s Next?');
      expect(emailCall.html).toContain('volunteers@urjjapratishthan.org');
      
      // Check text version exists
      expect(emailCall.text).toBeTruthy();
      expect(emailCall.text).toContain(mockVolunteer.fullName);
    });

    test('admin notification should have proper structure', async () => {
      const nodemailer = require('nodemailer');
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-123' });
      nodemailer.createTransporter.mockReturnValueOnce({
        sendMail: mockSendMail
      });

      await sendAdminNotification(mockVolunteer);

      const emailCall = mockSendMail.mock.calls[0][0];
      
      // Check HTML structure
      expect(emailCall.html).toContain('New Volunteer Application');
      expect(emailCall.html).toContain('Applicant Details:');
      expect(emailCall.html).toContain('Application Date:');
      
      // Check text version exists
      expect(emailCall.text).toBeTruthy();
      expect(emailCall.text).toContain('New Volunteer Application');
    });
  });
});