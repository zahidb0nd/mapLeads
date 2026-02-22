import { useState, useEffect, useRef, useCallback } from 'react'
import { Search as SearchIcon, MapPin, Loader2, RefreshCw, AlertCircle, Tag, X } from 'lucide-react'
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

// Format a Nominatim result into a short, readable label
function formatSuggestion(item) {
  const a = item.address || {}
  const parts = [
    a.suburb || a.neighbourhood || a.village || a.town || a.city_district,
    a.city || a.town || a.county,
    a.state,
    a.country,
  ].filter(Boolean)
  // Deduplicate consecutive identical parts
  const deduped = parts.filter((p, i) => p !== parts[i - 1])
  return deduped.slice(0, 4).join(', ')
}

export default function SearchForm({ onSearchComplete }) {
  const { searchFilters, setSearchFilters } = useStore()
  const { search, geocodeCity, isLoading, error } = useBusinessSearch()
  const { warning, error: toastError } = useToast()

  const [localQuery,    setLocalQuery]    = useState(searchFilters.query    || '')
  const [localLocation, setLocalLocation] = useState(searchFilters.location || '')
  const [geolocating,   setGeolocating]   = useState(false)
  const [lastSubmit,    setLastSubmit]     = useState(null)

  // Autocomplete state
  const [suggestions,      setSuggestions]      = useState([])
  const [showSuggestions,  setShowSuggestions]  = useState(false)
  const [suggestLoading,   setSuggestLoading]   = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const debounceRef = useRef(null)
  const wrapperRef  = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback((value) => {
    clearTimeout(debounceRef.current)
    if (value.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    // Skip if it looks like coordinates
    if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(value.trim())) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      setSuggestLoading(true)
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}&limit=6`)
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data)
          setShowSuggestions(true)
          setActiveSuggestion(-1)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch {
        setSuggestions([])
      } finally {
        setSuggestLoading(false)
      }
    }, 300)
  }, [])

  const handleLocationChange = (e) => {
    const val = e.target.value
    setLocalLocation(val)
    fetchSuggestions(val)
  }

  const selectSuggestion = (item) => {
    const label = formatSuggestion(item)
    setLocalLocation(label)
    setSearchFilters({
      location: label,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    })
    setSuggestions([])
    setShowSuggestions(false)
    setActiveSuggestion(-1)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[activeSuggestion])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

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
        setSuggestions([])
        setShowSuggestions(false)
        setGeolocating(false)
      },
      () => {
        warning('Location unavailable', 'Unable to get your location. Type a city name instead.')
        setGeolocating(false)
      }
    )
  }

  const geocodeLocation = async (locationText) => {
    // Check if already cached
    if (
      searchFilters.location === locationText &&
      searchFilters.bbox
    ) {
      return { bbox: searchFilters.bbox }
    }
    
    // Check if coordinates were manually entered
    const coordMatch = locationText.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
    if (coordMatch) {
      const latitude = parseFloat(coordMatch[1])
      const longitude = parseFloat(coordMatch[2])
      // Clear bbox when using coordinates
      setSearchFilters({ bbox: null })
      return { latitude, longitude }
    }
    
    // Geocode city to get bounding box
    try {
      const result = await geocodeCity(locationText)
      return { bbox: result.bbox }
    } catch (err) {
      // If city geocoding fails, show the specific error message
      throw err
    }
  }

  const doSearch = async (query, location) => {
    setShowSuggestions(false)
    
    try {
      const geoData = await geocodeLocation(location)
      
      // Update filters with geocoding results
      const filters = {
        query,
        location,
        categories: searchFilters.categories || []
      }
      
      // Use bbox if available, otherwise fall back to lat/lon
      if (geoData.bbox) {
        filters.bbox = geoData.bbox
        // Clear lat/lon when using bbox
        filters.latitude = null
        filters.longitude = null
      } else if (geoData.latitude && geoData.longitude) {
        filters.latitude = geoData.latitude
        filters.longitude = geoData.longitude
        filters.bbox = null
      }
      
      setSearchFilters(filters)
      setLastSubmit({ query, location })
      
      // Execute search with the geocoded data
      const results = await search(filters)
      if (onSearchComplete) onSearchComplete(results)
    } catch (err) {
      toastError('Search failed', err.message)
      return
    }
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
        {/* Location input with autocomplete */}
        <div className="flex-1 relative" ref={wrapperRef}>
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple pointer-events-none z-10" aria-hidden="true" />
          <input
            type="text"
            value={localLocation}
            onChange={handleLocationChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="City, town or locality..."
            required
            aria-label="Location"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            autoComplete="off"
            className="input-base pl-10 pr-8 h-14 rounded-xl md:rounded-l-xl md:rounded-r-none text-base"
          />
          {/* Clear button */}
          {localLocation && (
            <button
              type="button"
              onClick={() => { setLocalLocation(''); setSuggestions([]); setShowSuggestions(false) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors z-10"
              aria-label="Clear location"
            >
              {suggestLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <X className="h-4 w-4" />
              }
            </button>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full mt-1 rounded-xl border shadow-card overflow-hidden z-50"
              style={{ background: '#13111C', borderColor: '#2E2A45' }}
              role="listbox"
            >
              {suggestions.map((item, i) => {
                const label = formatSuggestion(item)
                const type = item.type || item.class || ''
                return (
                  <li
                    key={item.place_id}
                    role="option"
                    aria-selected={i === activeSuggestion}
                    onMouseDown={() => selectSuggestion(item)}
                    onMouseEnter={() => setActiveSuggestion(i)}
                    className={[
                      'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-sm',
                      i === activeSuggestion ? 'bg-purple-subtle text-text-primary' : 'text-text-secondary hover:bg-bg-elevated',
                    ].join(' ')}
                  >
                    <MapPin className="h-4 w-4 text-purple flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-text-primary">{label}</p>
                      {type && <p className="text-xs text-text-muted capitalize">{type}</p>}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
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
