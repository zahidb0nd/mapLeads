// Hardcoded Bangalore bounding box: [lon_min, lat_min, lon_max, lat_max]
const BANGALORE_BBOX = [77.4601, 12.8340, 77.7800, 13.1390]

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

  // Transform to app format
  return filtered.map(transformPlace)
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
