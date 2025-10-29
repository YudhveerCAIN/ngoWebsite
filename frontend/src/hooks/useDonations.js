import React, { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { donationAPI } from '../utils/api'
import { useApi } from './useApi'

/**
 * Custom hook for managing donation data and operations
 * @returns {Object} Donation data, actions, and state
 */
export function useDonations() {
	const {
		donations,
		setDonationsLoading,
		setDonationsError,
		setDonations,
		setDonationStats,
		addDonation,
		addNotification
	} = useApp()

	// Fetch all donations
	const { data, loading, error, refetch } = useApi(
		donationAPI.getAll,
		[],
		{
			autoFetch: true,
			cacheKey: 'donations',
			showErrorNotification: true
		}
	)

	// Update global state when data changes
	React.useEffect(() => {
		if (data) {
			setDonations(data)
		}
	}, [data, setDonations])

	// Create donation
	const createDonation = useCallback(async (donationData) => {
		try {
			setDonationsLoading(true)
			const newDonation = await donationAPI.create(donationData)
			addDonation(newDonation)
			addNotification({
				type: 'success',
				message: 'Thank you for your generous donation!'
			})
			return newDonation
		} catch (error) {
			setDonationsError(error.message)
			addNotification({
				type: 'error',
				message: 'Failed to process donation'
			})
			throw error
		} finally {
			setDonationsLoading(false)
		}
	}, [setDonationsLoading, setDonationsError, addDonation, addNotification])

	// Process payment
	const processPayment = useCallback(async (paymentData) => {
		try {
			setDonationsLoading(true)
			const result = await donationAPI.processPayment(paymentData)
			addNotification({
				type: 'success',
				message: 'Payment processed successfully!'
			})
			return result
		} catch (error) {
			setDonationsError(error.message)
			addNotification({
				type: 'error',
				message: 'Payment processing failed'
			})
			throw error
		} finally {
			setDonationsLoading(false)
		}
	}, [setDonationsLoading, setDonationsError, addNotification])

	// Get donation receipt
	const getReceipt = useCallback(async (donationId) => {
		try {
			const receipt = await donationAPI.getReceipt(donationId)
			return receipt
		} catch (error) {
			addNotification({
				type: 'error',
				message: 'Failed to generate receipt'
			})
			throw error
		}
	}, [addNotification])

	// Fetch donation statistics
	const fetchStats = useCallback(async () => {
		try {
			const stats = await donationAPI.getStats()
			setDonationStats(stats)
			return stats
		} catch (error) {
			setDonationsError(error.message)
			throw error
		}
	}, [setDonationStats, setDonationsError])

	return {
		donations: donations.data,
		stats: donations.stats,
		loading: donations.loading || loading,
		error: donations.error || error,
		createDonation,
		processPayment,
		getReceipt,
		fetchStats,
		refetch
	}
}