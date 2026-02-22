import { useState } from 'react'
import geoapifyAPI from '@/lib/geoapify'
import useStore from '@/stores/useStore'

export function useBusinessSearch() {
  const { 
    searchFilters, 
    setSearchResults, 
    setIsSearching, 
    setSearchError,
    setSearchFilters,
    addSearchToHistory
  } = useStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Geocode a city name and store the bbox in filters
   * @param {string} cityName - City name to geocode
   * @returns {Promise<{bbox: number[], name: string}>}
   */
  const geocodeCity = async (cityName) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await geoapifyAPI.geocodeCityToBbox(cityName)
      
      // Store bbox in search filters
      setSearchFilters({
        location: result.formatted || `${result.name}, ${result.country}`,
        bbox: result.bbox
      })
      
      return result
    } catch (err) {
      console.error('Geocode city error:', err)
      const errorMsg = err.message || 'Failed to find city location'
      setError(errorMsg)
      setSearchError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const search = async (customFilters = {}) => {
    const filters = { ...searchFilters, ...customFilters }
    
    // Validate required fields - need either bbox OR lat/lon
    if (!filters.bbox && (!filters.latitude || !filters.longitude)) {
      const errorMsg = 'Location is required. Please enter a city or use current location.'
      setError(errorMsg)
      setSearchError(errorMsg)
      return []
    }

    setIsLoading(true)
    setIsSearching(true)
    setError(null)
    setSearchError(null)

    try {
      // Search places using Geoapify API
      const results = await geoapifyAPI.searchPlaces({
        query: filters.query,
        latitude: filters.latitude,
        longitude: filters.longitude,
        radius: filters.radius,
        categories: filters.categories,
        bbox: filters.bbox, // Pass bbox if available
        limit: 50
      })

      // Filter places without websites
      const placesWithoutWebsite = geoapifyAPI.filterPlacesWithoutWebsite(results)

      setSearchResults(placesWithoutWebsite)

      // Save to search history
      await addSearchToHistory({
        query: filters.query || 'General',
        location: filters.location,
        latitude: filters.latitude,
        longitude: filters.longitude,
        radius: filters.radius,
        categories: filters.categories,
        results_count: placesWithoutWebsite.length
      })

      return placesWithoutWebsite
    } catch (err) {
      console.error('Search error:', err)
      let errorMsg = 'Search unavailable right now. Please try again in a moment.'
      if (err?.message?.toLowerCase().includes('network') ||
          err?.message?.toLowerCase().includes('fetch') ||
          err?.message?.toLowerCase().includes('failed to fetch')) {
        errorMsg = 'Connection error. Please check your internet and try again.'
      } else if (err?.message?.toLowerCase().includes('location') ||
                 err?.message?.toLowerCase().includes('geocod')) {
        errorMsg = err.message
      }
      setError(errorMsg)
      setSearchError(errorMsg)
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
      const details = await geoapifyAPI.getPlaceDetails(fsqId)
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
    geocodeCity,
    getPlaceDetails,
    isLoading,
    error
  }
}
