const FOURSQUARE_API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY
const BASE_URL = 'http://localhost:3001/api/foursquare' // Use proxy server to avoid CORS

class FoursquareAPI {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  async searchPlaces({ query, latitude, longitude, radius = 5000, categories = [], limit = 50 }) {
    if (!this.apiKey) {
      throw new Error('Foursquare API key is not configured')
    }

    const params = new URLSearchParams({
      ll: `${latitude},${longitude}`,
      radius: radius.toString(),
      limit: limit.toString(),
    })

    if (query) {
      params.append('query', query)
    }

    if (categories.length > 0) {
      params.append('categories', categories.join(','))
    }

    try {
      // Use proxy server to avoid CORS issues
      const response = await fetch(`${BASE_URL}/search?${params}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch places')
      }

      const data = await response.json()
      return this.transformResults(data.results || [])
    } catch (error) {
      console.error('Foursquare API Error:', error)
      throw error
    }
  }

  async getPlaceDetails(fsqId) {
    if (!this.apiKey) {
      throw new Error('Foursquare API key is not configured')
    }

    try {
      // Updated endpoint: /v1/places/{fsq_place_id}
      const response = await fetch(`${BASE_URL}/places/${fsqId}`, {
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch place details')
      }

      const data = await response.json()
      return this.transformPlace(data)
    } catch (error) {
      console.error('Foursquare API Error:', error)
      throw error
    }
  }

  transformResults(results) {
    return results.map(place => this.transformPlace(place))
  }

  transformPlace(place) {
    const location = place.location || {}
    const categories = place.categories || []
    
    return {
      fsq_id: place.fsq_id,
      name: place.name,
      address: location.address || '',
      formatted_address: location.formatted_address || '',
      locality: location.locality || '',
      region: location.region || '',
      postcode: location.postcode || '',
      country: location.country || '',
      latitude: place.geocodes?.main?.latitude || location.latitude,
      longitude: place.geocodes?.main?.longitude || location.longitude,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon
      })),
      distance: place.distance,
      // Contact information (if available in response)
      tel: place.tel || null,
      email: place.email || null,
      website: place.website || null,
      social_media: place.social_media || null,
      // Store raw data for future use
      raw_data: place
    }
  }

  // Filter places without websites
  filterPlacesWithoutWebsite(places) {
    return places.filter(place => !place.website)
  }

  // Get popular categories for the UI
  static getPopularCategories() {
    return [
      { id: '13065', name: 'Restaurant', icon: '🍽️' },
      { id: '13032', name: 'Café', icon: '☕' },
      { id: '17069', name: 'Retail', icon: '🛍️' },
      { id: '18021', name: 'Salon', icon: '💇' },
      { id: '12054', name: 'Gym', icon: '🏋️' },
      { id: '10051', name: 'Doctor', icon: '🏥' },
      { id: '11145', name: 'Auto Repair', icon: '🔧' },
      { id: '13003', name: 'Bar', icon: '🍺' },
      { id: '19014', name: 'Hotel', icon: '🏨' },
      { id: '16000', name: 'Landmark', icon: '🏛️' },
    ]
  }
}

const foursquareAPI = new FoursquareAPI(FOURSQUARE_API_KEY)

export default foursquareAPI
