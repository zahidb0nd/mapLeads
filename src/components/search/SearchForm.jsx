import { useState } from 'react'
import { Search as SearchIcon, MapPin, Loader2, RefreshCw, AlertCircle, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import useStore from '@/stores/useStore'
import { useBusinessSearch } from '@/hooks/useBusinessSearch'
import { useToast } from '@/components/ui/toast'

const RADIUS_OPTIONS = [
  { value: 1000,  label: '1 km' },
  { value: 2000,  label: '2 km' },
  { value: 5000,  label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 25000, label: '25 km' },
]

export default function SearchForm({ onSearchComplete }) {
  const { searchFilters, setSearchFilters } = useStore()
  const { search, isLoading, error } = useBusinessSearch()
  const { warning, error: toastError } = useToast()

  const [localQuery,    setLocalQuery]    = useState(searchFilters.query    || '')
  const [localLocation, setLocalLocation] = useState(searchFilters.location || '')
  const [geolocating,   setGeolocating]   = useState(false)
  const [lastSubmit,    setLastSubmit]     = useState(null)

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      warning('Not supported', 'Geolocation is not supported by your browser.')
      return
    }
    setGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        const loc = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        setSearchFilters({ latitude, longitude, location: loc })
        setLocalLocation(loc)
        setGeolocating(false)
      },
      () => {
        warning('Location unavailable', 'Unable to get your location. Type a city name instead.')
        setGeolocating(false)
      }
    )
  }

  const geocodeLocation = async (locationText) => {
    if (
      searchFilters.location === locationText &&
      searchFilters.latitude &&
      searchFilters.longitude
    ) {
      return { latitude: searchFilters.latitude, longitude: searchFilters.longitude }
    }
    const coordMatch = locationText.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
    if (coordMatch) {
      return { latitude: parseFloat(coordMatch[1]), longitude: parseFloat(coordMatch[2]) }
    }
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(locationText)}`)
    const data = await response.json()
    if (!data || data.length === 0) {
      throw new Error(`Could not find "${locationText}". Try a different city name.`)
    }
    return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }
  }

  const doSearch = async (query, location) => {
    let lat = searchFilters.latitude, lng = searchFilters.longitude
    try {
      const coords = await geocodeLocation(location)
      lat = coords.latitude; lng = coords.longitude
    } catch (err) {
      toastError('Location not found', err.message)
      return
    }
    setSearchFilters({ query, location, latitude: lat, longitude: lng })
    setLastSubmit({ query, location })
    const results = await search({ query, latitude: lat, longitude: lng, categories: searchFilters.categories || [] })
    if (onSearchComplete) onSearchComplete(results)
  }

  const handleSubmit = (e) => { e.preventDefault(); doSearch(localQuery, localLocation) }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-danger/30 bg-danger-subtle">
          <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-danger font-semibold">Search failed</p>
            <p className="text-xs text-danger/80 mt-0.5">{error}</p>
          </div>
          {lastSubmit && (
            <Button type="button" variant="danger" size="sm" onClick={() => doSearch(lastSubmit.query, lastSubmit.location)}>
              <RefreshCw className="h-3 w-3" />Retry
            </Button>
          )}
        </div>
      )}

      {/* Desktop: inline row | Mobile: stacked */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Location input */}
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple pointer-events-none z-10" aria-hidden="true" />
          <input
            type="text"
            value={localLocation}
            onChange={e => setLocalLocation(e.target.value)}
            placeholder="City, town or locality..."
            required
            aria-label="Location"
            className="input-base pl-10 h-14 rounded-xl md:rounded-l-xl md:rounded-r-none text-base"
          />
        </div>

        {/* Category input */}
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none z-10" aria-hidden="true" />
          <input
            type="text"
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            placeholder="Business type (optional)..."
            aria-label="Business type"
            className="input-base pl-10 h-14 rounded-xl md:rounded-none text-base"
          />
        </div>

        {/* Search button */}
        <button
          type="submit"
          disabled={isLoading || !localLocation.trim()}
          className="btn-primary h-14 px-6 rounded-xl md:rounded-l-none md:rounded-r-xl w-full md:w-auto flex-shrink-0 relative overflow-hidden"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <SearchIcon className="h-5 w-5" />
              <span>Search</span>
            </>
          )}
        </button>

        {/* GPS button */}
        <button
          type="button"
          onClick={handleGeolocation}
          disabled={geolocating}
          aria-label="Use my location"
          title="Use my location"
          className="btn-secondary h-14 px-4 rounded-xl flex-shrink-0"
        >
          {geolocating
            ? <Loader2 className="h-5 w-5 animate-spin" />
            : <MapPin className="h-5 w-5 text-purple" />
          }
        </button>
      </div>

      {/* Radius */}
      <div className="flex items-center gap-3">
        <Label htmlFor="radius" className="mb-0 whitespace-nowrap">Radius:</Label>
        <Select
          id="radius"
          value={searchFilters.radius || 5000}
          onChange={e => setSearchFilters({ radius: parseInt(e.target.value) })}
          className="w-32 py-2 min-h-[40px]"
        >
          {RADIUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </div>
    </form>
  )
}
