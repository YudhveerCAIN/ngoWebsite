#!/usr/bin/env node

/**
 * Script to verify that environment variables are being used correctly
 * Run with: node scripts/checkEnvUsage.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log('🔍 Checking environment variable usage in frontend...\n')

// Check if .env file exists and read it
let envVars = {}
try {
  const envContent = readFileSync(join(projectRoot, '.env'), 'utf8')
  envContent.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=', 2)
      envVars[key.trim()] = value.trim()
    }
  })
} catch (error) {
  console.log('❌ Could not read .env file')
  process.exit(1)
}

console.log('📋 Environment Variables Found:')
Object.keys(envVars).forEach(key => {
  console.log(`  ${key}: ${envVars[key]}`)
})

console.log('\n🔍 Key Configuration Check:')

// Check API URL
const apiUrl = envVars['VITE_API_URL']
if (apiUrl) {
  if (apiUrl.includes('localhost')) {
    console.log('⚠️  VITE_API_URL is set to localhost (development)')
  } else if (apiUrl.includes('onrender.com')) {
    console.log('✅ VITE_API_URL is set to production (Render)')
  } else {
    console.log('❓ VITE_API_URL is set to:', apiUrl)
  }
} else {
  console.log('❌ VITE_API_URL is not set')
}

// Check Razorpay key
const razorpayKey = envVars['VITE_RAZORPAY_KEY_ID']
if (razorpayKey) {
  if (razorpayKey.includes('test')) {
    console.log('⚠️  VITE_RAZORPAY_KEY_ID is set to test key')
  } else if (razorpayKey.includes('production') || razorpayKey.startsWith('rzp_live_')) {
    console.log('✅ VITE_RAZORPAY_KEY_ID is set to production key')
  } else {
    console.log('❓ VITE_RAZORPAY_KEY_ID is set but format unclear')
  }
} else {
  console.log('❌ VITE_RAZORPAY_KEY_ID is not set')
}

// Check dev tools setting
const devTools = envVars['VITE_DEV_TOOLS']
if (devTools === 'false') {
  console.log('✅ VITE_DEV_TOOLS is disabled for production')
} else {
  console.log('⚠️  VITE_DEV_TOOLS is enabled (development mode)')
}

console.log('\n🚀 Deployment Readiness:')
const isProductionReady = 
  apiUrl && !apiUrl.includes('localhost') &&
  razorpayKey && !razorpayKey.includes('test') &&
  devTools === 'false'

if (isProductionReady) {
  console.log('✅ Frontend appears ready for production deployment!')
} else {
  console.log('⚠️  Frontend needs configuration updates for production')
  console.log('   Make sure to:')
  console.log('   - Set VITE_API_URL to your Render backend URL')
  console.log('   - Set VITE_RAZORPAY_KEY_ID to production key')
  console.log('   - Set VITE_DEV_TOOLS to false')
}

console.log('\n📝 Note: Remember to set these same variables in Vercel dashboard!')