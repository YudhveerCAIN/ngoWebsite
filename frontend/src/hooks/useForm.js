import { useState, useCallback, useRef } from 'react'

// Custom hook for form management with validation
export function useForm(initialValues = {}, validationRules = {}, options = {}) {
  const {
    validateOnChange = false,
    validateOnBlur = true,
    resetOnSubmit = false
  } = options
  
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)
  
  const initialValuesRef = useRef(initialValues)
  
  // Validation function
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name]
    if (!rules) return null
    
    for (const rule of rules) {
      const error = rule(value, values)
      if (error) return error
    }
    
    return null
  }, [validationRules, values])
  
  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true
    
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name])
      if (error) {
        newErrors[name] = error
        isValid = false
      }
    })
    
    setErrors(newErrors)
    return isValid
  }, [validationRules, values, validateField])
  
  // Handle input change
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    if (validateOnChange || touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [validateOnChange, touched, validateField])
  
  // Handle input blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    if (validateOnBlur) {
      const error = validateField(name, values[name])
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [validateOnBlur, validateField, values])
  
  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    setSubmitCount(prev => prev + 1)
    setIsSubmitting(true)
    
    // Mark all fields as touched
    const allTouched = {}
    Object.keys(values).forEach(key => {
      allTouched[key] = true
    })
    setTouched(allTouched)
    
    // Validate form
    const isValid = validateForm()
    
    if (isValid) {
      try {
        await onSubmit(values)
        
        if (resetOnSubmit) {
          reset()
        }
      } catch (error) {
        // Handle submission error
        console.error('Form submission error:', error)
      }
    }
    
    setIsSubmitting(false)
  }, [values, validateForm, resetOnSubmit])
  
  // Reset form
  const reset = useCallback((newValues = initialValuesRef.current) => {
    setValues(newValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
    setSubmitCount(0)
  }, [])
  
  // Set field value
  const setValue = useCallback((name, value) => {
    handleChange(name, value)
  }, [handleChange])
  
  // Set field error
  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])
  
  // Clear field error
  const clearError = useCallback((name) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }, [])
  
  // Get field props for input components
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: (e) => handleChange(name, e.target.value),
    onBlur: () => handleBlur(name),
    error: errors[name],
    touched: touched[name]
  }), [values, errors, touched, handleChange, handleBlur])
  
  // Check if form is valid
  const isValid = Object.keys(errors).length === 0
  
  // Check if form is dirty (has changes)
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current)
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearError,
    validateForm,
    getFieldProps
  }
}

// Validation helper functions
export const validators = {
  required: (message = 'This field is required') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message
    }
    return null
  },
  
  email: (message = 'Please enter a valid email address') => (value) => {
    if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
      return message
    }
    return null
  },
  
  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`
    }
    return null
  },
  
  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Must be no more than ${max} characters`
    }
    return null
  },
  
  pattern: (regex, message = 'Invalid format') => (value) => {
    if (value && !regex.test(value)) {
      return message
    }
    return null
  },
  
  phone: (message = 'Please enter a valid phone number') => (value) => {
    if (value && !/^[+]?[\d\s\-\(\)]{10,}$/.test(value)) {
      return message
    }
    return null
  },
  
  url: (message = 'Please enter a valid URL') => (value) => {
    if (value && !/^https?:\/\/.+\..+/.test(value)) {
      return message
    }
    return null
  },
  
  number: (message = 'Please enter a valid number') => (value) => {
    if (value && isNaN(Number(value))) {
      return message
    }
    return null
  },
  
  min: (min, message) => (value) => {
    if (value && Number(value) < min) {
      return message || `Must be at least ${min}`
    }
    return null
  },
  
  max: (max, message) => (value) => {
    if (value && Number(value) > max) {
      return message || `Must be no more than ${max}`
    }
    return null
  },
  
  match: (fieldName, message) => (value, allValues) => {
    if (value && value !== allValues[fieldName]) {
      return message || `Must match ${fieldName}`
    }
    return null
  },
  
  custom: (validatorFn, message = 'Invalid value') => (value, allValues) => {
    if (!validatorFn(value, allValues)) {
      return message
    }
    return null
  }
}

export default useForm