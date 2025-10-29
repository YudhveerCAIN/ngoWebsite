/**
 * Loading state management utilities
 */

// Loading state types
export const LOADING_STATES = {
	IDLE: 'idle',
	LOADING: 'loading',
	SUCCESS: 'success',
	ERROR: 'error'
}

// Loading priorities for UI feedback
export const LOADING_PRIORITIES = {
	LOW: 'low',
	MEDIUM: 'medium',
	HIGH: 'high',
	CRITICAL: 'critical'
}

/**
 * Create a loading state object
 * @param {string} state - Loading state
 * @param {Object} options - Additional options
 * @returns {Object} Loading state object
 */
export function createLoadingState(state = LOADING_STATES.IDLE, options = {}) {
	const {
		message = null,
		progress = null,
		priority = LOADING_PRIORITIES.MEDIUM,
		startTime = null,
		error = null,
		data = null
	} = options

	return {
		state,
		message,
		progress,
		priority,
		startTime: startTime || (state === LOADING_STATES.LOADING ? Date.now() : null),
		error,
		data,
		isLoading: state === LOADING_STATES.LOADING,
		isSuccess: state === LOADING_STATES.SUCCESS,
		isError: state === LOADING_STATES.ERROR,
		isIdle: state === LOADING_STATES.IDLE
	}
}

/**
 * Loading state creators for common scenarios
 */
export const loadingStates = {
	idle: (options = {}) => 
		createLoadingState(LOADING_STATES.IDLE, options),
	
	loading: (message = 'Loading...', options = {}) => 
		createLoadingState(LOADING_STATES.LOADING, { message, ...options }),
	
	success: (data = null, options = {}) => 
		createLoadingState(LOADING_STATES.SUCCESS, { data, ...options }),
	
	error: (error = null, options = {}) => 
		createLoadingState(LOADING_STATES.ERROR, { error, ...options }),

	// Specific loading states for common operations
	saving: () => 
		loadingStates.loading('Saving...', { priority: LOADING_PRIORITIES.HIGH }),
	
	deleting: () => 
		loadingStates.loading('Deleting...', { priority: LOADING_PRIORITIES.HIGH }),
	
	updating: () => 
		loadingStates.loading('Updating...', { priority: LOADING_PRIORITIES.HIGH }),
	
	creating: () => 
		loadingStates.loading('Creating...', { priority: LOADING_PRIORITIES.HIGH }),
	
	fetching: (resource = 'data') => 
		loadingStates.loading(`Loading ${resource}...`, { priority: LOADING_PRIORITIES.MEDIUM }),
	
	uploading: (progress = null) => 
		loadingStates.loading('Uploading...', { 
			progress, 
			priority: LOADING_PRIORITIES.HIGH 
		}),
	
	processing: () => 
		loadingStates.loading('Processing...', { priority: LOADING_PRIORITIES.HIGH }),
	
	authenticating: () => 
		loadingStates.loading('Signing in...', { priority: LOADING_PRIORITIES.CRITICAL }),
	
	submitting: () => 
		loadingStates.loading('Submitting...', { priority: LOADING_PRIORITIES.HIGH }),
}

/**
 * Calculate loading duration
 * @param {Object} loadingState - Loading state object
 * @returns {number} Duration in milliseconds
 */
export function getLoadingDuration(loadingState) {
	if (!loadingState.startTime) {
		return 0
	}
	return Date.now() - loadingState.startTime
}

/**
 * Check if loading is taking too long
 * @param {Object} loadingState - Loading state object
 * @param {number} threshold - Threshold in milliseconds (default: 10 seconds)
 * @returns {boolean} True if loading is taking too long
 */
export function isLoadingTooLong(loadingState, threshold = 10000) {
	return loadingState.isLoading && getLoadingDuration(loadingState) > threshold
}

/**
 * Get appropriate loading message based on duration
 * @param {Object} loadingState - Loading state object
 * @returns {string} Loading message
 */
export function getLoadingMessage(loadingState) {
	if (!loadingState.isLoading) {
		return loadingState.message || ''
	}

	const duration = getLoadingDuration(loadingState)
	const baseMessage = loadingState.message || 'Loading...'

	if (duration > 15000) {
		return `${baseMessage} This is taking longer than usual...`
	} else if (duration > 10000) {
		return `${baseMessage} Please wait...`
	} else if (duration > 5000) {
		return `${baseMessage} Almost done...`
	}

	return baseMessage
}

/**
 * Combine multiple loading states
 * @param {Array} loadingStates - Array of loading state objects
 * @returns {Object} Combined loading state
 */
export function combineLoadingStates(loadingStates) {
	if (!loadingStates || loadingStates.length === 0) {
		return createLoadingState()
	}

	const hasError = loadingStates.some(state => state.isError)
	const hasLoading = loadingStates.some(state => state.isLoading)
	const allSuccess = loadingStates.every(state => state.isSuccess)

	if (hasError) {
		const errorState = loadingStates.find(state => state.isError)
		return createLoadingState(LOADING_STATES.ERROR, {
			error: errorState.error,
			message: errorState.message
		})
	}

	if (hasLoading) {
		const loadingState = loadingStates.find(state => state.isLoading)
		return createLoadingState(LOADING_STATES.LOADING, {
			message: loadingState.message,
			priority: Math.max(...loadingStates.map(s => s.priority || LOADING_PRIORITIES.MEDIUM))
		})
	}

	if (allSuccess) {
		return createLoadingState(LOADING_STATES.SUCCESS)
	}

	return createLoadingState()
}