# City Geocoding Testing Guide

This guide walks you through testing the city geocoding implementation in MapLeads.

---

## Prerequisites

### 1. Environment Setup
Ensure you have the following in your `.env` file:
```bash
VITE_GEOAPIFY_API_KEY=your_geoapify_api_key_here
VITE_POCKETBASE_URL=your_pocketbase_url_here
```

### 2. Dependencies
```bash
npm install
```

---

## Testing Methods

### Method 1: Automated API Testing (Recommended First)

This tests the Geoapify API directly without running the full application.

```bash
node test-city-geocoding.js
```

**What it tests:**
- City geocoding with country (e.g., "Austin, USA")
- City geocoding without country (e.g., "Austin")
- International cities
- Error handling for non-existent cities
- Bounding box format validation
- Response data structure

**Expected Output:**
```
🧪 Starting City Geocoding Tests

📍 Testing: "Austin, USA"
   ✅ PASS
   City: Austin
   Country: United States
   State: Texas
   Formatted: Austin, TX, United States
   BBox: [-97.9383, 30.0986, -97.5698, 30.5168]
   Dimensions: ~40.5 km (W) × 46.5 km (H)
```

---

### Method 2: Manual UI Testing

Test the full implementation through the user interface.

#### Step 1: Start the Proxy Server
```bash
node proxy-server.cjs
```

Expected output:
```
Proxy server running on http://localhost:3001
```

#### Step 2: Start the Development Server
In a new terminal:
```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### Step 3: Test in Browser

**A. Test City Search with Country**
1. Navigate to `/search` or `/dashboard`
2. In the location field, type: `Austin, USA`
3. In the business type field, type: `restaurants`
4. Click "Search"

**Expected Result:**
- ✅ No error message
- ✅ Loading indicator appears
- ✅ Results show restaurants in Austin
- ✅ Map displays Austin area with markers
- ✅ Console shows bbox in network request

**How to verify bbox is being used:**
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Look for request to `/api/geoapify/places`
4. Check the `filter` parameter - should be:
   ```
   filter=rect:-97.9383,30.0986,-97.5698,30.5168
   ```
   (NOT `filter=circle:...`)

---

**B. Test City Without Country**
1. Clear the location field
2. Type: `Austin` (without country)
3. Click "Search"

**Expected Result:**
- ✅ Should work but may show first match
- ✅ Could be Austin, Texas OR Austin, Minnesota, etc.
- ✅ No error (uses first result)

---

**C. Test International City**
1. Clear the location field
2. Type: `Mumbai, India`
3. Click "Search"

**Expected Result:**
- ✅ Results show businesses in Mumbai
- ✅ Map centers on Mumbai
- ✅ Bbox filter used in API request

---

**D. Test Non-Existent City**
1. Clear the location field
2. Type: `Nonexistent City`
3. Click "Search"

**Expected Result:**
- ✅ Error toast appears with message:
  ```
  "We couldn't find 'Nonexistent City'. Try adding the country e.g. 'Austin, USA' or 'Mumbai, India'"
  ```
- ❌ No search results (search should not execute)

---

**E. Test Coordinate Input (Backward Compatibility)**
1. Clear the location field
2. Type: `30.2672, -97.7431` (coordinates)
3. Click "Search"

**Expected Result:**
- ✅ Search uses circle filter (NOT bbox)
- ✅ Results show businesses near coordinates
- ✅ Network request shows:
  ```
  filter=circle:-97.7431,30.2672,5000
  ```

---

**F. Test Geolocation Button**
1. Click the "Use Current Location" button
2. Allow location access if prompted
3. Click "Search"

**Expected Result:**
- ✅ Uses your actual coordinates
- ✅ Uses circle filter
- ✅ bbox is null in state

---

### Method 3: State Inspection

Verify that bbox is properly stored in the application state.

#### Using Redux DevTools Extension

1. Install Redux DevTools browser extension
2. Navigate to `/search`
3. Search for a city (e.g., "Austin, USA")
4. Open Redux DevTools
5. Check `searchFilters` object

**Expected State:**
```javascript
searchFilters: {
  query: "restaurants",
  location: "Austin, TX, United States",
  latitude: null,
  longitude: null,
  radius: 5000,
  categories: [],
  bbox: [-97.9383, 30.0986, -97.5698, 30.5168]
}
```

#### Using React DevTools

1. Install React DevTools browser extension
2. Navigate to `/search`
3. Search for a city
4. Open React DevTools > Components tab
5. Find `SearchForm` component
6. Check the `useStore` hook state

---

## Test Cases Checklist

### Basic Functionality
- [ ] Search "Austin, USA" returns Austin, Texas results
- [ ] Search "Mumbai, India" returns Mumbai results
- [ ] Search "London, UK" returns London results
- [ ] Search "Tokyo, Japan" returns Tokyo results

### Error Handling
- [ ] Search "Nonexistent City" shows error message
- [ ] Error message includes example format
- [ ] Search does not execute when city not found
- [ ] Empty location field shows validation error

### Backward Compatibility
- [ ] Coordinate input "30.2672, -97.7431" works
- [ ] Geolocation button works
- [ ] Circle filter used for coordinates
- [ ] Previous searches with lat/lon still work

### State Management
- [ ] bbox stored in searchFilters when city search successful
- [ ] bbox cleared when using coordinates
- [ ] bbox persists across multiple searches with same city
- [ ] lat/lon cleared when using bbox

### Performance
- [ ] City geocoding completes in < 2 seconds
- [ ] Repeated searches for same city use cached bbox
- [ ] No unnecessary API calls

### Edge Cases
- [ ] City name with special characters (e.g., "São Paulo, Brazil")
- [ ] City name with spaces (e.g., "New York, USA")
- [ ] Very long city names
- [ ] Empty string in location field

---

## Debugging Common Issues

### Issue 1: "API key not configured" error

**Cause:** Missing or incorrect Geoapify API key

**Solution:**
1. Check `.env` file has `VITE_GEOAPIFY_API_KEY`
2. Restart dev server after adding key
3. Verify key is valid on Geoapify dashboard

---

### Issue 2: "Proxy connection failed"

**Cause:** Proxy server not running

**Solution:**
```bash
# Start proxy server
node proxy-server.cjs
```

Should see: `Proxy server running on http://localhost:3001`

---

### Issue 3: No results returned

**Possible Causes:**
1. City name misspelled
2. City requires country for disambiguation
3. API rate limit reached

**Solutions:**
1. Add country to city name: "Austin, USA"
2. Check Geoapify API usage on dashboard
3. Wait a minute and try again

---

### Issue 4: bbox is null in state

**Cause:** Geocoding failed silently

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. Proxy server logs

**Solution:**
1. Ensure proxy server is running
2. Check API key is valid
3. Verify network connection

---

### Issue 5: Using circle filter instead of bbox

**Cause:** Coordinates detected in location input

**Expected Behavior:**
- If input matches pattern `XX.XXX, -YY.YYY` → uses circle filter
- Otherwise → geocodes city and uses bbox

**Verify:**
- City names should NOT contain commas with numbers
- Use proper city format: "City, Country"

---

## Performance Benchmarks

Expected performance metrics:

| Operation | Target Time | Notes |
|-----------|-------------|-------|
| City Geocoding | < 1 second | Single API call |
| Places Search | < 2 seconds | With bbox filter |
| Total Search Time | < 3 seconds | Geocode + Search |
| Cached City Search | < 1 second | bbox already in state |

---

## API Rate Limits

**Geoapify Free Tier:**
- 3,000 requests/day
- ~125 requests/hour

**Optimization:**
- bbox cached in state (reduces geocoding calls)
- Only geocodes when location changes

---

## Console Debugging

Enable verbose logging to see what's happening:

**In Browser Console:**
```javascript
// Check current filters
console.log(useStore.getState().searchFilters)

// Check if bbox is set
console.log(useStore.getState().searchFilters.bbox)

// Force a geocode
// (paste in console while on search page)
const geocode = async () => {
  const result = await fetch('/api/geoapify/geocode?text=Austin,USA&type=city&limit=1')
  const data = await result.json()
  console.log('Geocode result:', data)
}
geocode()
```

---

## Network Tab Inspection

**What to look for in Network tab:**

### 1. Geocoding Request
```
Request URL: http://localhost:3001/api/geoapify/geocode?text=Austin%2CUSA&type=city&limit=1
Status: 200
Response: {
  "features": [{
    "bbox": [-97.9383, 30.0986, -97.5698, 30.5168],
    "properties": {
      "city": "Austin",
      "country": "United States",
      ...
    }
  }]
}
```

### 2. Places Search Request
```
Request URL: http://localhost:3001/api/geoapify/places?filter=rect:-97.9383,30.0986,-97.5698,30.5168&categories=...
Status: 200
```

**Key Point:** `filter` parameter should start with `rect:` for bbox searches

---

## Success Criteria

The implementation is working correctly if:

✅ City searches use bbox filter (`rect:...`)  
✅ Coordinate searches use circle filter (`circle:...`)  
✅ Error message matches specification exactly  
✅ bbox stored and persisted in state  
✅ No unnecessary re-geocoding of same city  
✅ Backward compatibility maintained  
✅ All test cases pass  

---

## Next Steps After Testing

Once testing is complete:

1. **Document any bugs found** - Create GitHub issues
2. **Add automated tests** - Jest/Vitest unit tests
3. **Add E2E tests** - Playwright/Cypress
4. **Monitor in production** - Track geocoding success rate
5. **Optimize if needed** - Add debouncing, better caching

---

## Getting Help

If you encounter issues:

1. Check this guide's debugging section
2. Review `CITY_GEOCODING_IMPLEMENTATION.md`
3. Check browser console for errors
4. Verify environment variables
5. Ensure proxy server is running

---

## Test Results Template

Use this template to document your testing:

```markdown
## Test Results - [Date]

### Environment
- Node version: 
- npm version: 
- Browser: 
- OS: 

### Automated Tests
- [ ] test-city-geocoding.js passed

### Manual UI Tests
- [ ] Austin, USA - bbox search
- [ ] Mumbai, India - bbox search
- [ ] Nonexistent City - error handling
- [ ] Coordinates - circle search
- [ ] Geolocation - circle search

### Issues Found
1. 
2. 

### Notes

```

---

Happy Testing! 🧪
