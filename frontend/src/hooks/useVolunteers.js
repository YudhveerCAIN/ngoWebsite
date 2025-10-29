import React, { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { volunteerAPI } from '../utils/api'
import { useApi } from './useApi'

/**
 * Custom hook for managing volunteer data and operations
 * @returns {Object} Volunteer data, actions, and state
 */
export function useVolunteers() {
	const {
		volunteers,
		setVolunteersLoading,
		setVolunteersError,
		setVolunteers,
		setVolunteerStats,
		addVolunteer,
		updateVolunteer,
		removeVolunteer,
		addNotification
	} = useApp()

	// Fetch all volunteers
	const { data, loading, error, refetch } = useApi(
		volunteerAPI.getAll,
		[],
		{
			autoFetch: true,
			cacheKey: 'volunteers',
			showErrorNotification: true
		}
	)

	// Update global state when data changes
	React.useEffect(() => {
		if (data) {
			setVolunteers(data)
		}
	}, [data, setVolunteers])

	// Create volunteer
	const createVolunteer = useCallback(async (volunteerData) => {
		try {
			setVolunteersLoading(true)
			const newVolunteer = await volunteerAPI.create(volunteerData)
			addVolunteer(newVolunteer)
			addNotification({
				type: 'success',
				message: 'Volunteer application submitted successfully!'
			})
			return newVolunteer
		} catch (error) {
			setVolunteersError(error.message)
			addNotification({
				type: 'error',
				message: 'Failed to submit volunteer application'
			})
			throw error
		} finally {
			setVolunteersLoading(false)
		}
	}, [setVolunteersLoading, setVolunteersError, addVolunteer, addNotification])

	// Update volunteer status
	const updateVolunteerStatus = useCallback(async (id, status) => {
		try {
			const updatedVolunteer = await volunteerAPI.updateStatus(id, status)
			updateVolunteer(updatedVolunteer)
			addNotification({
				type: 'success',
				message: `Volunteer status updated to ${status}`
			})
			return updatedVolunteer
		} catch (error) {
			addNotification({
				type: 'error',
				message: 'Failed to update volunteer status'
			})
			throw error
		}
	}, [updateVolunteer, addNotification])

	// Delete volunteer
	const deleteVolunteer = useCallback(async (id) => {
		try {
			await volunteerAPI.delete(id)
			removeVolunteer(id)
			addNotification({
				type: 'success',
				message: 'Volunteer removed successfully'
			})
		} catch (error) {
			addNotification({
				type: 'error',
				message: 'Failed to remove volunteer'
			})
			throw error
		}
	}, [removeVolunteer, addNotification])

	// Fetch volunteer statistics
	const fetchStats = useCallback(async () => {
		try {
			const stats = await volunteerAPI.getStats()
			setVolunteerStats(stats)
			return stats
		} catch (error) {
			setVolunteersError(error.message)
			throw error
		}
	}, [setVolunteerStats, setVolunteersError])

	return {
		volunteers: volunteers.data,
		stats: volunteers.stats,
		loading: volunteers.loading || loading,
		error: volunteers.error || error,
		createVolunteer,
		updateVolunteerStatus,
		deleteVolunteer,
		fetchStats,
		refetch
	}
}