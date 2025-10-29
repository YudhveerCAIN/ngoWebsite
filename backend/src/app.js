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

// Test Brevo email endpoint (remove after testing)
app.post("/api/test-brevo", async (req, res) => {
  try {
    const { sendMail } = await import("./utils/brevoEmailService.js");
    
    const testEmail = req.body.email || "yudhveerdewal12@gmail.com";
    const result = await sendMail(
      testEmail,
      "Test Email from Urjja Pratishthan",
      "<p>This is a test email to verify Brevo integration is working!</p><p>If you receive this, the email service is working correctly.</p>"
    );
    
    res.json({
      success: true,
      message: "Test email sent via Brevo successfully",
      result: result,
      sentTo: testEmail,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Brevo test email failed:", error);
    res.status(500).json({
      success: false,
      message: "Brevo test email failed",
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
