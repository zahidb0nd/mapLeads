const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY
const PROXY_BASE_URL = '/api'

class GeoapifyAPI {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  async searchPlaces({ query, latitude, longitude, radius = 5000, categories = [], limit = 50 }) {
    if (!this.apiKey) {
      throw new Error('Geoapify API key is not configured')
    }

    const params = new URLSearchParams({
      filter: `circle:${longitude},${latitude},${radius}`,
      limit: Math.min(limit, 500).toString(),
      lang: 'en',
    })

    // Map selected category ids to Geoapify category strings
    if (categories.length > 0) {
      const geoapifyCategories = categories
        .map(id => GeoapifyAPI.getCategoryById(id))
        .filter(Boolean)
        .join(',')
      if (geoapifyCategories) {
        params.append('categories', geoapifyCategories)
      }
    } else {
      params.append('categories', 'commercial,catering,service,leisure,sport,healthcare,education,entertainment,tourism')
    }

    if (query) {
      params.append('name', query)
    }

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
      const response = await fetch(`${PROXY_BASE_URL}/geoapify/place-details?id=${placeId}`)

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
      'restaurant': 'catering.restaurant',
      'cafe': 'catering.cafe',
      'retail': 'commercial',
      'salon': 'service.beauty',
      'gym': 'sport.fitness',
      'doctor': 'healthcare',
      'auto_repair': 'service.vehicle',
      'bar': 'catering.bar',
      'hotel': 'accommodation.hotel',
      'landmark': 'tourism.attraction',
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
