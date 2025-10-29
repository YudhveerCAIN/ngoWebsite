#!/usr/bin/env node

/**
 * Frontend Environment Validation Script
 * 
 * Validates that all required environment variables are properly configured
 * for the frontend application.
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Validating Frontend Environment Configuration...\n');

// Load environment variables
const mode = process.env.NODE_ENV || 'development';
const envFile = `.env${mode === 'production' ? '.production' : ''}`;

let envVars = {};

// Read environment file if it exists
if (fs.existsSync(envFile)) {
	const envContent = fs.readFileSync(envFile, 'utf8');
	envContent.split('\n').forEach(line => {
		const [key, ...valueParts] = line.split('=');
		if (key && key.startsWith('VITE_')) {
			envVars[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
		}
	});
}

// Also check process.env for any VITE_ variables
Object.keys(process.env).forEach(key => {
	if (key.startsWith('VITE_')) {
		envVars[key] = process.env[key];
	}
});

console.log(`Environment Mode: ${mode}`);
console.log(`Environment File: ${envFile}\n`);

// Validation results
const validationResults = {
	passed: 0,
	failed: 0,
	warnings: 0
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

function validateUrl(value, name, description) {
	if (!value) {
		console.error(`❌ ${name}: ${description} - MISSING`);
		validationResults.failed++;
		return false;
	}
	
	try {
		new URL(value);
		console.log(`✅ ${name}: ${description} - OK`);
		validationResults.passed++;
		return true;
	} catch {
		console.error(`❌ ${name}: ${description} - INVALID URL FORMAT`);
		validationResults.failed++;
		return false;
	}
}

// Core application settings
console.log('🏗️  Application Configuration:');
validateRequired(envVars.VITE_APP_NAME, 'VITE_APP_NAME', 'Application name');
validateOptional(envVars.VITE_APP_VERSION, 'VITE_APP_VERSION', 'Application version');

// API configuration
console.log('\n🌐 API Configuration:');
validateUrl(envVars.VITE_API_URL, 'VITE_API_URL', 'Backend API URL');
validateOptional(envVars.VITE_API_TIMEOUT, 'VITE_API_TIMEOUT', 'API request timeout');

// Payment configuration
console.log('\n💳 Payment Configuration:');
if (envVars.VITE_FEATURE_DONATION_PROCESSING !== 'false') {
	if (mode === 'production') {
		validateRequired(envVars.VITE_RAZORPAY_KEY_ID, 'VITE_RAZORPAY_KEY_ID', 'Razorpay public key');
		
		// Validate Razorpay key format
		if (envVars.VITE_RAZORPAY_KEY_ID) {
			if (mode === 'production' && !envVars.VITE_RAZORPAY_KEY_ID.startsWith('rzp_live_')) {
				console.error(`❌ VITE_RAZORPAY_KEY_ID: Should use live key (rzp_live_) in production - INSECURE`);
				validationResults.failed++;
			} else if (mode === 'development' && !envVars.VITE_RAZORPAY_KEY_ID.startsWith('rzp_test_')) {
				console.warn(`⚠️  VITE_RAZORPAY_KEY_ID: Consider using test key (rzp_test_) in development`);
				validationResults.warnings++;
			} else {
				console.log(`✅ VITE_RAZORPAY_KEY_ID: Correct key type for ${mode} - OK`);
				validationResults.passed++;
			}
		}
	} else {
		validateOptional(envVars.VITE_RAZORPAY_KEY_ID, 'VITE_RAZORPAY_KEY_ID', 'Razorpay public key (dev mode)');
	}
	
	validateOptional(envVars.VITE_CURRENCY, 'VITE_CURRENCY', 'Payment currency');
	validateOptional(envVars.VITE_MIN_DONATION_AMOUNT, 'VITE_MIN_DONATION_AMOUNT', 'Minimum donation amount');
}

// Contact information
console.log('\n📞 Contact Information:');
validateRequired(envVars.VITE_CONTACT_EMAIL, 'VITE_CONTACT_EMAIL', 'Contact email address');
validateOptional(envVars.VITE_CONTACT_PHONE, 'VITE_CONTACT_PHONE', 'Contact phone number');
validateOptional(envVars.VITE_CONTACT_ADDRESS, 'VITE_CONTACT_ADDRESS', 'Contact address');

// Social media links
console.log('\n📱 Social Media Configuration:');
validateOptional(envVars.VITE_FACEBOOK_URL, 'VITE_FACEBOOK_URL', 'Facebook page URL');
validateOptional(envVars.VITE_TWITTER_URL, 'VITE_TWITTER_URL', 'Twitter profile URL');
validateOptional(envVars.VITE_INSTAGRAM_URL, 'VITE_INSTAGRAM_URL', 'Instagram profile URL');
validateOptional(envVars.VITE_LINKEDIN_URL, 'VITE_LINKEDIN_URL', 'LinkedIn profile URL');

// Analytics configuration
console.log('\n📊 Analytics Configuration:');
if (mode === 'production') {
	validateOptional(envVars.VITE_GA_TRACKING_ID, 'VITE_GA_TRACKING_ID', 'Google Analytics tracking ID');
	validateOptional(envVars.VITE_FB_PIXEL_ID, 'VITE_FB_PIXEL_ID', 'Facebook Pixel ID');
	validateOptional(envVars.VITE_GTM_ID, 'VITE_GTM_ID', 'Google Tag Manager ID');
} else {
	console.log('ℹ️  Analytics validation skipped in development mode');
}

// External services
console.log('\n🔌 External Services:');
validateOptional(envVars.VITE_GOOGLE_MAPS_API_KEY, 'VITE_GOOGLE_MAPS_API_KEY', 'Google Maps API key');
validateOptional(envVars.VITE_CLOUDINARY_CLOUD_NAME, 'VITE_CLOUDINARY_CLOUD_NAME', 'Cloudinary cloud name');

// Feature flags
console.log('\n🚀 Feature Flags:');
const featureFlags = [
	'VITE_FEATURE_VOLUNTEER_REGISTRATION',
	'VITE_FEATURE_DONATION_PROCESSING',
	'VITE_FEATURE_EVENT_REGISTRATION',
	'VITE_FEATURE_CONTACT_FORM',
	'VITE_FEATURE_DARK_MODE',
	'VITE_FEATURE_ANIMATIONS'
];

featureFlags.forEach(flag => {
	const value = envVars[flag];
	const enabled = value !== 'false' && value !== false;
	console.log(`${enabled ? '✅' : '❌'} ${flag}: ${enabled ? 'Enabled' : 'Disabled'}`);
	validationResults.passed++;
});

// SEO configuration
console.log('\n🔍 SEO Configuration:');
validateRequired(envVars.VITE_META_TITLE, 'VITE_META_TITLE', 'Default page title');
validateRequired(envVars.VITE_META_DESCRIPTION, 'VITE_META_DESCRIPTION', 'Default meta description');
validateOptional(envVars.VITE_META_KEYWORDS, 'VITE_META_KEYWORDS', 'Default meta keywords');

// Production-specific validations
if (mode === 'production') {
	console.log('\n🏭 Production-Specific Validations:');
	
	// API URL should use HTTPS
	if (envVars.VITE_API_URL && !envVars.VITE_API_URL.startsWith('https://')) {
		console.error(`❌ VITE_API_URL: Should use HTTPS in production - INSECURE`);
		validationResults.failed++;
	} else if (envVars.VITE_API_URL) {
		console.log(`✅ VITE_API_URL: Using HTTPS - OK`);
		validationResults.passed++;
	}
	
	// Check for development URLs in production
	const devPatterns = ['localhost', '127.0.0.1', 'dev', 'test'];
	const urlVars = ['VITE_API_URL', 'VITE_FACEBOOK_URL', 'VITE_TWITTER_URL'];
	
	urlVars.forEach(varName => {
		const value = envVars[varName];
		if (value && devPatterns.some(pattern => value.includes(pattern))) {
			console.error(`❌ ${varName}: Contains development URL in production - INCORRECT`);
			validationResults.failed++;
		}
	});
	
	// Error tracking should be enabled
	validateOptional(envVars.VITE_SENTRY_DSN, 'VITE_SENTRY_DSN', 'Sentry error tracking DSN');
}

// Check for common mistakes
console.log('\n🔧 Common Issues Check:');

// Check if API URL ends with /api (common mistake)
if (envVars.VITE_API_URL && envVars.VITE_API_URL.endsWith('/api/api')) {
	console.error(`❌ VITE_API_URL: Contains duplicate /api path - INCORRECT`);
	validationResults.failed++;
} else if (envVars.VITE_API_URL) {
	console.log(`✅ VITE_API_URL: Path structure looks correct - OK`);
	validationResults.passed++;
}

// Check for placeholder values
const placeholderPatterns = ['REPLACE_', 'YOUR_', 'CHANGE_', 'UPDATE_'];
Object.entries(envVars).forEach(([key, value]) => {
	if (value && placeholderPatterns.some(pattern => value.includes(pattern))) {
		console.error(`❌ ${key}: Contains placeholder value - NEEDS UPDATE`);
		validationResults.failed++;
	}
});

// Summary
console.log('\n📊 Validation Summary:');
console.log(`✅ Passed: ${validationResults.passed}`);
console.log(`⚠️  Warnings: ${validationResults.warnings}`);
console.log(`❌ Failed: ${validationResults.failed}`);

if (validationResults.failed > 0) {
	console.log('\n❌ Frontend environment validation failed. Please fix the issues above before proceeding.');
	process.exit(1);
} else if (validationResults.warnings > 0) {
	console.log('\n⚠️  Frontend environment validation passed with warnings. Consider addressing the warnings for optimal configuration.');
	process.exit(0);
} else {
	console.log('\n✅ Frontend environment validation passed successfully!');
	process.exit(0);
}