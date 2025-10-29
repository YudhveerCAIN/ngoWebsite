import nodemailer from "nodemailer";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

// Create transporter based on environment
const createTransporter = () => {
  console.log("🔧 Creating email transporter...");
  console.log("📊 Environment check:", {
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
    EMAIL_PASS: process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing",
    EMAIL_FROM: process.env.EMAIL_FROM,
  });

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log("📧 Creating Gmail SMTP transporter...");
    // Production email configuration for Gmail
    // Try port 465 with SSL first, fallback to 587
    const useSSL = process.env.EMAIL_USE_SSL !== 'false';
    const port = useSSL ? 465 : 587;
    
    console.log(`🔧 Using SMTP port ${port} (SSL: ${useSSL})`);
    
    return nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: port,
      secure: useSSL, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, // 60 seconds
      debug: true,
      logger: true
    });
  } else {
    console.log("⚠️ Email credentials missing - using mock transporter");
    // Development - use a test transporter that doesn't actually send emails
    return nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }
};

let transporter;
try {
  transporter = createTransporter();
  console.log("✅ Email transporter created successfully");
} catch (error) {
  console.error("❌ Email transporter initialization failed:", error.message);
  // Create a mock transporter for development
  transporter = {
    sendMail: async (options) => {
      console.log("🔄 Mock email sent:", {
        to: options.to,
        subject: options.subject,
        messageId: "mock-" + Date.now(),
      });
      return { messageId: "mock-" + Date.now() };
    },
  };
}

// Email templates
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

  donationReceipt: (donation) => ({
    subject: `Donation Receipt - Thank you for your contribution!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>Thank You for Your Donation!</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${donation.fullName},</p>
          
          <p>Thank you for your generous donation to Urjja Pratishthan Prakashalay. Your contribution will help us continue our mission to empower communities through education and opportunity.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Donation Receipt</h3>
            <p><strong>Receipt ID:</strong> ${donation._id}</p>
            <p><strong>Donor Name:</strong> ${donation.fullName}</p>
            <p><strong>Email:</strong> ${donation.email}</p>
            <p><strong>Amount:</strong> ₹${donation.amountInInr.toLocaleString()}</p>
            <p><strong>Date:</strong> ${new Date(
              donation.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Transaction ID:</strong> ${
              donation.transactionId || "Pending"
            }</p>
            <p><strong>Payment Status:</strong> ${donation.paymentStatus}</p>
            ${
              donation.recurring
                ? `<p><strong>Recurring:</strong> ${donation.frequency}</p>`
                : ""
            }
            ${
              donation.message
                ? `<p><strong>Message:</strong> ${donation.message}</p>`
                : ""
            }
          </div>
          
          <h3>Tax Benefits</h3>
          <p>This donation is eligible for tax deduction under Section 80G of the Income Tax Act. Please retain this receipt for your tax filing purposes.</p>
          
          <h3>How Your Donation Helps</h3>
          <ul>
            <li>Provides educational resources and scholarships</li>
            <li>Supports community development programs</li>
            <li>Funds skill development initiatives</li>
            <li>Enables outreach activities in underserved areas</li>
          </ul>
          
          <p>We will keep you updated on how your contribution is making a difference in our community.</p>
          
          <p>If you have any questions about your donation, please contact us at <a href="mailto:donations@urjjapratishthan.org">donations@urjjapratishthan.org</a> or call us at +91 98765 43210.</p>
          
          <p>With gratitude,<br>
          The Urjja Pratishthan Prakashalay Team</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>Urjja Pratishthan Prakashalay | Enabling Vision Through Education and Opportunity</p>
          <p>This is an automated receipt. Please save this email for your records.</p>
        </div>
      </div>
    `,
    text: `
      Dear ${donation.fullName},
      
      Thank you for your generous donation to Urjja Pratishthan Prakashalay!
      
      Donation Receipt:
      - Receipt ID: ${donation._id}
      - Donor Name: ${donation.fullName}
      - Email: ${donation.email}
      - Amount: ₹${donation.amountInInr.toLocaleString()}
      - Date: ${new Date(donation.createdAt).toLocaleDateString()}
      - Transaction ID: ${donation.transactionId || "Pending"}
      - Payment Status: ${donation.paymentStatus}
      ${donation.recurring ? `- Recurring: ${donation.frequency}` : ""}
      ${donation.message ? `- Message: ${donation.message}` : ""}
      
      Tax Benefits:
      This donation is eligible for tax deduction under Section 80G of the Income Tax Act.
      
      Contact us: donations@urjjapratishthan.org | +91 98765 43210
      
      Thank you for supporting our mission!
      
      The Urjja Pratishthan Prakashalay Team
    `,
  }),

  donationNotification: (donation) => ({
    subject: `New Donation Received - ₹${donation.amountInInr.toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1f2937; color: white; padding: 20px;">
          <h1>New Donation Received</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>A new donation has been received:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Donation Details:</h3>
            <p><strong>Donor Name:</strong> ${donation.fullName}</p>
            <p><strong>Email:</strong> ${donation.email}</p>
            ${
              donation.phone
                ? `<p><strong>Phone:</strong> ${donation.phone}</p>`
                : ""
            }
            <p><strong>Amount:</strong> ₹${donation.amountInInr.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${donation.paymentProvider}</p>
            <p><strong>Payment Status:</strong> ${donation.paymentStatus}</p>
            <p><strong>Transaction ID:</strong> ${
              donation.transactionId || "Pending"
            }</p>
            ${
              donation.recurring
                ? `<p><strong>Recurring:</strong> ${donation.frequency}</p>`
                : ""
            }
            ${
              donation.message
                ? `<p><strong>Message:</strong> ${donation.message}</p>`
                : ""
            }
            <p><strong>Donation Date:</strong> ${new Date(
              donation.createdAt
            ).toLocaleString()}</p>
          </div>
          
          <p>Please follow up with the donor if needed and update the donation records in the admin panel.</p>
        </div>
      </div>
    `,
    text: `
      New Donation Received
      
      Donor: ${donation.fullName}
      Email: ${donation.email}
      ${donation.phone ? `Phone: ${donation.phone}` : ""}
      Amount: ₹${donation.amountInInr.toLocaleString()}
      Payment Method: ${donation.paymentProvider}
      Payment Status: ${donation.paymentStatus}
      Transaction ID: ${donation.transactionId || "Pending"}
      ${donation.recurring ? `Recurring: ${donation.frequency}` : ""}
      ${donation.message ? `Message: ${donation.message}` : ""}
      Donation Date: ${new Date(donation.createdAt).toLocaleString()}
      
      Please review this donation in the admin panel.
    `,
  }),

  adminNotification: (volunteer) => ({
    subject: `New Volunteer Application - ${volunteer.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1f2937; color: white; padding: 20px;">
          <h1>New Volunteer Application</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>A new volunteer application has been submitted:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Applicant Details:</h3>
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
            <p><strong>Application Date:</strong> ${new Date(
              volunteer.createdAt
            ).toLocaleString()}</p>
          </div>
          
          <p>Please review this application in the admin panel and follow up with the applicant.</p>
        </div>
      </div>
    `,
    text: `
      New Volunteer Application
      
      Applicant: ${volunteer.fullName}
      Email: ${volunteer.email}
      Phone: ${volunteer.phone}
      Areas of Interest: ${volunteer.areasOfInterest.join(", ")}
      Availability: ${volunteer.availability}
      ${volunteer.experience ? `Experience: ${volunteer.experience}` : ""}
      ${volunteer.message ? `Message: ${volunteer.message}` : ""}
      Application Date: ${new Date(volunteer.createdAt).toLocaleString()}
      
      Please review this application in the admin panel.
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
          
          <p>In the meantime, feel free to explore our website to learn more about our programs and initiatives:</p>
          <ul>
            <li><strong>About Us:</strong> Learn about our mission and impact</li>
            <li><strong>Programs:</strong> Discover our education and community programs</li>
            <li><strong>Get Involved:</strong> Find volunteer opportunities</li>
            <li><strong>Donate:</strong> Support our cause</li>
          </ul>
          
          <p>If you have any additional questions or need immediate assistance, please don't hesitate to contact us:</p>
          <p>📧 Email: <a href="mailto:info@urjjapratishthan.org">info@urjjapratishthan.org</a><br>
          📞 Phone: +91 98765 43210<br>
          🕒 Office Hours: Monday-Friday 9:00 AM - 6:00 PM</p>
          
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
      
      Contact us:
      Email: info@urjjapratishthan.org
      Phone: +91 98765 43210
      Office Hours: Monday-Friday 9:00 AM - 6:00 PM
      
      Thank you for your interest in our work!
      
      The Urjja Pratishthan Prakashalay Team
    `,
  }),

  contactNotification: (inquiry) => ({
    subject: `New Contact Inquiry - ${inquiry.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1f2937; color: white; padding: 20px;">
          <h1>New Contact Inquiry</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>A new contact inquiry has been submitted through the website:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Inquiry Details:</h3>
            <p><strong>Name:</strong> ${inquiry.name}</p>
            <p><strong>Email:</strong> ${inquiry.email}</p>
            ${
              inquiry.phone
                ? `<p><strong>Phone:</strong> ${inquiry.phone}</p>`
                : ""
            }
            <p><strong>Subject:</strong> ${inquiry.subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 10px; border-left: 4px solid #3b82f6; margin: 10px 0;">
              ${inquiry.message}
            </div>
            <p><strong>Submitted:</strong> ${new Date(
              inquiry.createdAt
            ).toLocaleString()}</p>
            <p><strong>Status:</strong> ${inquiry.status}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h4 style="margin-top: 0; color: #92400e;">Action Required</h4>
            <p style="color: #92400e; margin-bottom: 0;">Please review this inquiry in the admin panel and respond within 24-48 hours.</p>
          </div>
          
          <p style="margin-top: 20px;">
            <strong>Quick Actions:</strong><br>
            • Review in admin panel<br>
            • Respond via email: <a href="mailto:${inquiry.email}">${
      inquiry.email
    }</a><br>
            ${inquiry.phone ? `• Call: ${inquiry.phone}<br>` : ""}
            • Update inquiry status after response
          </p>
        </div>
      </div>
    `,
    text: `
      New Contact Inquiry
      
      Contact Details:
      - Name: ${inquiry.name}
      - Email: ${inquiry.email}
      ${inquiry.phone ? `- Phone: ${inquiry.phone}` : ""}
      - Subject: ${inquiry.subject}
      - Message: ${inquiry.message}
      - Submitted: ${new Date(inquiry.createdAt).toLocaleString()}
      - Status: ${inquiry.status}
      
      Action Required:
      Please review this inquiry in the admin panel and respond within 24-48 hours.
      
      Quick Actions:
      • Review in admin panel
      • Respond via email: ${inquiry.email}
      ${inquiry.phone ? `• Call: ${inquiry.phone}` : ""}
      • Update inquiry status after response
    `,
  }),
};

// Email sending functions
export const sendVolunteerConfirmation = async (volunteer) => {
  try {
    console.log(
      "📧 Preparing volunteer confirmation email for:",
      volunteer.email
    );
    const template = emailTemplates.volunteerConfirmation(volunteer);

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@urjjapratishthan.org",
      to: volunteer.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    console.log("📤 Sending volunteer confirmation email...");
    console.log("📋 Mail options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const result = await transporter.sendMail(mailOptions);
    console.log(
      "✅ Volunteer confirmation email sent successfully:",
      result.messageId
    );
    return result;
  } catch (error) {
    console.error("❌ Error sending volunteer confirmation email:", error);
    console.error("📝 Error details:", error.message);
    console.error("🔍 Full error:", error);
    throw error;
  }
};

export const sendAdminNotification = async (volunteer) => {
  try {
    console.log(
      "📧 Preparing admin notification email for volunteer:",
      volunteer.fullName
    );
    const template = emailTemplates.adminNotification(volunteer);

    const adminEmail =
      process.env.ADMIN_EMAIL_NOTIFICATIONS ||
      process.env.ADMIN_EMAIL ||
      "admin@urjjapratishthan.org";
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@urjjapratishthan.org",
      to: adminEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    console.log("📤 Sending admin notification email...");
    console.log("📋 Mail options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const result = await transporter.sendMail(mailOptions);
    console.log(
      "✅ Admin notification email sent successfully:",
      result.messageId
    );
    return result;
  } catch (error) {
    console.error("❌ Error sending admin notification email:", error);
    console.error("📝 Error details:", error.message);
    console.error("🔍 Full error:", error);
    throw error;
  }
};

export const sendDonationReceipt = async (donation) => {
  try {
    const template = emailTemplates.donationReceipt(donation);

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@urjjapratishthan.org",
      to: donation.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Donation receipt email sent:", result.messageId);

    // Mark receipt as sent
    await mongoose.model("Donation").findByIdAndUpdate(donation._id, {
      receiptSent: true,
    });

    return result;
  } catch (error) {
    console.error("Error sending donation receipt email:", error);
    throw error;
  }
};

export const sendDonationNotification = async (donation) => {
  try {
    const template = emailTemplates.donationNotification(donation);

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@urjjapratishthan.org",
      to:
        process.env.ADMIN_EMAIL_NOTIFICATIONS ||
        process.env.ADMIN_EMAIL ||
        "admin@urjjapratishthan.org",
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Donation notification email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending donation notification email:", error);
    throw error;
  }
};

export const sendContactConfirmation = async (inquiry) => {
  try {
    console.log("📧 Preparing contact confirmation email for:", inquiry.email);
    const template = emailTemplates.contactConfirmation(inquiry);

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@urjjapratishthan.org",
      to: inquiry.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    console.log("📤 Sending contact confirmation email...");
    console.log("📋 Mail options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Contact confirmation email sent successfully!");
    console.log("📧 Message ID:", result.messageId);
    console.log("📨 Response:", result.response);
    console.log("📬 Accepted:", result.accepted);
    console.log("🚫 Rejected:", result.rejected);
    return result;
  } catch (error) {
    console.error("❌ Error sending contact confirmation email:", error);
    console.error("📝 Error details:", error.message);
    console.error("🔍 Full error:", error);
    throw error;
  }
};

export const sendContactNotification = async (inquiry) => {
  try {
    console.log(
      "📧 Preparing contact notification email for inquiry:",
      inquiry.subject
    );
    const template = emailTemplates.contactNotification(inquiry);

    const adminEmail =
      process.env.ADMIN_EMAIL_NOTIFICATIONS ||
      process.env.ADMIN_EMAIL ||
      "admin@urjjapratishthan.org";
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@urjjapratishthan.org",
      to: adminEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    console.log("📤 Sending contact notification email...");
    console.log("📋 Mail options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Contact notification email sent successfully!");
    console.log("📧 Message ID:", result.messageId);
    console.log("📨 Response:", result.response);
    console.log("📬 Accepted:", result.accepted);
    console.log("🚫 Rejected:", result.rejected);
    return result;
  } catch (error) {
    console.error("❌ Error sending contact notification email:", error);
    console.error("📝 Error details:", error.message);
    console.error("🔍 Full error:", error);
    throw error;
  }
};

export default {
  sendVolunteerConfirmation,
  sendAdminNotification,
  sendDonationReceipt,
  sendDonationNotification,
  sendContactConfirmation,
  sendContactNotification,
};
