import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Card, LoadingSpinner } from '../ui'
import { apiService } from '../../utils/api'

const DonationForm = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm()
  
  const watchAmount = watch('amountInInr')
  const watchRecurring = watch('recurring')
  
  const predefinedAmounts = [500, 1000, 2500, 5000, 10000]
  
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // First, create the donation record
      const donationResponse = await fetch(`${import.meta.env.VITE_API_URL}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!donationResponse.ok) {
        const errorData = await donationResponse.json()
        throw new Error(errorData.message || 'Failed to create donation')
      }
      
      const donation = await donationResponse.json()
      
      // If payment provider is Razorpay, initiate payment
      if (data.paymentProvider === 'razorpay') {
        await initiateRazorpayPayment(donation)
      } else {
        // For offline donations, show success immediately
        setIsSuccess(true)
        reset()
        
        if (onSuccess) {
          onSuccess(donation)
        }
      }
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const initiateRazorpayPayment = async (donation) => {
    try {
      // Create Razorpay order
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/donations/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donationId: donation.id,
          amount: donation.amountInInr
        }),
      })
      
      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order')
      }
      
      const order = await orderResponse.json()
      
      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Urjja Pratishthan Prakashalay',
        description: 'Donation for community development',
        order_id: order.id,
        handler: async function (response) {
          // Payment successful
          try {
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/donations/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                donationId: donation.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            
            if (verifyResponse.ok) {
              setIsSuccess(true)
              reset()
              
              if (onSuccess) {
                onSuccess(donation)
              }
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            setSubmitError('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: donation.fullName,
          email: donation.email,
          contact: donation.phone
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function() {
            setSubmitError('Payment was cancelled. You can try again.')
          }
        }
      }
      
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      setSubmitError(error.message)
    }
  }
  
  const selectAmount = (amount) => {
    setValue('amountInInr', amount)
  }
  
  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Thank You for Your Donation!
        </h2>
        <p className="text-gray-600 mb-6">
          Your generous contribution will help us make a meaningful impact in our community. 
          You should receive a donation receipt via email shortly.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Your donation helps fund our education programs, community outreach, and support services.
        </p>
        <Button 
          onClick={() => setIsSuccess(false)}
          variant="outline"
        >
          Make Another Donation
        </Button>
      </Card>
    )
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
      <Card.Header>
        <Card.Title>Make a Donation</Card.Title>
        <p className="text-gray-600 mt-2">
          Support our mission to empower communities through education and opportunity.
        </p>
      </Card.Header>
      
      <Card.Content>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Amount Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Donation Amount</h3>
              
              {/* Predefined Amounts */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => selectAmount(amount)}
                    className={`p-4 border-2 rounded-lg text-center transition-colors duration-200 ${
                      watchAmount === amount
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-lg font-semibold">₹{amount.toLocaleString()}</div>
                  </button>
                ))}
              </div>
              
              {/* Custom Amount */}
              <div>
                <Input
                  label="Custom Amount (₹)"
                  type="number"
                  min="1"
                  required
                  {...register('amountInInr', {
                    required: 'Donation amount is required',
                    min: {
                      value: 1,
                      message: 'Minimum donation amount is ₹1'
                    },
                    max: {
                      value: 1000000,
                      message: 'Maximum donation amount is ₹10,00,000'
                    }
                  })}
                  error={errors.amountInInr?.message}
                  placeholder="Enter amount"
                />
              </div>
              
              {/* Recurring Donation */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('recurring')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Make this a recurring donation</span>
                    <p className="text-xs text-gray-500">Help us with regular support</p>
                  </div>
                </label>
                
                {watchRecurring && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      {...register('frequency')}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!watchAmount || watchAmount < 1}
                >
                  Continue to Details
                </Button>
              </div>
            </div>
          )}   
       
          {/* Step 2: Donor Information */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Donor Information</h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  ← Back to Amount
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                  error={errors.fullName?.message}
                  placeholder="Enter your full name"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  required
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  error={errors.email?.message}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className="mt-4">
                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  {...register('phone', {
                    pattern: {
                      value: /^[+]?[\d\s\-\(\)]{10,}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  error={errors.phone?.message}
                  placeholder="+91 98765 43210"
                  helperText="We'll use this for donation receipts and updates"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  {...register('message')}
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Share why you're supporting our cause or any special message..."
                />
              </div>
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Payment Options */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  ← Back to Details
                </button>
              </div>
              
              {/* Donation Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Donation Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">₹{watchAmount?.toLocaleString()}</span>
                  </div>
                  {watchRecurring && (
                    <div className="flex justify-between">
                      <span>Frequency:</span>
                      <span className="font-medium capitalize">{watch('frequency')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Payment Options */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-primary-600 bg-primary-50 rounded-lg">
                    <input
                      type="radio"
                      value="razorpay"
                      {...register('paymentProvider', { required: 'Please select a payment method' })}
                      className="border-gray-300 text-primary-600 focus:ring-primary-500"
                      defaultChecked
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Online Payment (Recommended)</div>
                      <div className="text-sm text-gray-600">
                        Pay securely with credit/debit card, UPI, or net banking via Razorpay
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <img src="/images/visa.png" alt="Visa" className="h-6" onError={(e) => e.target.style.display = 'none'} />
                      <img src="/images/mastercard.png" alt="Mastercard" className="h-6" onError={(e) => e.target.style.display = 'none'} />
                      <img src="/images/upi.png" alt="UPI" className="h-6" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:border-gray-400">
                    <input
                      type="radio"
                      value="offline"
                      {...register('paymentProvider')}
                      className="border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Offline Payment</div>
                      <div className="text-sm text-gray-600">
                        We'll send you bank details for direct transfer
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              {errors.paymentProvider && (
                <p className="text-sm text-red-600 mt-2" role="alert">
                  {errors.paymentProvider.message}
                </p>
              )}
              
              {/* Error Display */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700" role="alert">
                      {submitError}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? 'Processing...' : `Donate ₹${watchAmount?.toLocaleString()}`}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card.Content>
    </Card>
  )
}

export default DonationForm