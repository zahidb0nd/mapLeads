import { useState, useEffect } from 'react'
import { Search as SearchIcon, MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import useStore from '@/stores/useStore'
import { useBusinessSearch } from '@/hooks/useBusinessSearch'
import { useToast } from '@/components/ui/toast'
import foursquareAPI from '@/lib/geoapify'

const RADIUS_OPTIONS = [
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 25000, label: '25 km' },
]

export default function SearchForm({ onSearchComplete }) {
  const { searchFilters, setSearchFilters } = useStore()
  const { search, isLoading, error } = useBusinessSearch()
  const { warning, error: toastError } = useToast()
  const [localQuery, setLocalQuery] = useState(searchFilters.query || '')
  const [localLocation, setLocalLocation] = useState(searchFilters.location || '')
  const [selectedCategories, setSelectedCategories] = useState(searchFilters.categories || [])
  const [geolocating, setGeolocating] = useState(false)
  const [lastSubmitData, setLastSubmitData] = useState(null)

  const categories = foursquareAPI.constructor.getPopularCategories()

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      warning('Not supported', 'Geolocation is not supported by your browser.')
      return
    }

    setGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setSearchFilters({
          latitude,
          longitude,
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        })
        setLocalLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        setGeolocating(false)
      },
      (err) => {
        console.error('Geolocation error:', err)
        warning('Location unavailable', 'Unable to retrieve your location. Please type a city name instead.')
        setGeolocating(false)
      }
    )
  }

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      }
      return [...prev, categoryId]
    })
  }

  const geocodeLocation = async (locationText) => {
    // If already have coordinates in store (set via GPS), use them
    if (
      searchFilters.location === locationText &&
      searchFilters.latitude &&
      searchFilters.longitude
    ) {
      return { latitude: searchFilters.latitude, longitude: searchFilters.longitude }
    }

    // Try to parse as raw "lat,lng" coordinates
    const coordMatch = locationText.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
    if (coordMatch) {
      return { latitude: parseFloat(coordMatch[1]), longitude: parseFloat(coordMatch[2]) }
    }

    // Geocode via proxy to avoid CORS/rate-limit issues
    const response = await fetch(
      `/api/geocode?q=${encodeURIComponent(locationText)}`
    )
    const data = await response.json()
    if (!data || data.length === 0) {
      throw new Error(`Could not find location: "${locationText}". Try a different address or use the GPS button.`)
    }
    return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }
  }

  const doSearch = async (query, location, cats) => {
    let latitude = searchFilters.latitude
    let longitude = searchFilters.longitude

    try {
      const coords = await geocodeLocation(location)
      latitude = coords.latitude
      longitude = coords.longitude
    } catch (err) {
      toastError('Location not found', err.message || 'Could not find that location. Try a different city name.')
      return
    }

    setSearchFilters({ query, location, latitude, longitude, categories: cats })
    setLastSubmitData({ query, location, cats })

    const results = await search({ query, latitude, longitude, categories: cats })
    if (onSearchComplete) onSearchComplete(results)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await doSearch(localQuery, localLocation, selectedCategories)
  }

  const handleRetry = () => {
    if (lastSubmitData) {
      doSearch(lastSubmitData.query, lastSubmitData.location, lastSubmitData.cats)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error State with Retry */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-500 font-medium">Search failed</p>
            <p className="text-xs text-red-400 mt-0.5">{error}</p>
          </div>
          {lastSubmitData && (
            <Button type="button" variant="outline" size="sm" onClick={handleRetry} className="flex-shrink-0 border-red-500/30 text-red-500 hover:bg-red-500/10">
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
          )}
        </div>
      )}

      {/* Search Query */}
      <div className="space-y-2">
        <Label htmlFor="query">Business Type (Optional)</Label>
        <Input
          id="query"
          placeholder="e.g., restaurant, salon, gym..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to search all business types
        </p>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <div className="flex space-x-2">
          <Input
            id="location"
            placeholder="City, address, or coordinates"
            value={localLocation}
            onChange={(e) => setLocalLocation(e.target.value)}
            required
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGeolocation}
            disabled={geolocating}
          >
            {geolocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Click the location icon to use your current location
        </p>
      </div>

      {/* Radius */}
      <div className="space-y-2">
        <Label htmlFor="radius">Search Radius</Label>
        <Select
          id="radius"
          value={searchFilters.radius}
          onChange={(e) => setSearchFilters({ radius: parseInt(e.target.value) })}
        >
          {RADIUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label>Categories (Optional)</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge
              key={category.id}
              variant={selectedCategories.includes(category.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleCategoryToggle(category.id)}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Click to filter by specific categories
        </p>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading || !localLocation}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <SearchIcon className="mr-2 h-4 w-4" />
            Search Businesses
          </>
        )}
      </Button>
    </form>
  )
}
