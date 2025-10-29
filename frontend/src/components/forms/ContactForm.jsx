import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Card, LoadingSpinner } from '../ui'
import { apiService } from '../../utils/api'

const ContactForm = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()
  
  const subjectOptions = [
    'General Inquiry',
    'Volunteer Opportunities',
    'Partnership Proposal',
    'Donation Information',
    'Event Information',
    'Media & Press',
    'Feedback & Suggestions',
    'Other'
  ]
  
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      const result = await apiService.contact.create(data)
      
      setIsSuccess(true)
      reset()
      
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      setSubmitError(error.message || 'Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
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
          Message Sent Successfully!
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for reaching out to us. We have received your message and will get back to you within 24-48 hours.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          You should receive a confirmation email shortly at the address you provided.
        </p>
        <Button 
          onClick={() => setIsSuccess(false)}
          variant="outline"
        >
          Send Another Message
        </Button>
      </Card>
    )
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
      <Card.Header>
        <Card.Title>Contact Us</Card.Title>
        <p className="text-gray-600 mt-2">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </Card.Header>
      
      <Card.Content>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
              })}
              error={errors.name?.message}
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
            helperText="We'll use this for urgent follow-ups if needed"
          />
          
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              {...register('subject', {
                required: 'Please select a subject'
              })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Select a subject</option>
              {subjectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.subject.message}
              </p>
            )}
          </div>
          
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('message', {
                required: 'Message is required',
                minLength: {
                  value: 10,
                  message: 'Message must be at least 10 characters'
                },
                maxLength: {
                  value: 2000,
                  message: 'Message must be less than 2000 characters'
                }
              })}
              rows={6}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Please provide details about your inquiry, question, or how we can help you..."
            />
            {errors.message && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.message.message}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Please be as detailed as possible to help us provide the best response.
            </p>
          </div>
          
          {/* Error Display */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              size="lg"
              className="w-full md:w-auto"
            >
              {isSubmitting ? 'Sending Message...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  )
}

export default ContactForm