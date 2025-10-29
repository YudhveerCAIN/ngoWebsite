import React, { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { eventAPI } from '../utils/api'
import { useApi } from './useApi'

/**
 * Custom hook for managing event data and operations
 * @returns {Object} Event data, actions, and state
 */
export function useEvents() {
	const {
		events,
		setEventsLoading,
		setEventsError,
		setEvents,
		setUpcomingEvents,
		setPastEvents,
		addEvent,
		updateEvent,
		removeEvent,
		addNotification
	} = useApp()

	// Fetch all events
	const { data, loading, error, refetch } = useApi(
		eventAPI.getAll,
		[],
		{
			autoFetch: true,
			cacheKey: 'events',
			showErrorNotification: true
		}
	)

	// Update global state when data changes
	React.useEffect(() => {
		if (data) {
			setEvents(data)
		}
	}, [data, setEvents])

	// Fetch upcoming events
	const fetchUpcoming = useCallback(async () => {
		try {
			const upcomingEvents = await eventAPI.getUpcoming()
			setUpcomingEvents(upcomingEvents)
			return upcomingEvents
		} catch (error) {
			setEventsError(error.message)
			throw error
		}
	}, [setUpcomingEvents, setEventsError])

	// Fetch past events
	const fetchPast = useCallback(async () => {
		try {
			const pastEvents = await eventAPI.getPast()
			setPastEvents(pastEvents)
			return pastEvents
		} catch (error) {
			setEventsError(error.message)
			throw error
		}
	}, [setPastEvents, setEventsError])

	// Create event
	const createEvent = useCallback(async (eventData) => {
		try {
			setEventsLoading(true)
			const newEvent = await eventAPI.create(eventData)
			addEvent(newEvent)
			addNotification({
				type: 'success',
				message: 'Event created successfully!'
			})
			return newEvent
		} catch (error) {
			setEventsError(error.message)
			addNotification({
				type: 'error',
				message: 'Failed to create event'
			})
			throw error
		} finally {
			setEventsLoading(false)
		}
	}, [setEventsLoading, setEventsError, addEvent, addNotification])

	// Update event
	const updateEventData = useCallback(async (id, eventData) => {
		try {
			const updatedEvent = await eventAPI.update(id, eventData)
			updateEvent(updatedEvent)
			addNotification({
				type: 'success',
				message: 'Event updated successfully!'
			})
			return updatedEvent
		} catch (error) {
			addNotification({
				type: 'error',
				message: 'Failed to update event'
			})
			throw error
		}
	}, [updateEvent, addNotification])

	// Delete event
	const deleteEvent = useCallback(async (id) => {
		try {
			await eventAPI.delete(id)
			removeEvent(id)
			addNotification({
				type: 'success',
				message: 'Event deleted successfully'
			})
		} catch (error) {
			addNotification({
				type: 'error',
				message: 'Failed to delete event'
			})
			throw error
		}
	}, [removeEvent, addNotification])

	// Register for event
	const registerForEvent = useCallback(async (eventId, registrationData) => {
		try {
			const result = await eventAPI.register(eventId, registrationData)
			addNotification({
				type: 'success',
				message: 'Successfully registered for the event!'
			})
			return result
		} catch (error) {
			addNotification({
				type: 'error',
				message: 'Failed to register for event'
			})
			throw error
		}
	}, [addNotification])

	return {
		events: events.data,
		upcoming: events.upcoming,
		past: events.past,
		loading: events.loading || loading,
		error: events.error || error,
		fetchUpcoming,
		fetchPast,
		createEvent,
		updateEvent: updateEventData,
		deleteEvent,
		registerForEvent,
		refetch
	}
}