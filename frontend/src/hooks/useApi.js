import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { ApiError, API_ERROR_TYPES } from '../utils/api'

// Custom hook for API calls with loading, error, and caching
export function useApi(apiCall, options = {}) {
  const {
    immediate = true,
    cacheKey = null,
    cacheTTL = 300000, // 5 minutes
    retries = 1,
    onSuccess = null,
    onError = null,
    dependencies = []
  } = options
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)
  
  const { getCache, setCache, isOnline, showNotification } = useApp()
  const abortControllerRef = useRef(null)
  const mountedRef = useRef(true)
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])
  
  const execute = useCallback(async (...args) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Check cache first
    if (cacheKey) {
      const cachedData = getCache(cacheKey)
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        setError(null)
        return cachedData
      }
    }
    
    // Check network status
    if (!isOnline()) {
      const networkError = new ApiError(
        'No internet connection',
        API_ERROR_TYPES.NETWORK,
        0
      )
      setError(networkError)
      setLoading(false)
      if (onError) onError(networkError)
      return null
    }
    
    setLoading(true)
    setError(null)
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    let attempt = 0
    let lastError = null
    
    while (attempt <= retries) {
      try {
        const result = await apiCall(...args, {
          signal: abortControllerRef.current.signal
        })
        
        if (!mountedRef.current) return null
        
        setData(result)
        setLoading(false)
        setLastFetch(Date.now())
        
        // Cache the result
        if (cacheKey && result) {
          setCache(cacheKey, result, cacheTTL)
        }
        
        if (onSuccess) onSuccess(result)
        return result
        
      } catch (err) {
        lastError = err
        
        // Don't retry on certain errors
        if (err instanceof ApiError) {
          if ([
            API_ERROR_TYPES.AUTHENTICATION,
            API_ERROR_TYPES.AUTHORIZATION,
            API_ERROR_TYPES.VALIDATION,
            API_ERROR_TYPES.NOT_FOUND
          ].includes(err.type)) {
            break
          }
        }
        
        // Don't retry if aborted
        if (err.name === 'AbortError') {
          return null
        }
        
        attempt++
        
        // Wait before retry
        if (attempt <= retries) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
          )
        }
      }
    }
    
    if (!mountedRef.current) return null
    
    setError(lastError)
    setLoading(false)
    
    if (onError) onError(lastError)
    
    // Show error notification for certain types
    if (lastError instanceof ApiError) {
      if (lastError.type === API_ERROR_TYPES.NETWORK) {
        showNotification('Network error. Please check your connection.', 'error')
      } else if (lastError.type === API_ERROR_TYPES.SERVER) {
        showNotification('Server error. Please try again later.', 'error')
      }
    }
    
    return null
  }, [apiCall, cacheKey, cacheTTL, retries, onSuccess, onError, getCache, setCache, isOnline, showNotification])
  
  // Auto-execute on mount and dependency changes
  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute, ...dependencies])
  
  // Refresh function
  const refresh = useCallback(() => {
    return execute()
  }, [execute])
  
  // Reset function
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    setLastFetch(null)
  }, [])
  
  return {
    data,
    loading,
    error,
    lastFetch,
    execute,
    refresh,
    reset
  }
}

// Hook for paginated API calls
export function usePaginatedApi(apiCall, options = {}) {
  const {
    pageSize = 10,
    initialPage = 1,
    ...apiOptions
  } = options
  
  const [page, setPage] = useState(initialPage)
  const [allData, setAllData] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  
  const paginatedApiCall = useCallback(async (...args) => {
    const params = {
      page,
      limit: pageSize,
      ...(args[0] || {})
    }
    
    const result = await apiCall(params)
    
    if (result) {
      const { data = [], pagination = {} } = result
      const { total = 0, pages = 1, page: currentPage = 1 } = pagination
      
      if (currentPage === 1) {
        setAllData(data)
      } else {
        setAllData(prev => [...prev, ...data])
      }
      
      setTotalCount(total)
      setHasMore(currentPage < pages)
    }
    
    return result
  }, [apiCall, page, pageSize])
  
  const apiResult = useApi(paginatedApiCall, {
    ...apiOptions,
    dependencies: [page, ...(apiOptions.dependencies || [])]
  })
  
  const loadMore = useCallback(() => {
    if (hasMore && !apiResult.loading) {
      setPage(prev => prev + 1)
    }
  }, [hasMore, apiResult.loading])
  
  const reset = useCallback(() => {
    setPage(initialPage)
    setAllData([])
    setHasMore(true)
    setTotalCount(0)
    apiResult.reset()
  }, [initialPage, apiResult])
  
  return {
    ...apiResult,
    data: allData,
    page,
    hasMore,
    totalCount,
    loadMore,
    reset
  }
}

// Hook for form submissions
export function useApiSubmit(apiCall, options = {}) {
  const {
    onSuccess = null,
    onError = null,
    showSuccessNotification = true,
    showErrorNotification = true,
    successMessage = 'Operation completed successfully',
    resetOnSuccess = false
  } = options
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  
  const { showNotification } = useApp()
  
  const submit = useCallback(async (formData) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall(formData)
      setData(result)
      
      if (showSuccessNotification) {
        showNotification(successMessage, 'success')
      }
      
      if (onSuccess) onSuccess(result)
      
      if (resetOnSuccess) {
        setData(null)
      }
      
      return result
    } catch (err) {
      setError(err)
      
      if (showErrorNotification) {
        const message = err instanceof ApiError 
          ? err.message 
          : 'An error occurred. Please try again.'
        showNotification(message, 'error')
      }
      
      if (onError) onError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall, onSuccess, onError, showSuccessNotification, showErrorNotification, successMessage, resetOnSuccess, showNotification])
  
  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])
  
  return {
    submit,
    loading,
    error,
    data,
    reset
  }
}

// Hook for real-time data with polling
export function usePolling(apiCall, interval = 30000, options = {}) {
  const {
    enabled = true,
    immediate = true,
    ...apiOptions
  } = options
  
  const apiResult = useApi(apiCall, { ...apiOptions, immediate })
  const intervalRef = useRef(null)
  
  useEffect(() => {
    if (enabled && interval > 0) {
      intervalRef.current = setInterval(() => {
        apiResult.refresh()
      }, interval)
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [enabled, interval, apiResult.refresh])
  
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      apiResult.refresh()
    }, interval)
  }, [interval, apiResult.refresh])
  
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])
  
  return {
    ...apiResult,
    startPolling,
    stopPolling,
    isPolling: !!intervalRef.current
  }
}

// Hook for optimistic updates
export function useOptimisticUpdate(apiCall, options = {}) {
  const {
    updateFn = null,
    rollbackFn = null,
    onSuccess = null,
    onError = null
  } = options
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const execute = useCallback(async (optimisticData, ...args) => {
    const previousData = data
    
    // Apply optimistic update
    if (updateFn) {
      setData(updateFn(data, optimisticData))
    } else {
      setData(optimisticData)
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall(...args)
      setData(result)
      
      if (onSuccess) onSuccess(result)
      return result
    } catch (err) {
      // Rollback on error
      if (rollbackFn) {
        setData(rollbackFn(previousData, err))
      } else {
        setData(previousData)
      }
      
      setError(err)
      if (onError) onError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [data, apiCall, updateFn, rollbackFn, onSuccess, onError])
  
  return {
    data,
    loading,
    error,
    execute,
    setData
  }
}