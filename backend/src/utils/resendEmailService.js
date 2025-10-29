import { Resend } from "resend";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

// Initialize Resend
let resend;
try {
  console.log("🔧 Initializing Resend email service...");
  console.log("📊 Environment check:", {
    NODE_ENV: process.env.NODE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing",
    EMAIL_FROM: process.env.EMAIL_FROM
  });

  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log("✅ Resend email service initialized successfully");
  } else {
    console.error("❌ RESEND_API_KEY not found in environment variables");
    throw new Error("RESEND_API_KEY is required but not found");
  }
} catch (error) {
  console.error("❌ Failed to initialize Resend:", error.message);
  throw error; // Don't fall back to mock, throw error instead
}

// Email templates (same as before but optimized for Resend)
const emailTemplates = {
  volunteerConfirmation: (volunteer) => ({
    subject: "Thank you for volunteering with Urjja Pratishthan Prakashalay!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to Our Volunteer Community!</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${volunteer.fullName},</p>
          
          <p>Thank you for your interest in volunteering with Urjja Pratishthan Prakashalay! We're excited about your willingness to make a difference in our community.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Application Details:</h3>
            <p><strong>Name:</strong> ${volunteer.fullName}</p>
            <p><strong>Email:</strong> ${volunteer.email}</p>
            <p><strong>Phone:</strong> ${volunteer.phone}</p>
            <p><strong>Areas of Interest:</strong> ${volunteer.areasOfInterest.join(
              ", "
            )}</p>
            <p><strong>Availability:</strong> ${volunteer.availability}</p>
            ${
              volunteer.experience
                ? `<p><strong>Experience:</strong> ${volunteer.experience}</p>`
                : ""
            }
            ${
              volunteer.message
                ? `<p><strong>Message:</strong> ${volunteer.message}</p>`
                : ""
            }
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Our team will review your application within 2-3 business days</li>
            <li>We'll contact you via email or phone to discuss volunteer opportunities</li>
            <li>You may be invited for a brief orientation session</li>
            <li>We'll match you with programs that align with your interests and availability</li>
          </ul>
          
          <p>If you have any questions in the meantime, please don't hesitate to reach out to us at <a href="mailto:volunteers@urjjapratishthan.org">volunteers@urjjapratishthan.org</a> or call us at +91 98765 43210.</p>
          
          <p>Thank you once again for your commitment to making a positive impact!</p>
          
          <p>Warm regards,<br>
          The Urjja Pratishthan Prakashalay Team</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>Urjja Pratishthan Prakashalay | Enabling Vision Through Education and Opportunity</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `
      Dear ${volunteer.fullName},
      
      Thank you for your interest in volunteering with Urjja Pratishthan Prakashalay!
      
      Your application details:
      - Name: ${volunteer.fullName}
      - Email: ${volunteer.email}
      - Phone: ${volunteer.phone}
      - Areas of Interest: ${volunteer.areasOfInterest.join(", ")}
      - Availability: ${volunteer.availability}
      ${volunteer.experience ? `- Experience: ${volunteer.experience}` : ""}
      ${volunteer.message ? `- Message: ${volunteer.message}` : ""}
      
      What's next:
      - Our team will review your application within 2-3 business days
      - We'll contact you to discuss volunteer opportunities
      - You may be invited for an orientation session
      - We'll match you with suitable programs
      
      Contact us: volunteers@urjjapratishthan.org | +91 98765 43210
      
      Thank you for your commitment to making a positive impact!
      
      The Urjja Pratishthan Prakashalay Team
    `,
  }),

  contactConfirmation: (inquiry) => ({
    subject: "Thank you for contacting Urjja Pratishthan Prakashalay!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>Thank You for Reaching Out!</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${inquiry.name},</p>
          
          <p>Thank you for contacting Urjja Pratishthan Prakashalay. We have received your message and appreciate you taking the time to reach out to us.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Message Details:</h3>
            <p><strong>Name:</strong> ${inquiry.name}</p>
            <p><strong>Email:</strong> ${inquiry.email}</p>
            ${
              inquiry.phone
                ? `<p><strong>Phone:</strong> ${inquiry.phone}</p>`
                : ""
            }
            <p><strong>Subject:</strong> ${inquiry.subject}</p>
            <p><strong>Message:</strong> ${inquiry.message}</p>
            <p><strong>Submitted:</strong> ${new Date(
              inquiry.createdAt
            ).toLocaleString()}</p>
          </div>
          
          <h3>What Happens Next?</h3>
          <ul>
            <li>Our team will review your message within 24-48 hours</li>
            <li>We'll respond to your inquiry via email or phone</li>
            <li>For urgent matters, you can call us directly at +91 98765 43210</li>
          </ul>
          
          <p>Thank you for your interest in our work!</p>
          
          <p>Warm regards,<br>
          The Urjja Pratishthan Prakashalay Team</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>Urjja Pratishthan Prakashalay | Enabling Vision Through Education and Opportunity</p>
          <p>This is an automated confirmation. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `
      Dear ${inquiry.name},
      
      Thank you for contacting Urjja Pratishthan Prakashalay. We have received your message.
      
      Your message details:
      - Name: ${inquiry.name}
      - Email: ${inquiry.email}
      ${inquiry.phone ? `- Phone: ${inquiry.phone}` : ""}
      - Subject: ${inquiry.subject}
      - Message: ${inquiry.message}
      - Submitted: ${new Date(inquiry.createdAt).toLocaleString()}
      
      What happens next:
      - Our team will review your message within 24-48 hours
      - We'll respond via email or phone
      - For urgent matters, call +91 98765 43210
      
      Thank you for your interest in our work!
      
      The Urjja Pratishthan Prakashalay Team
    `,
  }),

  adminNotification: (data, type = "volunteer") => {
    if (type === "volunteer") {
      return {
        subject: `New Volunteer Application - ${data.fullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1f2937; color: white; padding: 20px;">
              <h1>New Volunteer Application</h1>
            </div>
            
            <div style="padding: 20px;">
              <p>A new volunteer application has been submitted:</p>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Applicant Details:</h3>
                <p><strong>Name:</strong> ${data.fullName}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Areas of Interest:</strong> ${data.areasOfInterest.join(
                  ", "
                )}</p>
                <p><strong>Availability:</strong> ${data.availability}</p>
                ${
                  data.experience
                    ? `<p><strong>Experience:</strong> ${data.experience}</p>`
                    : ""
                }
                ${
                  data.message
                    ? `<p><strong>Message:</strong> ${data.message}</p>`
                    : ""
                }
                <p><strong>Application Date:</strong> ${new Date(
                  data.createdAt
                ).toLocaleString()}</p>
              </div>
              
              <p>Please review this application in the admin panel and follow up with the applicant.</p>
            </div>
          </div>
        `,
        text: `
          New Volunteer Application
          
          Applicant: ${data.fullName}
          Email: ${data.email}
          Phone: ${data.phone}
          Areas of Interest: ${data.areasOfInterest.join(", ")}
          Availability: ${data.availability}
          ${data.experience ? `Experience: ${data.experience}` : ""}
          ${data.message ? `Message: ${data.message}` : ""}
          Application Date: ${new Date(data.createdAt).toLocaleString()}
          
          Please review this application in the admin panel.
        `,
      };
    } else if (type === "contact") {
      return {
        subject: `New Contact Inquiry - ${data.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1f2937; color: white; padding: 20px;">
              <h1>New Contact Inquiry</h1>
            </div>
            
            <div style="padding: 20px;">
              <p>A new contact inquiry has been submitted:</p>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Inquiry Details:</h3>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                ${
                  data.phone
                    ? `<p><strong>Phone:</strong> ${data.phone}</p>`
                    : ""
                }
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background-color: white; padding: 10px; border-left: 4px solid #3b82f6; margin: 10px 0;">
                  ${data.message}
                </div>
                <p><strong>Submitted:</strong> ${new Date(
                  data.createdAt
                ).toLocaleString()}</p>
              </div>
              
              <p>Please review this inquiry and respond within 24-48 hours.</p>
            </div>
          </div>
        `,
        text: `
          New Contact Inquiry
          
          Contact Details:
          - Name: ${data.name}
          - Email: ${data.email}
          ${data.phone ? `- Phone: ${data.phone}` : ""}
          - Subject: ${data.subject}
          - Message: ${data.message}
          - Submitted: ${new Date(data.createdAt).toLocaleString()}
          
          Please review this inquiry and respond within 24-48 hours.
        `,
      };
    }
  },
};

// Resend email service - no mock fallback

// Email sending functions using Resend
export const sendVolunteerConfirmation = async (volunteer) => {
  try {
    console.log(
      "📧 Preparing volunteer confirmation email for:",
      volunteer.email
    );
    const template = emailTemplates.volunteerConfirmation(volunteer);

    if (!resend) {
      throw new Error("Resend email service is not initialized");
    }

    console.log("📤 Sending volunteer confirmation email via Resend...");
    const result = await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        "Urjja Pratishthan <noreply@urjjapratishthan.org>",
      to: [volunteer.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log("✅ Volunteer confirmation email sent successfully!");
    console.log("📧 Message ID:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Error sending volunteer confirmation email:", error);
    console.error("📝 Error details:", error.message);
    throw error;
  }
};

export const sendContactConfirmation = async (inquiry) => {
  try {
    console.log("📧 Preparing contact confirmation email for:", inquiry.email);
    const template = emailTemplates.contactConfirmation(inquiry);

    if (!resend) {
      throw new Error("Resend email service is not initialized");
    }

    console.log("📤 Sending contact confirmation email via Resend...");
    const result = await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        "Urjja Pratishthan <noreply@urjjapratishthan.org>",
      to: [inquiry.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log("✅ Contact confirmation email sent successfully!");
    console.log("📧 Message ID:", result.data?.id || result.id);
    console.log("📨 Full response:", result);
    return result;
  } catch (error) {
    console.error("❌ Error sending contact confirmation email:", error);
    console.error("📝 Error details:", error.message);
    throw error;
  }
};

export const sendAdminNotification = async (data, type = "volunteer") => {
  try {
    const dataName = type === "volunteer" ? data.fullName : data.name;
    console.log(`📧 Preparing admin notification email for ${type}:`, dataName);
    const template = emailTemplates.adminNotification(data, type);

    const adminEmail =
      process.env.ADMIN_EMAIL_NOTIFICATIONS ||
      process.env.ADMIN_EMAIL ||
      "admin@urjjapratishthan.org";

    if (!resend) {
      throw new Error("Resend email service is not initialized");
    }

    console.log("📤 Sending admin notification email via Resend...");
    const result = await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        "Urjja Pratishthan <noreply@urjjapratishthan.org>",
      to: [adminEmail],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log("✅ Admin notification email sent successfully!");
    console.log("📧 Message ID:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Error sending admin notification email:", error);
    console.error("📝 Error details:", error.message);
    throw error;
  }
};

export const sendContactNotification = async (inquiry) => {
  return await sendAdminNotification(inquiry, "contact");
};

// Test function
export const testResendConnection = async () => {
  try {
    if (!resend) {
      return { success: false, error: "Resend API key not configured" };
    }

    // Test with a simple email
    const result = await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        "Urjja Pratishthan <noreply@urjjapratishthan.org>",
      to: ["test@example.com"], // This won't actually send
      subject: "Test Email",
      html: "<p>This is a test email</p>",
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  sendVolunteerConfirmation,
  sendContactConfirmation,
  sendAdminNotification,
  sendContactNotification,
  testResendConnection,
};
