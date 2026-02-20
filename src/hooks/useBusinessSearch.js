import { useState } from 'react'
import foursquareAPI from '@/lib/geoapify'
import useStore from '@/stores/useStore'

export function useBusinessSearch() {
  const { 
    searchFilters, 
    setSearchResults, 
    setIsSearching, 
    setSearchError,
    addSearchToHistory
  } = useStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = async (customFilters = {}) => {
    const filters = { ...searchFilters, ...customFilters }
    
    // Validate required fields
    if (!filters.latitude || !filters.longitude) {
      const errorMsg = 'Location coordinates are required'
      setError(errorMsg)
      setSearchError(errorMsg)
      return []
    }

    setIsLoading(true)
    setIsSearching(true)
    setError(null)
    setSearchError(null)

    try {
      // Search places using Foursquare API
      const results = await foursquareAPI.searchPlaces({
        query: filters.query,
        latitude: filters.latitude,
        longitude: filters.longitude,
        radius: filters.radius,
        categories: filters.categories,
        limit: 50
      })

      // Filter places without websites
      const placesWithoutWebsite = foursquareAPI.filterPlacesWithoutWebsite(results)

      setSearchResults(placesWithoutWebsite)

      // Save to search history (temporarily disabled)
      // await addSearchToHistory({
      //   query: filters.query || 'All businesses',
      //   location: filters.location,
      //   latitude: filters.latitude,
      //   longitude: filters.longitude,
      //   radius: filters.radius,
      //   categories: filters.categories,
      //   results_count: placesWithoutWebsite.length
      // })

      return placesWithoutWebsite
    } catch (err) {
      const errorMsg = err.message || 'Failed to search businesses'
      setError(errorMsg)
      setSearchError(errorMsg)
      console.error('Search error:', err)
      return []
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const getPlaceDetails = async (fsqId) => {
    setIsLoading(true)
    setError(null)

    try {
      const details = await foursquareAPI.getPlaceDetails(fsqId)
      return details
    } catch (err) {
      const errorMsg = err.message || 'Failed to get place details'
      setError(errorMsg)
      console.error('Get place details error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    search,
    getPlaceDetails,
    isLoading,
    error
  }
}
