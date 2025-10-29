import { createContext, useContext, useReducer, useEffect } from 'react'

// App action types
const APP_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_NOTIFICATION: 'SET_NOTIFICATION',
  CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_CACHE: 'SET_CACHE',
  CLEAR_CACHE: 'CLEAR_CACHE',
  SET_NETWORK_STATUS: 'SET_NETWORK_STATUS',
  SET_PAGE_TITLE: 'SET_PAGE_TITLE'
}

// Initial app state
const initialState = {
  loading: {
    global: false,
    api: false,
    page: false
  },
  error: {
    global: null,
    api: null,
    network: null
  },
  notification: {
    message: null,
    type: null, // 'success', 'error', 'warning', 'info'
    duration: 5000,
    visible: false
  },
  theme: 'light',
  language: 'en',
  cache: new Map(),
  networkStatus: 'online',
  pageTitle: 'Urjja Pratishthan Prakashalay',
  preferences: {
    animations: true,
    notifications: true,
    autoSave: true
  }
}

// App reducer
function appReducer(state, action) {
  switch (action.type) {
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.value
        }
      }
    
    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.type]: action.payload.error
        }
      }
    
    case APP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.type]: null
        }
      }
    
    case APP_ACTIONS.SET_NOTIFICATION:
      return {
        ...state,
        notification: {
          ...action.payload,
          visible: true
        }
      }
    
    case APP_ACTIONS.CLEAR_NOTIFICATION:
      return {
        ...state,
        notification: {
          ...state.notification,
          visible: false,
          message: null
        }
      }
    
    case APP_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload.theme
      }
    
    case APP_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload.language
      }
    
    case APP_ACTIONS.SET_CACHE:
      const newCache = new Map(state.cache)
      newCache.set(action.payload.key, {
        data: action.payload.data,
        timestamp: Date.now(),
        ttl: action.payload.ttl || 300000 // 5 minutes default
      })
      return {
        ...state,
        cache: newCache
      }
    
    case APP_ACTIONS.CLEAR_CACHE:
      return {
        ...state,
        cache: action.payload.key 
          ? (() => {
              const newCache = new Map(state.cache)
              newCache.delete(action.payload.key)
              return newCache
            })()
          : new Map()
      }
    
    case APP_ACTIONS.SET_NETWORK_STATUS:
      return {
        ...state,
        networkStatus: action.payload.status
      }
    
    case APP_ACTIONS.SET_PAGE_TITLE:
      return {
        ...state,
        pageTitle: action.payload.title
      }
    
    default:
      return state
  }
}

// Create context
const AppContext = createContext()

// App provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  // Initialize app state from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme')
      const savedLanguage = localStorage.getItem('app-language')
      const savedPreferences = localStorage.getItem('app-preferences')
      
      if (savedTheme) {
        setTheme(savedTheme)
      }
      
      if (savedLanguage) {
        setLanguage(savedLanguage)
      }
      
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences)
        dispatch({
          type: 'SET_PREFERENCES',
          payload: { preferences }
        })
      }
    } catch (error) {
      console.error('Error loading app preferences:', error)
    }
  }, [])
  
  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      dispatch({
        type: APP_ACTIONS.SET_NETWORK_STATUS,
        payload: { status: 'online' }
      })
      showNotification('Connection restored', 'success')
    }
    
    const handleOffline = () => {
      dispatch({
        type: APP_ACTIONS.SET_NETWORK_STATUS,
        payload: { status: 'offline' }
      })
      showNotification('Connection lost. Some features may not work.', 'warning')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Cache cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      const newCache = new Map()
      
      for (const [key, value] of state.cache.entries()) {
        if (now - value.timestamp < value.ttl) {
          newCache.set(key, value)
        }
      }
      
      if (newCache.size !== state.cache.size) {
        dispatch({
          type: APP_ACTIONS.CLEAR_CACHE,
          payload: {}
        })
        
        // Set the cleaned cache
        setTimeout(() => {
          dispatch({
            type: 'SET_CACHE_BULK',
            payload: { cache: newCache }
          })
        }, 0)
      }
    }, 60000) // Clean every minute
    
    return () => clearInterval(cleanupInterval)
  }, [state.cache])
  
  // Update page title
  useEffect(() => {
    document.title = state.pageTitle
  }, [state.pageTitle])
  
  // Loading functions
  const setLoading = (type, value) => {
    dispatch({
      type: APP_ACTIONS.SET_LOADING,
      payload: { type, value }
    })
  }
  
  // Error functions
  const setError = (type, error) => {
    dispatch({
      type: APP_ACTIONS.SET_ERROR,
      payload: { type, error }
    })
  }
  
  const clearError = (type) => {
    dispatch({
      type: APP_ACTIONS.CLEAR_ERROR,
      payload: { type }
    })
  }
  
  // Notification functions
  const showNotification = (message, type = 'info', duration = 5000) => {
    dispatch({
      type: APP_ACTIONS.SET_NOTIFICATION,
      payload: { message, type, duration }
    })
    
    // Auto-hide notification
    setTimeout(() => {
      hideNotification()
    }, duration)
  }
  
  const hideNotification = () => {
    dispatch({
      type: APP_ACTIONS.CLEAR_NOTIFICATION
    })
  }
  
  // Theme functions
  const setTheme = (theme) => {
    dispatch({
      type: APP_ACTIONS.SET_THEME,
      payload: { theme }
    })
    
    localStorage.setItem('app-theme', theme)
    
    // Update CSS variables or class names
    document.documentElement.setAttribute('data-theme', theme)
  }
  
  // Language functions
  const setLanguage = (language) => {
    dispatch({
      type: APP_ACTIONS.SET_LANGUAGE,
      payload: { language }
    })
    
    localStorage.setItem('app-language', language)
  }
  
  // Cache functions
  const setCache = (key, data, ttl) => {
    dispatch({
      type: APP_ACTIONS.SET_CACHE,
      payload: { key, data, ttl }
    })
  }
  
  const getCache = (key) => {
    const cached = state.cache.get(key)
    if (!cached) return null
    
    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      clearCache(key)
      return null
    }
    
    return cached.data
  }
  
  const clearCache = (key) => {
    dispatch({
      type: APP_ACTIONS.CLEAR_CACHE,
      payload: { key }
    })
  }
  
  // Page title function
  const setPageTitle = (title) => {
    const fullTitle = title 
      ? `${title} | Urjja Pratishthan Prakashalay`
      : 'Urjja Pratishthan Prakashalay'
    
    dispatch({
      type: APP_ACTIONS.SET_PAGE_TITLE,
      payload: { title: fullTitle }
    })
  }
  
  // Utility functions
  const isOnline = () => state.networkStatus === 'online'
  const isLoading = (type = 'global') => state.loading[type]
  const hasError = (type = 'global') => !!state.error[type]
  const getError = (type = 'global') => state.error[type]
  
  const value = {
    // State
    ...state,
    
    // Loading
    setLoading,
    isLoading,
    
    // Errors
    setError,
    clearError,
    hasError,
    getError,
    
    // Notifications
    showNotification,
    hideNotification,
    
    // Theme & Language
    setTheme,
    setLanguage,
    
    // Cache
    setCache,
    getCache,
    clearCache,
    
    // Page
    setPageTitle,
    
    // Utilities
    isOnline
  }
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use app context
export function useApp() {
  const context = useContext(AppContext)
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  
  return context
}

export default AppContext