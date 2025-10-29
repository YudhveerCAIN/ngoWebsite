import { useState, useEffect, useCallback } from 'react'

// Custom hook for localStorage with JSON serialization
export function useLocalStorage(key, initialValue = null) {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })
  
  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to localStorage
      if (valueToStore === null || valueToStore === undefined) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])
  
  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])
  
  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])
  
  return [storedValue, setValue, removeValue]
}

// Hook for managing multiple localStorage keys as an object
export function useLocalStorageState(keys, initialValues = {}) {
  const [state, setState] = useState(() => {
    const initialState = {}
    
    keys.forEach(key => {
      try {
        const item = window.localStorage.getItem(key)
        initialState[key] = item ? JSON.parse(item) : (initialValues[key] || null)
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error)
        initialState[key] = initialValues[key] || null
      }
    })
    
    return initialState
  })
  
  const updateState = useCallback((key, value) => {
    setState(prevState => {
      const newState = { ...prevState }
      const valueToStore = value instanceof Function ? value(prevState[key]) : value
      
      newState[key] = valueToStore
      
      try {
        if (valueToStore === null || valueToStore === undefined) {
          window.localStorage.removeItem(key)
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
      
      return newState
    })
  }, [])
  
  const removeKey = useCallback((key) => {
    setState(prevState => {
      const newState = { ...prevState }
      delete newState[key]
      
      try {
        window.localStorage.removeItem(key)
      } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error)
      }
      
      return newState
    })
  }, [])
  
  const clearAll = useCallback(() => {
    keys.forEach(key => {
      try {
        window.localStorage.removeItem(key)
      } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error)
      }
    })
    
    setState(initialValues)
  }, [keys, initialValues])
  
  return [state, updateState, removeKey, clearAll]
}

// Hook for localStorage with expiration
export function useLocalStorageWithExpiry(key, initialValue = null, ttl = 86400000) { // 24 hours default
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue
      
      const parsed = JSON.parse(item)
      
      // Check if item has expiry and if it's expired
      if (parsed.expiry && Date.now() > parsed.expiry) {
        window.localStorage.removeItem(key)
        return initialValue
      }
      
      return parsed.value !== undefined ? parsed.value : parsed
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (valueToStore === null || valueToStore === undefined) {
        window.localStorage.removeItem(key)
      } else {
        const itemWithExpiry = {
          value: valueToStore,
          expiry: Date.now() + ttl
        }
        window.localStorage.setItem(key, JSON.stringify(itemWithExpiry))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue, ttl])
  
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])
  
  const isExpired = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return true
      
      const parsed = JSON.parse(item)
      return parsed.expiry && Date.now() > parsed.expiry
    } catch (error) {
      return true
    }
  }, [key])
  
  return [storedValue, setValue, removeValue, isExpired]
}

export default useLocalStorage