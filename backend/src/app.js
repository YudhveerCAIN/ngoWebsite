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
