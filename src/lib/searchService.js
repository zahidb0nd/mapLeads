// Hardcoded Bangalore bounding box: [lon_min, lat_min, lon_max, lat_max]
const BANGALORE_BBOX = [77.4601, 12.8340, 77.7800, 13.1390]

/**
 * Check if a place's coordinates are within a bounding box
 * @param {Object} place - Geoapify place feature
 * @param {Array} bbox - Bounding box [lon_min, lat_min, lon_max, lat_max]
 * @returns {boolean} True if place is within bounds
 */
const isInBounds = (place, bbox) => {
  const [lon_min, lat_min, lon_max, lat_max] = bbox
  const p = place.properties || {}
  const [longitude, latitude] = place.geometry?.coordinates || []
  
  const lat = p.lat || latitude
  const lon = p.lon || longitude
  
  if (!lat || !lon) return false
  
  return (
    lon >= lon_min &&
    lon <= lon_max &&
    lat >= lat_min &&
    lat <= lat_max
  )
}

/**
 * Check if a place meets quality criteria
 * @param {Object} place - Geoapify place feature
 * @returns {boolean} True if place meets quality standards
 */
const isQualityResult = (place) => {
  const p = place.properties
  
  if (!p) return false
  
  // Must have a name with length > 2
  if (!p.name || p.name.length <= 2) return false
  
  // Must have address_line1 OR city field
  if (!p.address_line1 && !p.city) return false
  
  return true
}

/**
 * Calculate quality score for a place based on available data
 * @param {Object} place - Transformed place object
 * @returns {number} Quality score (higher is better)
 */
const getQualityScore = (place) => {
  let score = 0
  
  if (place.name) score += 10
  if (place.tel) score += 20
  if (place.formatted_address || place.address) score += 15
  if (place.opening_hours) score += 10
  if (place.categories?.length > 0) score += 5
  if (place.latitude && place.longitude) score += 5
  if (place.name && place.name.length < 3) score -= 20
  if (!place.locality) score -= 10
  
  return score
}

/**
 * Fetch businesses from Geoapify for a single category bucket
 * @param {string} bucket - Geoapify category string (e.g., 'catering.restaurant')
 * @returns {Promise<Array>} Array of place features
 */
const fetchGeoapifyBucket = async (bucket) => {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY
  
  console.log('[MapLeads] API key present:', !!apiKey)
  
  if (!apiKey) {
    throw new Error('Geoapify API key is not configured')
  }

  const [lon_min, lat_min, lon_max, lat_max] = BANGALORE_BBOX

  const url = 
    `https://api.geoapify.com/v2/places` +
    `?categories=${bucket}` +
    `&filter=rect:${lon_min},${lat_min},${lon_max},${lat_max}` +
    `&limit=500` +
    `&apiKey=${apiKey}`

  console.log(`[MapLeads] Fetching bucket: ${bucket}`)

  const response = await fetch(url)
  
  if (response.status === 400) {
    console.warn(`[MapLeads] Invalid category: ${bucket}`)
    return []
  }
  
  if (!response.ok) {
    console.warn(`Bucket ${bucket} failed:`, response.status)
    return []
  }

  const data = await response.json()
  const features = data.features || []
  console.log(`[MapLeads] Bucket ${bucket} returned ${features.length} places`)
  return features
}

/**
 * Transform a Geoapify place feature to our app's format
 * @param {Object} feature - Geoapify place feature
 * @returns {Object} Transformed place object
 */
const transformPlace = (feature) => {
  const p = feature.properties || {}
  const [longitude, latitude] = feature.geometry?.coordinates || []

  return {
    fsq_id: p.place_id,
    name: p.name || 'Unknown',
    address: p.address_line2 || '',
    formatted_address: p.formatted || '',
    locality: p.city || p.suburb || '',
    region: p.state || '',
    postcode: p.postcode || '',
    country: p.country || '',
    latitude: p.lat || latitude,
    longitude: p.lon || longitude,
    categories: (p.categories || [])
      .filter(c => c.split('.').length <= 2)
      .map(c => ({
        id: c,
        name: c.split('.').pop().replace(/_/g, ' '),
        icon: null
      })),
    distance: null,
    tel: p.contact?.phone || p.phone || null,
    email: p.contact?.email || p.email || null,
    website: p.website || null,
    social_media: null,
    opening_hours: p.opening_hours || null,
    raw_data: p
  }
}

/**
 * Deduplicate results by place_id and filter out places with websites
 * @param {Array} results - Array of place features
 * @returns {Array} Filtered and deduplicated places
 */
const deduplicateAndFilter = (results) => {
  console.log(`[MapLeads] Deduplicating ${results.length} total results`)
  
  // Deduplicate by place_id
  const seen = new Map()
  results.forEach(place => {
    const id = place.properties?.place_id
    if (id && !seen.has(id)) {
      seen.set(id, place)
    }
  })

  console.log(`[MapLeads] After deduplication: ${seen.size} unique places`)

  // Filter: no website, has name
  const filtered = [...seen.values()].filter(place => {
    const p = place.properties
    return (
      p?.name &&
      p.name.length > 2 &&
      !p.website
    )
  })

  console.log(`[MapLeads] After filtering (no website): ${filtered.length} places`)

  // Filter: must be in bounds
  const inBounds = filtered.filter(place => isInBounds(place, BANGALORE_BBOX))
  console.log(`[MapLeads] After filtering (in bounds): ${inBounds.length} places`)

  // Filter: quality results only
  const quality = inBounds.filter(place => isQualityResult(place))
  console.log(`[MapLeads] After filtering (quality): ${quality.length} places`)

  // Transform to app format and add quality score
  const transformed = quality.map(place => {
    const transformed = transformPlace(place)
    transformed.qualityScore = getQualityScore(transformed)
    return transformed
  })
  
  // Sort by quality score descending
  return transformed.sort((a, b) => b.qualityScore - a.qualityScore)
}

/**
 * Get cached search results from PocketBase
 * @param {Object} pb - PocketBase instance
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Array|null>} Cached results or null if not found/expired
 */
export const getCachedResults = async (pb, cacheKey) => {
  try {
    const now = new Date().toISOString()
    const records = await pb.collection('search_cache').getFullList({
      filter: `cache_key = "${cacheKey}" && expires_at > "${now}"`
    })
    
    if (records.length > 0) {
      console.log(`[MapLeads] Cache hit for key: ${cacheKey}`)
      return records[0].results_json
    }
    
    console.log(`[MapLeads] Cache miss for key: ${cacheKey}`)
    return null
  } catch (error) {
    console.warn('[MapLeads] Cache retrieval error:', error)
    return null
  }
}

/**
 * Save search results to PocketBase cache
 * @param {Object} pb - PocketBase instance
 * @param {string} cacheKey - Cache key
 * @param {string} city - City name
 * @param {string} category - Category name
 * @param {Array} results - Search results
 * @returns {Promise<void>}
 */
export const saveCachedResults = async (pb, cacheKey, city, category, results) => {
  try {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    
    const data = {
      cache_key: cacheKey,
      results_json: results,
      city: city,
      category: category || 'all',
      result_count: results.length,
      expires_at: expiresAt.toISOString()
    }
    
    // Try to find existing record
    const existing = await pb.collection('search_cache').getFullList({
      filter: `cache_key = "${cacheKey}"`
    })
    
    if (existing.length > 0) {
      // Update existing
      await pb.collection('search_cache').update(existing[0].id, data)
      console.log(`[MapLeads] Cache updated for key: ${cacheKey}`)
    } else {
      // Create new
      await pb.collection('search_cache').create(data)
      console.log(`[MapLeads] Cache created for key: ${cacheKey}`)
    }
  } catch (error) {
    console.warn('[MapLeads] Cache save error:', error)
  }
}

/**
 * Fetch all businesses for a given category from Geoapify
 * @param {string} category - Category name (e.g., 'restaurants', 'all')
 * @returns {Promise<Array>} Filtered businesses without websites
 */
export const fetchAllBusinesses = async (category) => {
  const { CATEGORY_MAP, CATEGORY_BUCKETS } = await import('./categoryMap.js')

  // Single category search
  if (category && category !== 'all') {
    const geoapifyCategory = CATEGORY_MAP[category.toLowerCase()]
    
    if (!geoapifyCategory) {
      console.warn(`Unknown category: ${category}`)
      return []
    }

    const results = await fetchGeoapifyBucket(geoapifyCategory)
    return deduplicateAndFilter(results)
  }

  // All categories — parallel fetch
  const allResults = await Promise.all(
    CATEGORY_BUCKETS.map(bucket => fetchGeoapifyBucket(bucket))
  )

  return deduplicateAndFilter(allResults.flat())
}
