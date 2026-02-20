import { useState, useEffect } from 'react'
import { Search as SearchIcon, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import useStore from '@/stores/useStore'
import { useBusinessSearch } from '@/hooks/useBusinessSearch'
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
  const { search, isLoading } = useBusinessSearch()
  const [localQuery, setLocalQuery] = useState(searchFilters.query || '')
  const [localLocation, setLocalLocation] = useState(searchFilters.location || '')
  const [selectedCategories, setSelectedCategories] = useState(searchFilters.categories || [])
  const [geolocating, setGeolocating] = useState(false)

  const categories = foursquareAPI.constructor.getPopularCategories()

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
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
      (error) => {
        console.error('Geolocation error:', error)
        alert('Unable to retrieve your location')
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    let latitude = searchFilters.latitude
    let longitude = searchFilters.longitude

    // Geocode the typed location if needed
    try {
      const coords = await geocodeLocation(localLocation)
      latitude = coords.latitude
      longitude = coords.longitude
    } catch (err) {
      alert(err.message)
      return
    }

    // Update filters in store with resolved coordinates
    setSearchFilters({
      query: localQuery,
      location: localLocation,
      latitude,
      longitude,
      categories: selectedCategories
    })

    // Perform search
    const results = await search({
      query: localQuery,
      latitude,
      longitude,
      categories: selectedCategories
    })

    if (onSearchComplete) {
      onSearchComplete(results)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
