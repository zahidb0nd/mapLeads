# City Geocoding with Bounding Box - Implementation Summary

## Overview
Implemented city-based geocoding that retrieves a bounding box before running Geoapify Places searches, as requested.

## Implementation Details

### 1. **Geoapify API Integration** (`src/lib/geoapify.js`)

#### New Method: `geocodeCityToBbox(cityName)`
- **Endpoint:** `GET https://api.geoapify.com/v1/geocode/search?text={cityName}&type=city&limit=1&apiKey={KEY}`
- **Returns:** 
  ```javascript
  {
    bbox: [lon_min, lat_min, lon_max, lat_max],
    name: "City Name",
    country: "Country",
    state: "State",
    formatted: "Full formatted address"
  }
  ```
- **Error Handling:** Throws user-friendly error message:
  - `"We couldn't find '{cityName}'. Try adding the country e.g. 'Austin, USA' or 'Mumbai, India'"`

#### Updated Method: `searchPlaces()`
- **New Parameter:** `bbox` (optional)
- **Behavior:**
  - If `bbox` provided: Uses `rect:lon_min,lat_min,lon_max,lat_max` filter
  - Otherwise: Falls back to `circle:longitude,latitude,radius` filter
  - Validates that either `bbox` OR `latitude/longitude` is provided

---

### 2. **Proxy Server** (`proxy-server.cjs`)

#### New Endpoint: `/api/geoapify/geocode`
```javascript
GET /api/geoapify/geocode?text={cityName}&type=city&limit=1
```
- Proxies to: `https://api.geoapify.com/v1/geocode/search`
- Automatically adds API key from environment variables
- Returns full Geoapify response with bbox

---

### 3. **Store State** (`src/stores/useStore.js`)

#### Updated `searchFilters` Object:
```javascript
searchFilters: {
  query: '',
  location: '',
  latitude: null,
  longitude: null,
  radius: 5000,
  categories: [],
  bbox: null  // NEW: [lon_min, lat_min, lon_max, lat_max]
}
```

---

### 4. **Business Search Hook** (`src/hooks/useBusinessSearch.js`)

#### New Function: `geocodeCity(cityName)`
- Calls `geoapifyAPI.geocodeCityToBbox()`
- Stores bbox in search filters
- Updates location with formatted city name
- Provides clear error messages

#### Updated `search()` Function:
- Validates either `bbox` OR `latitude/longitude` is present
- Passes `bbox` to Geoapify API when available
- Maintains backward compatibility with coordinate-based searches

---

### 5. **Search Form** (`src/components/search/SearchForm.jsx`)

#### Updated `geocodeLocation()`:
1. **Cache Check:** Returns cached bbox if location hasn't changed
2. **Coordinate Detection:** If user enters lat/lon coordinates, clears bbox and uses those
3. **City Geocoding:** For city names, calls `geocodeCity()` to get bbox
4. **Error Propagation:** Shows specific error messages from geocoding service

#### Updated `doSearch()`:
- Determines whether to use bbox or lat/lon based on geocoding result
- Clears opposite value (if using bbox, clears lat/lon and vice versa)
- Updates search filters with appropriate location data
- Executes search with bbox when available

---

## User Flow

### Example 1: City Search
```
User types "Austin, USA"
    ↓
geocodeCity("Austin, USA")
    ↓
GET /api/geoapify/geocode?text=Austin%2C%20USA&type=city
    ↓
Returns bbox: [-97.9383, 30.0986, -97.5698, 30.5168]
    ↓
Store bbox in searchFilters
    ↓
searchPlaces({ bbox, query, categories })
    ↓
Uses filter: rect:-97.9383,30.0986,-97.5698,30.5168
    ↓
Returns businesses in Austin bounding box
```

### Example 2: Coordinate Search (Backward Compatible)
```
User types "30.2672, -97.7431" (coordinates)
    ↓
Detect coordinate pattern
    ↓
Clear bbox, use latitude/longitude
    ↓
searchPlaces({ latitude: 30.2672, longitude: -97.7431, radius: 5000 })
    ↓
Uses filter: circle:-97.7431,30.2672,5000
    ↓
Returns businesses within radius
```

### Example 3: City Not Found
```
User types "Nonexistent City"
    ↓
geocodeCity("Nonexistent City")
    ↓
Geoapify returns empty features array
    ↓
Error: "We couldn't find 'Nonexistent City'. Try adding the country e.g. 'Austin, USA' or 'Mumbai, India'"
    ↓
Display error in toast notification
```

---

## Error Handling

### 1. **City Not Found**
- **Trigger:** Geoapify returns no results
- **Message:** `"We couldn't find '{cityName}'. Try adding the country e.g. 'Austin, USA' or 'Mumbai, India'"`
- **Display:** Toast notification with red error styling

### 2. **Invalid Bounding Box**
- **Trigger:** API returns bbox with incorrect format
- **Message:** `"Invalid bounding box received from geocoding service"`
- **Fallback:** None (shows error)

### 3. **Network Errors**
- **Trigger:** Fetch fails or API is unreachable
- **Message:** Generic error with retry option
- **Display:** Error banner with "Retry" button

---

## Testing Checklist

### Basic City Searches
- [x] Search for "Austin, USA" → Should use bbox
- [x] Search for "Mumbai, India" → Should use bbox
- [x] Search for "London, UK" → Should use bbox
- [x] Search for "Tokyo, Japan" → Should use bbox

### Edge Cases
- [x] Search for city name only "Austin" → May need country for accuracy
- [x] Search for ambiguous city "Springfield" → Returns first match
- [x] Search for non-existent city → Shows helpful error
- [x] Search with coordinates "30.2672, -97.7431" → Uses circle filter

### State Management
- [x] bbox stored in searchFilters
- [x] bbox persists across searches
- [x] bbox cleared when using coordinates
- [x] lat/lon cleared when using bbox

### Backward Compatibility
- [x] Geolocation button still works (uses coordinates)
- [x] Autocomplete suggestions still work (Nominatim)
- [x] Manual coordinate entry still works
- [x] Existing searches with lat/lon continue to work

---

## Benefits

### 1. **Better Geographic Coverage**
- Bbox covers entire city area, not just a radius from center
- More comprehensive results for large metropolitan areas

### 2. **Improved Accuracy**
- City boundaries are more accurate than arbitrary circles
- Avoids missing businesses at city edges

### 3. **Consistent User Experience**
- Users can type city names naturally
- Clear error messages guide users to correct format

### 4. **API Efficiency**
- Single geocoding call per unique city
- Results cached in state for repeated searches

---

## Configuration Required

### Environment Variables
Ensure `VITE_GEOAPIFY_API_KEY` is set in `.env`:
```bash
VITE_GEOAPIFY_API_KEY=your_geoapify_api_key_here
```

### Proxy Server
Start the proxy server before running the app:
```bash
node proxy-server.cjs
```

The proxy runs on `http://localhost:3001` and handles:
- `/api/geoapify/geocode` → Geoapify Geocoding API
- `/api/geoapify/places` → Geoapify Places API
- `/api/geoapify/place-details` → Geoapify Place Details API

---

## Files Modified

1. **src/lib/geoapify.js** - Added `geocodeCityToBbox()` method, updated `searchPlaces()`
2. **proxy-server.cjs** - Added `/api/geoapify/geocode` endpoint
3. **src/stores/useStore.js** - Added `bbox` to `searchFilters`
4. **src/hooks/useBusinessSearch.js** - Added `geocodeCity()` function, updated validation
5. **src/components/search/SearchForm.jsx** - Updated geocoding logic to use bbox

---

## API Reference

### Geoapify Geocoding API
```
GET https://api.geoapify.com/v1/geocode/search
  ?text={cityName}
  &type=city
  &limit=1
  &apiKey={KEY}
```

**Response:**
```json
{
  "features": [{
    "bbox": [-97.9383, 30.0986, -97.5698, 30.5168],
    "properties": {
      "city": "Austin",
      "country": "United States",
      "state": "Texas",
      "formatted": "Austin, TX, United States"
    }
  }]
}
```

### Geoapify Places API (with bbox)
```
GET https://api.geoapify.com/v2/places
  ?filter=rect:-97.9383,30.0986,-97.5698,30.5168
  &categories=catering,commercial,service
  &limit=50
  &apiKey={KEY}
```

---

## Future Enhancements

### Possible Improvements:
1. **Country Selection Dropdown** - Help users disambiguate city names
2. **City Suggestions** - Show city autocomplete with country info
3. **Bbox Visualization** - Draw bbox on map to show search area
4. **Multi-City Search** - Allow searching multiple cities at once
5. **Bbox Adjustment** - Let users manually adjust bbox boundaries

---

## Troubleshooting

### Issue: "We couldn't find [city]" error
**Solution:** Add country name, e.g., "Paris, France" instead of just "Paris"

### Issue: No results returned
**Solution:** Check if city name is spelled correctly, try adding state/country

### Issue: API key error
**Solution:** Verify `VITE_GEOAPIFY_API_KEY` is set in `.env` and proxy server is running

### Issue: Proxy connection failed
**Solution:** Ensure proxy server is running on port 3001: `node proxy-server.cjs`

---

## Conclusion

The city geocoding feature is now fully implemented and integrated into the MapLeads search flow. Users can search by city name and get comprehensive results covering the entire city area using Geoapify's bounding box functionality.
