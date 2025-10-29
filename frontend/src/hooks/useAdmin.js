import React, { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { adminAPI } from '../utils/api'
import { useApi } from './useApi'

/**
 * Custom hook for admin operations and authentication
 * @returns {Object} Admin data, actions, and state
 */
export function useAdmin() {
	const {
		user,
		isAuthenticated,
		authLoading,
		authError,
		admin,
		setAuthLoading,
		setAuthError,
		setUser,
		logout,
		setAdminLoading,
		setAdminError,
		setAdminDashboard,
		addNotification
	} = useApp()

	// Fetch dashboard data
	const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useApi(
		adminAPI.getDashboard,
		[],
		{
			autoFetch: isAuthenticated,
			cacheKey: 'admin-dashboard',
			showErrorNotification: true
		}
	)

	// Update global state when dashboard data changes
	React.useEffect(() => {
		if (dashboardData) {
			setAdminDashboard(dashboardData)
		}
	}, [dashboardData, setAdminDashboard])

	// Login function
	const login = useCallback(async (credentials) => {
		try {
			setAuthLoading(true)
			setAuthError(null)
			
			const response = await adminAPI.login(credentials)
			
			// Store token
			if (response.token) {
				localStorage.setItem('authToken', response.token)
			}
			
			// Set user data
			setUser(response.user || response)
			
			addNotification({
				type: 'success',
				message: 'Login successful!'
			})
			
			return response
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || 'Login failed'
			setAuthError(errorMessage)
			addNotification({
				type: 'error',
				message: errorMessage
			})
			throw error
		} finally {
			setAuthLoading(false)
		}
	}, [setAuthLoading, setAuthError, setUser, addNotification])

	// Logout function
	const handleLogout = useCallback(() => {
		logout()
		addNotification({
			type: 'info',
			message: 'Logged out successfully'
		})
	}, [logout, addNotification])

	// Get profile
	const getProfile = useCallback(async () => {
		try {
			const profile = await adminAPI.getProfile()
			setUser(profile)
			return profile
		} catch (error) {
			setAuthError(error.message)
			throw error
		}
	}, [setUser, setAuthError])

	// Update profile
	const updateProfile = useCallback(async (profileData) => {
		try {
			const updatedProfile = await adminAPI.updateProfile(profileData)
			setUser(updatedProfile)
			addNotification({
				type: 'success',
				message: 'Profile updated successfully!'
			})
			return updatedProfile
		} catch (error) {
			addNotification({
				type: 'error',
				message: 'Failed to update profile'
			})
			throw error
		}
	}, [setUser, addNotification])

	// Check authentication status
	const checkAuth = useCallback(async () => {
		const token = localStorage.getItem('authToken')
		if (!token) {
			return false
		}

		try {
			const profile = await getProfile()
			return !!profile
		} catch (error) {
			localStorage.removeItem('authToken')
			logout()
			return false
		}
	}, [getProfile, logout])

	return {
		// Auth state
		user,
		isAuthenticated,
		authLoading,
		authError,
		
		// Dashboard state
		dashboard: admin.dashboard,
		dashboardLoading: admin.loading || dashboardLoading,
		dashboardError: admin.error || dashboardError,
		
		// Actions
		login,
		logout: handleLogout,
		getProfile,
		updateProfile,
		checkAuth,
		refetchDashboard
	}
}