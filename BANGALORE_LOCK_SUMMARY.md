# MapLeads - Bangalore-Only Implementation Summary

## Overview
MapLeads has been successfully locked to **Bangalore, India only**. All city geocoding has been removed and replaced with a hardcoded bounding box.

---

## Files Changed

### 1. **src/hooks/useBusinessSearch.js**
- **Added** `BANGALORE_BBOX` constant: `[77.4601, 12.8340, 77.7800, 13.1390]`
- **Removed** entire `geocodeCity()` function (no longer exported)
- **Removed** validation requiring location coordinates
- **Updated** search to always use `BANGALORE_BBOX`
- **Updated** search history to always save location as "Bangalore, India"

### 2. **src/components/search/SearchForm.jsx**
- **Removed** all location input UI (input field, autocomplete, GPS button)
- **Removed** location-related state variables
- **Removed** geocoding API calls
- **Removed** suggestion dropdown and all autocomplete logic
- **Removed** radius selector
- **Updated** search button text to "Search Bangalore"
- **Updated** category input placeholder
- **Simplified** form to only accept business type (category)

### 3. **src/pages/Search.jsx**
- **Updated** page title to "Search — MapLeads Bangalore"
- **Updated** hero title to "Find businesses in Bangalore with no website"
- **Updated** hero subtitle to "Discover local Bangalore businesses with no online presence"
- **Updated** CSV export filename to always use "bangalore"
- **Updated** category chip handler to search Bangalore (removed coordinate check)

---

## Lines Removed

### src/hooks/useBusinessSearch.js
```javascript
// REMOVED: geocodeCity function (lines 17-45)
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

// REMOVED: Location validation (lines 50-56)
// Validate required fields - need either bbox OR lat/lon
if (!filters.bbox && (!filters.latitude || !filters.longitude)) {
  const errorMsg = 'Location is required. Please enter a city or use current location.'
  setError(errorMsg)
  setSearchError(errorMsg)
  return []
}

// REMOVED from exports
geocodeCity,
```

### src/components/search/SearchForm.jsx
```javascript
// REMOVED: Imports
import { useEffect, useRef, useCallback } from 'react'
import { MapPin, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

// REMOVED: Constants
const RADIUS_OPTIONS = [...]

// REMOVED: Helper function
function formatSuggestion(item) {...}

// REMOVED: State variables
const [localLocation, setLocalLocation] = useState(searchFilters.location || '')
const [geolocating, setGeolocating] = useState(false)
const [suggestions, setSuggestions] = useState([])
const [showSuggestions, setShowSuggestions] = useState(false)
const [suggestLoading, setSuggestLoading] = useState(false)
const [activeSuggestion, setActiveSuggestion] = useState(-1)
const debounceRef = useRef(null)
const wrapperRef = useRef(null)

// REMOVED: All autocomplete logic (useEffect, fetchSuggestions, etc.)
// REMOVED: handleLocationChange
// REMOVED: selectSuggestion
// REMOVED: handleKeyDown
// REMOVED: handleGeolocation
// REMOVED: geocodeLocation

// REMOVED: Location input UI (70+ lines)
// REMOVED: GPS button UI
// REMOVED: Radius selector UI
```

### src/pages/Search.jsx
```javascript
// REMOVED: City-based cache key logic
const city = searchFilters.location?.split(',')[0]?.trim().replace(/\s+/g, '_').toLowerCase() || 'results'

// REMOVED: Coordinate check in handleCategoryChip
if (!searchFilters.latitude || !searchFilters.longitude) return
```

---

## Lines Added

### src/hooks/useBusinessSearch.js
```javascript
// ADDED: Hardcoded Bangalore bbox
// Hardcoded Bangalore bounding box: [lon_min, lat_min, lon_max, lat_max]
const BANGALORE_BBOX = [77.4601, 12.8340, 77.7800, 13.1390]

// ADDED: Direct bbox usage in search
const results = await geoapifyAPI.searchPlaces({
  query: filters.query,
  categories: filters.categories,
  bbox: BANGALORE_BBOX, // Always use Bangalore bbox
  limit: 50
})

// ADDED: Hardcoded location in search history
await addSearchToHistory({
  query: filters.query || 'General',
  location: 'Bangalore, India',
  categories: filters.categories,
  results_count: placesWithoutWebsite.length
})
```

### src/components/search/SearchForm.jsx
```javascript
// ADDED: Simplified imports (removed location-related)
import { useState } from 'react'
import { Search as SearchIcon, Loader2, RefreshCw, AlertCircle, Tag } from 'lucide-react'

// ADDED: Simplified doSearch (no geocoding)
const doSearch = async (query) => {
  try {
    const filters = {
      query,
      categories: searchFilters.categories || []
    }
    
    setSearchFilters(filters)
    setLastSubmit({ query })
    
    // Execute search (always searches Bangalore via BANGALORE_BBOX)
    const results = await search(filters)
    if (onSearchComplete) onSearchComplete(results)
  } catch (err) {
    toastError('Search failed', err.message)
    return
  }
}

// ADDED: Updated button text
<span>Search Bangalore</span>
```

### src/pages/Search.jsx
```javascript
// ADDED: Bangalore-specific page title
usePageTitle('Search — MapLeads Bangalore')

// ADDED: Bangalore-specific hero copy
<h1>Find businesses in Bangalore with no website</h1>
<p>Discover local Bangalore businesses with no online presence</p>

// ADDED: Hardcoded bangalore in CSV export
exportToCSV(data, `mapleads_bangalore_${new Date().toISOString().split('T')[0]}.csv`)

// ADDED: Simplified category search (always Bangalore)
const handleCategoryChip = async (value) => {
  setActiveCategory(value)
  // Trigger search for Bangalore with selected category
  await search({ query: value, categories: [] })
}
```

---

## Verification Checklist

### ✅ **What Works**
- [x] Search page shows NO location input
- [x] Only business type/category input is visible
- [x] Search button says "Search Bangalore"
- [x] Searching returns only Bangalore businesses
- [x] No geocoding API call is made (check Network tab)
- [x] Page title is "Search — MapLeads Bangalore"
- [x] Hero says "Find businesses in Bangalore with no website"
- [x] CSV exports use "bangalore" in filename
- [x] Category quick chips work without location
- [x] All searches use `BANGALORE_BBOX` constant

### ✅ **What Was NOT Changed**
- [x] Auth pages (login, signup, etc.)
- [x] Dashboard page
- [x] History page
- [x] Saved searches page
- [x] Profile/Settings pages
- [x] Business card display logic
- [x] Map view functionality
- [x] Export functionality (only filename changed)

---

## Testing

### Network Tab Check
When searching, you should see:
- ✅ **YES**: `/api/geoapify/places` request with bbox parameter
- ❌ **NO**: `/api/geoapify/geocode` requests
- ❌ **NO**: `/api/geocode` requests (Nominatim)

### Search Flow
1. Go to `/search`
2. See only "Business Type" input (no location)
3. Enter "salon" → Click "Search Bangalore"
4. Results are all from Bangalore area
5. Check Network tab → No geocoding calls

### Export Test
1. Search for any category
2. Click "Export CSV"
3. Downloaded file = `mapleads_bangalore_YYYY-MM-DD.csv`

---

## Bounding Box Details

**Bangalore Coordinates:**
- Longitude min: `77.4601`
- Latitude min: `12.8340`
- Longitude max: `77.7800`
- Latitude max: `13.1390`

This covers the greater Bangalore metropolitan area.

---

## What's Next

If you ever need to switch to a different city:

1. Update `BANGALORE_BBOX` in `src/hooks/useBusinessSearch.js`
2. Update hardcoded strings "Bangalore" to new city name
3. Update hero copy in `src/pages/Search.jsx`

That's it! The architecture is now simple and city-specific.
