import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Card, LoadingSpinner } from '../ui'
import { apiService } from '../../utils/api'

const VolunteerForm = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm()
  
  const areasOfInterestOptions = [
    'Education & Tutoring',
    'Healthcare & Medical Support',
    'Environmental Conservation',
    'Community Development',
    'Women Empowerment',
    'Child Welfare',
    'Elderly Care',
    'Skill Development',
    'Event Organization',
    'Administrative Support'
  ]
  
  const availabilityOptions = [
    'Weekends only',
    'Weekdays only', 
    'Flexible schedule',
    'Specific events only'
  ]
  
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      const result = await apiService.volunteers.create(data)
      
      setIsSuccess(true)
      reset()
      
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit volunteer application')
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
          Thank You for Volunteering!
        </h2>
        <p className="text-gray-600 mb-6">
          Your volunteer application has been submitted successfully. We'll review your application and get back to you within 2-3 business days.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          You should receive a confirmation email shortly at the address you provided.
        </p>
        <Button 
          onClick={() => setIsSuccess(false)}
          variant="outline"
        >
          Submit Another Application
        </Button>
      </Card>
    )
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
      <Card.Header>
        <Card.Title>Volunteer Registration</Card.Title>
        <p className="text-gray-600 mt-2">
          Join our team of dedicated volunteers and help us make a difference in the community.
        </p>
      </Card.Header>
      
      <Card.Content>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
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
                label="Phone Number"
                type="tel"
                required
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[+]?[\d\s\-\(\)]{10,}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                error={errors.phone?.message}
                placeholder="+91 98765 43210"
                helperText="Include country code if outside India"
              />
            </div>
          </div>    
      
          {/* Areas of Interest Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas of Interest</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the areas where you'd like to contribute (select multiple if applicable)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {areasOfInterestOptions.map((area) => (
                <label key={area} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={area}
                    {...register('areasOfInterest', {
                      required: 'Please select at least one area of interest'
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{area}</span>
                </label>
              ))}
            </div>
            {errors.areasOfInterest && (
              <p className="text-sm text-red-600 mt-2" role="alert">
                {errors.areasOfInterest.message}
              </p>
            )}
          </div>
          
          {/* Availability Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
            <div className="space-y-2">
              {availabilityOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value={option}
                    {...register('availability', {
                      required: 'Please select your availability'
                    })}
                    className="border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.availability && (
              <p className="text-sm text-red-600 mt-2" role="alert">
                {errors.availability.message}
              </p>
            )}
          </div>
          
          {/* Experience Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Previous Volunteer Experience (Optional)
            </label>
            <textarea
              {...register('experience')}
              rows={3}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Tell us about any previous volunteer work or relevant experience..."
            />
          </div>
          
          {/* Message Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why do you want to volunteer with us? (Optional)
            </label>
            <textarea
              {...register('message')}
              rows={4}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Share your motivation and what you hope to achieve through volunteering..."
            />
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
              {isSubmitting ? 'Submitting Application...' : 'Submit Volunteer Application'}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  )
}

export default VolunteerForm