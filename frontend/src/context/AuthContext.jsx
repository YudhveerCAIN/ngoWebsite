import { createContext, useContext, useReducer, useEffect } from 'react'

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Initial auth state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    
    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token
      }
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        isLoading: false
      }
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const user = localStorage.getItem('adminUser')
        
        if (token && user) {
          const parsedUser = JSON.parse(user)
          
          // Validate token with server
          const response = await fetch('/api/auth/validate-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const result = await response.json()
            dispatch({
              type: AUTH_ACTIONS.SET_USER,
              payload: {
                user: result.user,
                token
              }
            })
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUser')
            dispatch({
              type: AUTH_ACTIONS.SET_USER,
              payload: { user: null, token: null }
            })
          }
        } else {
          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: { user: null, token: null }
          })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: { user: null, token: null }
        })
      }
    }
    
    initializeAuth()
  }, [])
  
  // Login function
  const login = async (token, user) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      // Store in localStorage
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(user))
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token, user }
      })
      
      return { success: true }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message }
      })
      return { success: false, error: error.message }
    }
  }
  
  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint
      if (state.token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear localStorage and state regardless of API call result
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }
  
  // Refresh token function
  const refreshToken = async () => {
    try {
      if (!state.token) {
        throw new Error('No token to refresh')
      }
      
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Token refresh failed')
      }
      
      const result = await response.json()
      
      // Update stored token
      localStorage.setItem('adminToken', result.token)
      
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN,
        payload: { token: result.token }
      })
      
      return { success: true, token: result.token }
    } catch (error) {
      console.error('Token refresh error:', error)
      logout() // Force logout on refresh failure
      return { success: false, error: error.message }
    }
  }
  
  // Update user profile
  const updateUser = (updatedUser) => {
    const newUser = { ...state.user, ...updatedUser }
    localStorage.setItem('adminUser', JSON.stringify(newUser))
    dispatch({
      type: AUTH_ACTIONS.SET_USER,
      payload: { user: newUser, token: state.token }
    })
  }
  
  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }
  
  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role
  }
  
  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin')
  }
  
  // Get authorization header
  const getAuthHeader = () => {
    return state.token ? `Bearer ${state.token}` : null
  }
  
  // Make authenticated API request
  const apiRequest = async (url, options = {}) => {
    const authHeader = getAuthHeader()
    
    if (!authHeader) {
      throw new Error('No authentication token available')
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    // Handle token expiration
    if (response.status === 401) {
      const refreshResult = await refreshToken()
      if (refreshResult.success) {
        // Retry request with new token
        return fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${refreshResult.token}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        })
      } else {
        logout()
        throw new Error('Authentication expired')
      }
    }
    
    return response
  }
  
  const value = {
    // State
    ...state,
    
    // Actions
    login,
    logout,
    refreshToken,
    updateUser,
    clearError,
    
    // Utilities
    hasRole,
    isAdmin,
    getAuthHeader,
    apiRequest
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export default AuthContext