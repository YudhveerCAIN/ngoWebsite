import nodemailer from "nodemailer";

// Alternative email service using Ethereal (for testing) or other providers
export const createAlternativeTransporter = async () => {
  console.log("🔧 Creating alternative email transporter...");

  // Option 1: Try Gmail with different configuration
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log("📧 Trying Gmail with OAuth2-like configuration...");

    try {
      const transporter = nodemailer.createTransporter({
        service: "gmail", // Use service instead of host/port
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Test the connection
      await transporter.verify();
      console.log("✅ Gmail service transporter verified");
      return transporter;
    } catch (error) {
      console.log("❌ Gmail service failed:", error.message);
    }
  }

  // Option 2: Create test account with Ethereal
  console.log("📧 Creating Ethereal test account...");
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log("✅ Ethereal test account created:", testAccount.user);

    const transporter = nodemailer.createTransporter({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return {
      transporter,
      previewUrl: true, // Flag to show preview URLs
      testAccount,
    };
  } catch (error) {
    console.log("❌ Ethereal failed:", error.message);
  }

  // Option 3: Mock transporter
  console.log("📧 Using mock transporter...");
  return {
    transporter: {
      sendMail: async (options) => {
        console.log("📧 Mock email would be sent:");
        console.log("  To:", options.to);
        console.log("  Subject:", options.subject);
        console.log("  From:", options.from);
        return {
          messageId: "mock-" + Date.now(),
          accepted: [options.to],
          rejected: [],
        };
      },
    },
    mock: true,
  };
};

// Test email function
export const testEmailConnection = async () => {
  try {
    const result = await createAlternativeTransporter();

    if (result.mock) {
      console.log("📧 Using mock email service");
      return { success: true, type: "mock" };
    }

    if (result.previewUrl) {
      console.log("📧 Using Ethereal test service");
      return { success: true, type: "ethereal", account: result.testAccount };
    }

    console.log("📧 Using Gmail service");
    return { success: true, type: "gmail" };
  } catch (error) {
    console.error("❌ Email connection test failed:", error);
    return { success: false, error: error.message };
  }
};

export default { createAlternativeTransporter, testEmailConnection };
