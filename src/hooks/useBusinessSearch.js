import { useState } from 'react'
import geoapifyAPI from '@/lib/geoapify'
import useStore from '@/stores/useStore'

// Hardcoded Bangalore bounding box: [lon_min, lat_min, lon_max, lat_max]
const BANGALORE_BBOX = [77.4601, 12.8340, 77.7800, 13.1390]

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

  const search = async (customFilters = {}) => {
    const filters = { ...searchFilters, ...customFilters }

    setIsLoading(true)
    setIsSearching(true)
    setError(null)
    setSearchError(null)

    try {
      // Always search Bangalore using hardcoded bbox
      const results = await geoapifyAPI.searchPlaces({
        query: filters.query,
        categories: filters.categories,
        bbox: BANGALORE_BBOX, // Always use Bangalore bbox
        limit: 50
      })

      // Filter places without websites
      const placesWithoutWebsite = geoapifyAPI.filterPlacesWithoutWebsite(results)

      setSearchResults(placesWithoutWebsite)

      // Save to search history
      await addSearchToHistory({
        query: filters.query || 'General',
        location: 'Bangalore, India',
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
    getPlaceDetails,
    isLoading,
    error
  }
}
