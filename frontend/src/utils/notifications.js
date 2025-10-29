/**
 * Notification utility functions and constants
 */

// Notification types
export const NOTIFICATION_TYPES = {
	SUCCESS: 'success',
	ERROR: 'error',
	WARNING: 'warning',
	INFO: 'info'
}

// Default durations (in milliseconds)
export const NOTIFICATION_DURATIONS = {
	SUCCESS: 4000,
	ERROR: 6000,
	WARNING: 5000,
	INFO: 4000,
	PERSISTENT: 0 // Won't auto-dismiss
}

// Notification positions
export const NOTIFICATION_POSITIONS = {
	TOP_RIGHT: 'top-right',
	TOP_LEFT: 'top-left',
	TOP_CENTER: 'top-center',
	BOTTOM_RIGHT: 'bottom-right',
	BOTTOM_LEFT: 'bottom-left',
	BOTTOM_CENTER: 'bottom-center'
}

/**
 * Create a standardized notification object
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 * @returns {Object} Notification object
 */
export function createNotification(type, message, options = {}) {
	const {
		title = null,
		duration = NOTIFICATION_DURATIONS[type.toUpperCase()],
		position = NOTIFICATION_POSITIONS.TOP_RIGHT,
		dismissible = true,
		action = null,
		data = null
	} = options

	return {
		id: Date.now() + Math.random(),
		type,
		title,
		message,
		duration,
		position,
		dismissible,
		action,
		data,
		timestamp: new Date().toISOString()
	}
}

/**
 * Predefined notification creators for common scenarios
 */
export const notifications = {
	success: (message, options = {}) => 
		createNotification(NOTIFICATION_TYPES.SUCCESS, message, options),
	
	error: (message, options = {}) => 
		createNotification(NOTIFICATION_TYPES.ERROR, message, options),
	
	warning: (message, options = {}) => 
		createNotification(NOTIFICATION_TYPES.WARNING, message, options),
	
	info: (message, options = {}) => 
		createNotification(NOTIFICATION_TYPES.INFO, message, options),

	// Specific notification types for common actions
	saveSuccess: (entity = 'Item') => 
		notifications.success(`${entity} saved successfully!`),
	
	deleteSuccess: (entity = 'Item') => 
		notifications.success(`${entity} deleted successfully!`),
	
	updateSuccess: (entity = 'Item') => 
		notifications.success(`${entity} updated successfully!`),
	
	createSuccess: (entity = 'Item') => 
		notifications.success(`${entity} created successfully!`),
	
	saveError: (entity = 'Item') => 
		notifications.error(`Failed to save ${entity.toLowerCase()}. Please try again.`),
	
	deleteError: (entity = 'Item') => 
		notifications.error(`Failed to delete ${entity.toLowerCase()}. Please try again.`),
	
	updateError: (entity = 'Item') => 
		notifications.error(`Failed to update ${entity.toLowerCase()}. Please try again.`),
	
	createError: (entity = 'Item') => 
		notifications.error(`Failed to create ${entity.toLowerCase()}. Please try again.`),
	
	networkError: () => 
		notifications.error('Network error. Please check your connection and try again.'),
	
	validationError: (field = 'field') => 
		notifications.warning(`Please check the ${field} and try again.`),
	
	permissionError: () => 
		notifications.error('You do not have permission to perform this action.'),
	
	loginSuccess: () => 
		notifications.success('Welcome back! You have been logged in successfully.'),
	
	logoutSuccess: () => 
		notifications.info('You have been logged out successfully.'),
	
	loginError: () => 
		notifications.error('Invalid credentials. Please try again.'),
	
	sessionExpired: () => 
		notifications.warning('Your session has expired. Please log in again.', {
			duration: NOTIFICATION_DURATIONS.PERSISTENT
		}),
	
	formSubmitSuccess: () => 
		notifications.success('Form submitted successfully!'),
	
	formSubmitError: () => 
		notifications.error('Failed to submit form. Please check your input and try again.'),
	
	fileUploadSuccess: (filename = 'File') => 
		notifications.success(`${filename} uploaded successfully!`),
	
	fileUploadError: (filename = 'File') => 
		notifications.error(`Failed to upload ${filename}. Please try again.`),
	
	copySuccess: () => 
		notifications.success('Copied to clipboard!'),
	
	copyError: () => 
		notifications.error('Failed to copy to clipboard.'),
}

/**
 * Format error messages from API responses
 * @param {Error|Object} error - Error object or API response
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(error) {
	if (typeof error === 'string') {
		return error
	}
	
	if (error?.response?.data?.message) {
		return error.response.data.message
	}
	
	if (error?.response?.data?.error) {
		return error.response.data.error
	}
	
	if (error?.message) {
		return error.message
	}
	
	if (error?.response?.status) {
		switch (error.response.status) {
			case 400:
				return 'Bad request. Please check your input.'
			case 401:
				return 'Unauthorized. Please log in again.'
			case 403:
				return 'Access denied. You do not have permission.'
			case 404:
				return 'Resource not found.'
			case 422:
				return 'Validation error. Please check your input.'
			case 429:
				return 'Too many requests. Please try again later.'
			case 500:
				return 'Server error. Please try again later.'
			case 503:
				return 'Service unavailable. Please try again later.'
			default:
				return 'An unexpected error occurred.'
		}
	}
	
	return 'An unexpected error occurred.'
}