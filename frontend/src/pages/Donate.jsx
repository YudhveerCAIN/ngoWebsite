import { useState } from 'react'
import DonationForm from '../components/forms/DonationForm'
import { Card } from '../components/ui'

export default function Donate() {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return (
      <div className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DonationForm onSuccess={() => {
            console.log('Donation completed successfully')
          }} />
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Support Our Mission
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your donation helps us empower communities through education, mentorship, and inclusive programs. 
            Every contribution makes a meaningful difference.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">₹500</div>
            <div className="text-gray-600">Provides school supplies for one student for a month</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">₹2,500</div>
            <div className="text-gray-600">Sponsors a student's education for one semester</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">₹10,000</div>
            <div className="text-gray-600">Funds a complete skill development program</div>
          </Card>
        </div>

        {/* Why Donate Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Your Donation Matters</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Direct Impact</h3>
                  <p className="text-gray-600">100% of your donation goes directly to our programs and beneficiaries.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Transparency</h3>
                  <p className="text-gray-600">Regular updates on how your contribution is making a difference.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Tax Benefits</h3>
                  <p className="text-gray-600">All donations are eligible for tax deduction under Section 80G.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How We Use Your Donations</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Education Programs</span>
                <span className="font-semibold">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Community Outreach</span>
                <span className="font-semibold">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Skill Development</span>
                <span className="font-semibold">15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Bank Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Direct Bank Transfer</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-medium text-gray-900">Urjja Pratishthan Prakashalay</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-medium text-gray-900">XXXX XXXX XXXX 1234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Name:</span>
                  <span className="font-medium text-gray-900">State Bank of India</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch:</span>
                  <span className="font-medium text-gray-900">Bhosari, Pune</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IFSC Code:</span>
                  <span className="font-medium text-gray-900">SBIN0XXXXXX</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Please send us the transaction details at contact@urjjapratishthan.in for tax receipt.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">UPI Payment</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-500 text-sm">QR Code</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Scan QR code to pay via UPI</p>
                  <p className="font-medium text-gray-900">urjjapratishthan@upi</p>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Popular UPI Apps:</h4>
                  <div className="flex justify-center space-x-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-1">
                        <span className="text-xs font-medium text-blue-600">GPay</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-1">
                        <span className="text-xs font-medium text-purple-600">PhonePe</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-1">
                        <span className="text-xs font-medium text-blue-600">Paytm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-8 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-gray-600 mb-6">
              Join hundreds of donors who are already supporting our mission to create positive change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Donate Online
              </button>
              <a
                href="tel:+919665205335"
                className="bg-white hover:bg-gray-50 text-primary-600 border border-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Call to Donate
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}