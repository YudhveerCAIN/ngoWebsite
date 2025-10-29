#!/usr/bin/env node

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log("🔍 Validating Environment Configuration...\n");

// Environment validation results
const validationResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function validateRequired(value, name, description) {
  if (!value) {
    console.error(`❌ ${name}: ${description} - MISSING`);
    validationResults.failed++;
    return false;
  } else {
    console.log(`✅ ${name}: ${description} - OK`);
    validationResults.passed++;
    return true;
  }
}

function validateOptional(value, name, description) {
  if (!value) {
    console.warn(`⚠️  ${name}: ${description} - NOT SET (optional)`);
    validationResults.warnings++;
    return false;
  } else {
    console.log(`✅ ${name}: ${description} - OK`);
    validationResults.passed++;
    return true;
  }
}

console.log("📋 Environment Variables Validation:\n");

// Core application settings
console.log("🏗️  Application Configuration:");
validateRequired(process.env.APP_NAME, "APP_NAME", "Application name");
validateRequired(process.env.PORT, "PORT", "Server port");
validateRequired(process.env.NODE_ENV, "NODE_ENV", "Environment mode");

// Database configuration
console.log("\n💾 Database Configuration:");
validateRequired(process.env.MONGODB_URI, "MONGODB_URI", "MongoDB connection string");

// Authentication
console.log("\n🔐 Authentication Configuration:");
validateRequired(process.env.JWT_SECRET, "JWT_SECRET", "JWT secret key");

// JWT secret strength validation
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error(`❌ JWT_SECRET: Must be at least 32 characters long - WEAK`);
  validationResults.failed++;
} else if (process.env.JWT_SECRET) {
  console.log(`✅ JWT_SECRET: Strong secret key - OK`);
  validationResults.passed++;
}

// Email configuration
console.log("\n📧 Email Configuration:");
validateRequired(process.env.EMAIL_FROM, "EMAIL_FROM", "From email address");
validateRequired(process.env.EMAIL_USER, "EMAIL_USER", "SMTP username");
validateRequired(process.env.EMAIL_PASS, "EMAIL_PASS", "SMTP password");
validateRequired(process.env.EMAIL_HOST, "EMAIL_HOST", "SMTP host");
validateRequired(process.env.ADMIN_EMAIL_NOTIFICATIONS, "ADMIN_EMAIL_NOTIFICATIONS", "Admin notification email");

// Payment configuration
console.log("\n💳 Payment Configuration:");
validateOptional(process.env.RAZORPAY_KEY_ID, "RAZORPAY_KEY_ID", "Razorpay key ID");
validateOptional(process.env.RAZORPAY_KEY_SECRET, "RAZORPAY_KEY_SECRET", "Razorpay secret key");

// CORS configuration
console.log("\n🌐 CORS Configuration:");
validateRequired(process.env.FRONTEND_URL, "FRONTEND_URL", "Frontend URL");
validateOptional(process.env.ALLOWED_ORIGINS, "ALLOWED_ORIGINS", "Allowed origins");

// Production-specific validations
if (process.env.NODE_ENV === 'production') {
  console.log("\n🏭 Production-Specific Validations:");

  // Database URI should use MongoDB Atlas or production cluster
  if (process.env.MONGODB_URI && (process.env.MONGODB_URI.includes("localhost") || process.env.MONGODB_URI.includes("127.0.0.1"))) {
    console.error(`❌ MONGODB_URI: Should not use localhost in production - INSECURE`);
    validationResults.failed++;
  } else if (process.env.MONGODB_URI) {
    console.log(`✅ MONGODB_URI: Using remote database - OK`);
    validationResults.passed++;
  }

  // Frontend URL should use HTTPS
  if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.startsWith("https://")) {
    console.error(`❌ FRONTEND_URL: Should use HTTPS in production - INSECURE`);
    validationResults.failed++;
  } else if (process.env.FRONTEND_URL) {
    console.log(`✅ FRONTEND_URL: Using HTTPS - OK`);
    validationResults.passed++;
  }
}

// Summary
console.log("\n📊 Validation Summary:");
console.log(`✅ Passed: ${validationResults.passed}`);
console.log(`⚠️  Warnings: ${validationResults.warnings}`);
console.log(`❌ Failed: ${validationResults.failed}`);

if (validationResults.failed > 0) {
  console.log("\n❌ Environment validation failed. Please fix the issues above before proceeding.");
  process.exit(1);
} else if (validationResults.warnings > 0) {
  console.log("\n⚠️  Environment validation passed with warnings. Consider addressing the warnings for optimal configuration.");
  process.exit(0);
} else {
  console.log("\n✅ Environment validation passed successfully!");
  process.exit(0);
}