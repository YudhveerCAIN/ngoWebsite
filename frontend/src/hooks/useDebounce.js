import { useState, useEffect, useCallback, useRef } from 'react'

// Hook for debouncing values
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Hook for debouncing callbacks
export function useDebounceCallback(callback, delay = 300, deps = []) {
  const timeoutRef = useRef(null)
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay, ...deps])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  // Cancel function
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])
  
  // Flush function (execute immediately)
  const flush = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    callback(...args)
  }, [callback])
  
  return [debouncedCallback, cancel, flush]
}

// Hook for throttling
export function useThrottle(value, limit = 300) {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRan = useRef(Date.now())
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])
  
  return throttledValue
}

// Hook for throttling callbacks
export function useThrottleCallback(callback, limit = 300, deps = []) {
  const lastRan = useRef(Date.now())
  const timeoutRef = useRef(null)
  
  const throttledCallback = useCallback((...args) => {
    if (Date.now() - lastRan.current >= limit) {
      callback(...args)
      lastRan.current = Date.now()
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args)
        lastRan.current = Date.now()
      }, limit - (Date.now() - lastRan.current))
    }
  }, [callback, limit, ...deps])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  return throttledCallback
}

export default useDebounce