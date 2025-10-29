// API utilities
export { 
  api, 
  apiService, 
  endpoints, 
  ApiError, 
  API_ERROR_TYPES,
  apiRequest,
  volunteerAPI,
  donationAPI,
  eventAPI,
  contactAPI,
  impactAPI,
  aboutAPI,
  adminAPI
} from './api'

// Notification utilities
export {
  NOTIFICATION_TYPES,
  NOTIFICATION_DURATIONS,
  NOTIFICATION_POSITIONS,
  createNotification,
  notifications,
  formatErrorMessage
} from './notifications'

// Loading state utilities
export {
  LOADING_STATES,
  LOADING_PRIORITIES,
  createLoadingState,
  loadingStates,
  getLoadingDuration,
  isLoadingTooLong,
  getLoadingMessage,
  combineLoadingStates
} from './loadingStates'

// Format utilities
export const formatters = {
  // Currency formatter
  currency: (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  },
  
  // Number formatter
  number: (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  },
  
  // Date formatter
  date: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options })
  },
  
  // Relative time formatter
  relativeTime: (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return formatters.date(date)
  },
  
  // Phone formatter
  phone: (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    }
    return phone
  }
}

// Validation utilities
export const validators = {
  email: (email) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email),
  phone: (phone) => /^[+]?[\d\s\-\(\)]{10,}$/.test(phone),
  url: (url) => /^https?:\/\/.+\..+/.test(url),
  strongPassword: (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
}

// Storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
  
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch {
      return false
    }
  }
}

// URL utilities
export const urlUtils = {
  getQueryParams: () => {
    const params = new URLSearchParams(window.location.search)
    const result = {}
    for (const [key, value] of params) {
      result[key] = value
    }
    return result
  },
  
  setQueryParam: (key, value) => {
    const url = new URL(window.location)
    url.searchParams.set(key, value)
    window.history.pushState({}, '', url)
  },
  
  removeQueryParam: (key) => {
    const url = new URL(window.location)
    url.searchParams.delete(key)
    window.history.pushState({}, '', url)
  }
}

// DOM utilities
export const domUtils = {
  scrollToTop: (smooth = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    })
  },
  
  scrollToElement: (elementId, smooth = true) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start'
      })
    }
  },
  
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  }
}

// Array utilities
export const arrayUtils = {
  chunk: (array, size) => {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  },
  
  unique: (array, key = null) => {
    if (key) {
      const seen = new Set()
      return array.filter(item => {
        const value = item[key]
        if (seen.has(value)) return false
        seen.add(value)
        return true
      })
    }
    return [...new Set(array)]
  },
  
  groupBy: (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key]
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {})
  },
  
  sortBy: (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (direction === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    })
  }
}

// Constants
export const constants = {
  API_BASE_URL: import.meta.env.VITE_API_URL || '/api',
  APP_NAME: 'Urjja Pratishthan Prakashalay',
  CONTACT_EMAIL: 'info@urjjapratishthan.org',
  CONTACT_PHONE: '+91 98765 43210',
  SOCIAL_LINKS: {
    facebook: '#',
    twitter: '#',
    instagram: '#',
    linkedin: '#'
  }
}