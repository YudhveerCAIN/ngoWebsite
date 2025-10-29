import axios from "axios";
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Brevo email sending function
export const sendMail = async (to, subject, htmlContent) => {
  try {
    console.log(`📧 Sending email via Brevo to: ${to}`);
    console.log(`📋 Subject: ${subject}`);
    
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { 
          name: "Urjja Pratishthan Prakashalay", 
          email: "urjjapratishthan@gmail.com" 
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          "accept": "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully via Brevo:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Brevo email send failed:", error.response?.data || error.message);
    throw new Error("Failed to send email via Brevo");
  }
};

// Email templates
const emailTemplates = {
  volunteerConfirmation: (volunteer) => ({
    subject: 'Thank you for volunteering with Urjja Pratishthan Prakashalay!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to Our Volunteer Community!</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${volunteer.fullName},</p>
          
          <p>Thank you for your interest in volunteering with Urjja Pratishthan Prakashalay!</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Application Details:</h3>
            <p><strong>Name:</strong> ${volunteer.fullName}</p>
            <p><strong>Email:</strong> ${volunteer.email}</p>
            <p><strong>Phone:</strong> ${volunteer.phone}</p>
            <p><strong>Areas of Interest:</strong> ${volunteer.areasOfInterest.join(', ')}</p>
            <p><strong>Availability:</strong> ${volunteer.availability}</p>
          </div>
          
          <p>Our team will review your application within 2-3 business days.</p>
          
          <p>Warm regards,<br>The Urjja Pratishthan Prakashalay Team</p>
        </div>
      </div>
    `
  }),  
contactConfirmation: (inquiry) => ({
    subject: 'Thank you for contacting Urjja Pratishthan Prakashalay!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>Thank You for Reaching Out!</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${inquiry.name},</p>
          
          <p>Thank you for contacting Urjja Pratishthan Prakashalay. We have received your message.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Message Details:</h3>
            <p><strong>Name:</strong> ${inquiry.name}</p>
            <p><strong>Email:</strong> ${inquiry.email}</p>
            <p><strong>Subject:</strong> ${inquiry.subject}</p>
            <p><strong>Message:</strong> ${inquiry.message}</p>
          </div>
          
          <p>Our team will review your message within 24-48 hours and respond accordingly.</p>
          
          <p>Warm regards,<br>The Urjja Pratishthan Prakashalay Team</p>
        </div>
      </div>
    `
  }),

  adminNotification: (data, type = 'volunteer') => {
    if (type === 'volunteer') {
      return {
        subject: `New Volunteer Application - ${data.fullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1f2937; color: white; padding: 20px;">
              <h1>New Volunteer Application</h1>
            </div>
            
            <div style="padding: 20px;">
              <p>A new volunteer application has been submitted:</p>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
                <h3>Applicant Details:</h3>
                <p><strong>Name:</strong> ${data.fullName}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Areas of Interest:</strong> ${data.areasOfInterest.join(', ')}</p>
                <p><strong>Availability:</strong> ${data.availability}</p>
              </div>
              
              <p>Please review this application in the admin panel.</p>
            </div>
          </div>
        `
      };
    } else {
      return {
        subject: `New Contact Inquiry - ${data.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1f2937; color: white; padding: 20px;">
              <h1>New Contact Inquiry</h1>
            </div>
            
            <div style="padding: 20px;">
              <p>A new contact inquiry has been submitted:</p>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
                <h3>Inquiry Details:</h3>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Message:</strong> ${data.message}</p>
              </div>
              
              <p>Please review and respond within 24-48 hours.</p>
            </div>
          </div>
        `
      };
    }
  }
};

// Email service functions
export const sendVolunteerConfirmation = async (volunteer) => {
  try {
    const template = emailTemplates.volunteerConfirmation(volunteer);
    return await sendMail(volunteer.email, template.subject, template.html);
  } catch (error) {
    console.error('❌ Error sending volunteer confirmation:', error);
    throw error;
  }
};

export const sendContactConfirmation = async (inquiry) => {
  try {
    const template = emailTemplates.contactConfirmation(inquiry);
    return await sendMail(inquiry.email, template.subject, template.html);
  } catch (error) {
    console.error('❌ Error sending contact confirmation:', error);
    throw error;
  }
};

export const sendAdminNotification = async (data, type = 'volunteer') => {
  try {
    const template = emailTemplates.adminNotification(data, type);
    const adminEmail = process.env.ADMIN_EMAIL_NOTIFICATIONS || 'urjjapratishthan@gmail.com';
    return await sendMail(adminEmail, template.subject, template.html);
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    throw error;
  }
};

export const sendContactNotification = async (inquiry) => {
  return await sendAdminNotification(inquiry, 'contact');
};

export default {
  sendMail,
  sendVolunteerConfirmation,
  sendContactConfirmation,
  sendAdminNotification,
  sendContactNotification,
};