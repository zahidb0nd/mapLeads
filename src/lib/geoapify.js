const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY
const PROXY_BASE_URL = '/api'

class GeoapifyAPI {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  /**
   * Geocode a city name to get its bounding box
   * @param {string} cityName - City name to geocode (e.g., "Austin, USA")
   * @returns {Promise<{bbox: number[], name: string, country: string}>}
   */
  async geocodeCityToBbox(cityName) {
    // Step 1 — Validate the API key exists
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY
    
    if (!apiKey) {
      console.warn('[MapLeads] Geocoding failed: GEOAPIFY_API_KEY is not configured')
      throw new Error('Search is unavailable. Please contact support.')
    }

    try {
      const response = await fetch(
        `${PROXY_BASE_URL}/geoapify/geocode?text=${encodeURIComponent(cityName)}&type=city&limit=1`
      )

      // Step 2 — Check response.ok before parsing
      if (!response.ok) {
        console.warn(`[MapLeads] Geocoding failed: API returned status ${response.status}`)
        throw new Error(`Geocoding API returned status ${response.status}`)
      }

      // Step 3 — Validate content type before parsing as JSON
      const contentType = response.headers.get('content-type')
      
      if (!contentType?.includes('application/json')) {
        console.warn('[MapLeads] Geocoding failed: Expected JSON but got HTML. API key may be invalid or missing.')
        throw new Error('Expected JSON but got HTML. API key may be invalid or missing.')
      }
      
      const data = await response.json()
      
      // Step 4 — Show user-friendly error messages (404 or no results)
      if (!data.features || data.features.length === 0) {
        console.warn(`[MapLeads] Geocoding failed: City "${cityName}" not found`)
        throw new Error(`We couldn't find "${cityName}". Try adding the country e.g. 'Austin, USA' or 'Mumbai, India'`)
      }

      const feature = data.features[0]
      const bbox = feature.bbox // [lon_min, lat_min, lon_max, lat_max]
      
      if (!bbox || bbox.length !== 4) {
        console.warn('[MapLeads] Geocoding failed: Invalid bounding box received from geocoding service')
        throw new Error('Search is unavailable. Please contact support.')
      }

      return {
        bbox,
        name: feature.properties.city || feature.properties.name,
        country: feature.properties.country,
        state: feature.properties.state,
        formatted: feature.properties.formatted
      }
    } catch (error) {
      // Step 5 — Add console warnings for debugging
      console.warn('[MapLeads] Geocoding failed:', error.message)
      
      // Step 4 — Map internal errors to UI messages
      if (error.message.includes('not configured')) {
        throw new Error('Search is unavailable. Please contact support.')
      }
      
      if (error.message.includes('HTML')) {
        throw new Error('Search is unavailable. Please contact support.')
      }
      
      if (error.message.includes('404') || error.message.includes("We couldn't find")) {
        // Already has user-friendly message, re-throw as-is
        throw error
      }
      
      if (error.message.includes('status')) {
        throw new Error('Search is unavailable. Please contact support.')
      }
      
      // Default case - already has appropriate message
      throw error
    }
  }

  async searchPlaces({ query, latitude, longitude, radius = 5000, categories = [], limit = 50, bbox = null }) {
    if (!this.apiKey) {
      throw new Error('Geoapify API key is not configured')
    }

    let filter
    if (bbox && bbox.length === 4) {
      // Use bounding box filter: rect:lon_min,lat_min,lon_max,lat_max
      filter = `rect:${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`
    } else if (latitude && longitude) {
      // Use circle filter as fallback
      filter = `circle:${longitude},${latitude},${radius}`
    } else {
      throw new Error('Either bbox or latitude/longitude is required')
    }

    const params = new URLSearchParams({
      filter,
      limit: Math.min(limit, 500).toString(),
      lang: 'en',
    })

    // Build category filter:
    // 1. If explicit category ids were passed (from category chips), map them directly.
    // 2. Else if the query text matches a known category keyword, use that.
    // 3. Otherwise fall back to broad category set.
    let resolvedCategories = ''
    if (categories.length > 0) {
      resolvedCategories = categories
        .map(id => GeoapifyAPI.getCategoryById(id))
        .filter(Boolean)
        .join(',')
    } else if (query) {
      const fromQuery = GeoapifyAPI.getCategoryById(query.trim().toLowerCase())
      if (fromQuery) resolvedCategories = fromQuery
    }
    params.append(
      'categories',
      resolvedCategories || 'commercial,catering,service,leisure,sport,healthcare,education,entertainment,tourism'
    )

    // Do not use Geoapify's strict 'name' filter — it would exclude places
    // whose name doesn't literally contain the search term (e.g. searching
    // "cafe" would miss "Blue Tokai" or "Third Wave"). Category filtering
    // above already narrows results to the correct business type.

    try {
      const response = await fetch(`${PROXY_BASE_URL}/geoapify/places?${params}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch places')
      }

      const data = await response.json()
      return this.transformResults(data.features || [])
    } catch (error) {
      console.error('Geoapify API Error:', error)
      throw error
    }
  }

  async getPlaceDetails(placeId) {
    if (!this.apiKey) {
      throw new Error('Geoapify API key is not configured')
    }

    try {
      const response = await fetch(`${PROXY_BASE_URL}/geoapify/place-details?id=${placeId}&_endpoint=place-details`)

      if (!response.ok) {
        throw new Error('Failed to fetch place details')
      }

      const data = await response.json()
      const features = data.features || []
      if (features.length === 0) throw new Error('Place not found')
      return this.transformPlace(features[0])
    } catch (error) {
      console.error('Geoapify API Error:', error)
      throw error
    }
  }

  transformResults(features) {
    return features.map(feature => this.transformPlace(feature))
  }

  transformPlace(feature) {
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

  // Filter places without websites
  filterPlacesWithoutWebsite(places) {
    return places.filter(place => !place.website)
  }

  static getCategoryById(id) {
    const map = {
      // Catering
      'restaurant': 'catering.restaurant',
      'restaurants': 'catering.restaurant',
      'cafe': 'catering.cafe',
      'cafes': 'catering.cafe',
      'café': 'catering.cafe',
      'cafés': 'catering.cafe',
      'coffee': 'catering.cafe',
      'coffee shop': 'catering.cafe',
      'bar': 'catering.bar',
      'bars': 'catering.bar',
      'pub': 'catering.bar',
      'pubs': 'catering.bar',
      'fast food': 'catering.fast_food',
      'bakery': 'catering.bakery',
      'bakeries': 'catering.bakery',
      // Retail & commercial
      'retail': 'commercial',
      'shop': 'commercial.shopping_mall',
      'shops': 'commercial.shopping_mall',
      'store': 'commercial',
      'stores': 'commercial',
      'supermarket': 'commercial.supermarket',
      'supermarkets': 'commercial.supermarket',
      // Services
      'salon': 'service.beauty',
      'salons': 'service.beauty',
      'beauty': 'service.beauty',
      'barber': 'service.beauty.hairdresser',
      'barbers': 'service.beauty.hairdresser',
      'hairdresser': 'service.beauty.hairdresser',
      'spa': 'service.beauty.spa',
      'massage': 'service.beauty.massage',
      'auto repair': 'service.vehicle.repair',
      'auto_repair': 'service.vehicle.repair',
      'mechanic': 'service.vehicle.repair',
      'mechanics': 'service.vehicle.repair',
      'car wash': 'service.vehicle.car_wash',
      'plumber': 'service',
      'plumbers': 'service',
      'electrician': 'service',
      'electricians': 'service',
      'laundry': 'service.cleaning.laundry',
      'dry cleaning': 'service.cleaning.dry_cleaning',
      'tailor': 'service.tailor',
      // Sport & fitness
      'gym': 'sport.fitness',
      'gyms': 'sport.fitness',
      'fitness': 'sport.fitness',
      'fitness centre': 'sport.fitness.fitness_centre',
      'swimming pool': 'sport.swimming_pool',
      // Healthcare
      'doctor': 'healthcare',
      'doctors': 'healthcare',
      'clinic': 'healthcare.clinic_or_praxis',
      'clinics': 'healthcare.clinic_or_praxis',
      'hospital': 'healthcare.hospital',
      'hospitals': 'healthcare.hospital',
      'pharmacy': 'healthcare.pharmacy',
      'pharmacies': 'healthcare.pharmacy',
      'dentist': 'healthcare.dentist',
      'dentists': 'healthcare.dentist',
      // Accommodation
      'hotel': 'accommodation.hotel',
      'hotels': 'accommodation.hotel',
      'hostel': 'accommodation.hostel',
      'guest house': 'accommodation.guest_house',
      // Tourism & leisure
      'landmark': 'tourism.attraction',
      'landmarks': 'tourism.attraction',
      'attraction': 'tourism.attraction',
      'museum': 'entertainment.museum',
      'park': 'leisure.park',
    }
    return map[id] || null
  }

  // Get popular categories for the UI
  static getPopularCategories() {
    return [
      { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
      { id: 'cafe', name: 'Café', icon: '☕' },
      { id: 'retail', name: 'Retail', icon: '🛍️' },
      { id: 'salon', name: 'Salon', icon: '💇' },
      { id: 'gym', name: 'Gym', icon: '🏋️' },
      { id: 'doctor', name: 'Doctor', icon: '🏥' },
      { id: 'auto_repair', name: 'Auto Repair', icon: '🔧' },
      { id: 'bar', name: 'Bar', icon: '🍺' },
      { id: 'hotel', name: 'Hotel', icon: '🏨' },
      { id: 'landmark', name: 'Landmark', icon: '🏛️' },
    ]
  }
}

const geoapifyAPI = new GeoapifyAPI(GEOAPIFY_API_KEY)

export default geoapifyAPI
