import express from "express";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { applySecurity } from "./middleware/security.js";
import impactRouter from "./routes/impactRoutes.js";
import aboutRouter from "./routes/aboutRoutes.js";
import donationRouter from "./routes/donationRoutes.js";
import volunteerRouter from "./routes/volunteerRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import authRouter from "./routes/authRoutes.js";

const app = express();

applySecurity(app);
app.use(express.json());

// Morgan logging based on environment
if (process.env.ENABLE_MORGAN_LOGGING === "true") {
  app.use(morgan("dev"));
}

// Root route for Render health check
app.get("/", (req, res) => {
  res.json({
    message: "Urjja Pratishthan Prakashalay API",
    status: "running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      impact: "/api/impact",
      about: "/api/about",
      donations: "/api/donations",
      volunteers: "/api/volunteers",
      contact: "/api/contact",
    },
  });
});

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Simple ping endpoint
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Email diagnostic endpoint (remove after debugging)
app.get("/api/debug/email", (req, res) => {
  const emailConfig = {
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_SECURE: process.env.EMAIL_SECURE,
    EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
    EMAIL_PASS: process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing",
    EMAIL_FROM: process.env.EMAIL_FROM,
    ADMIN_EMAIL_NOTIFICATIONS: process.env.ADMIN_EMAIL_NOTIFICATIONS,
    FEATURE_EMAIL_NOTIFICATIONS: process.env.FEATURE_EMAIL_NOTIFICATIONS,
  };

  res.json({
    message: "Email Configuration Debug",
    config: emailConfig,
    timestamp: new Date().toISOString(),
  });
});

// Test email endpoint (remove after debugging)
app.post("/api/debug/test-email", async (req, res) => {
  try {
    const { sendContactConfirmation } = await import("./utils/emailService.js");
    
    const testInquiry = {
      name: "Test User",
      email: req.body.email || "test@example.com",
      subject: "Test Email",
      message: "This is a test email to verify email functionality.",
      createdAt: new Date()
    };

    await sendContactConfirmation(testInquiry);
    
    res.json({
      success: true,
      message: "Test email sent successfully",
      sentTo: testInquiry.email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Test email failed:", error);
    res.status(500).json({
      success: false,
      message: "Test email failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Alternative email test endpoint
app.post("/api/debug/test-alt-email", async (req, res) => {
  try {
    const { testEmailConnection } = await import("./utils/alternativeEmailService.js");
    
    const result = await testEmailConnection();
    
    res.json({
      success: result.success,
      emailService: result.type,
      testAccount: result.account,
      error: result.error,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Alternative email test failed:", error);
    res.status(500).json({
      success: false,
      message: "Alternative email test failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Resend email test endpoint
app.post("/api/debug/test-resend", async (req, res) => {
  try {
    const { sendContactConfirmation } = await import("./utils/resendEmailService.js");
    
    const testInquiry = {
      name: "Test User",
      email: req.body.email || "yudhveerdewal12@gmail.com",
      subject: "Test Email via Resend",
      message: "This is a test email to verify Resend email functionality.",
      createdAt: new Date()
    };

    const result = await sendContactConfirmation(testInquiry);
    
    res.json({
      success: true,
      message: "Test email sent via Resend successfully",
      messageId: result.id,
      sentTo: testInquiry.email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Resend test email failed:", error);
    res.status(500).json({
      success: false,
      message: "Resend test email failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/impact", impactRouter);
app.use("/api/about", aboutRouter);
app.use("/api/donations", donationRouter);
app.use("/api/volunteers", volunteerRouter);
app.use("/api/contact", contactRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
