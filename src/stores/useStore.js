import { create } from 'zustand'
import pb from '@/lib/pocketbase'

const useStore = create((set, get) => ({
  // Auth state
  user: pb.authStore.model,
  isAuthenticated: pb.authStore.isValid,

  // Theme
  theme: localStorage.getItem('theme') || 'dark',

  // Search state
  searchResults: [],
  isSearching: false,
  searchError: null,
  selectedBusiness: null,

  // Sort/Filter
  sortBy: 'default',
  filterByPhone: false,

  // Filters
  searchFilters: {
    query: '',
    location: '',
    latitude: null,
    longitude: null,
    radius: 5000,
    categories: [],
  },

  // History and saved searches
  searchHistory: [],
  savedSearches: [],

  // Lead statuses & notes (stored locally by fsq_id)
  leadData: JSON.parse(localStorage.getItem('leadData') || '{}'),

  // Dashboard stats
  stats: {
    totalSearches: 0,
    totalBusinessesFound: 0,
    recentActivity: [],
    categoryBreakdown: [],
  },

  // Theme actions
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    set({ theme })
  },

  // Sort/Filter actions
  setSortBy: (sortBy) => set({ sortBy }),
  setFilterByPhone: (filterByPhone) => set({ filterByPhone }),

  // Lead data actions (status + notes per business)
  setLeadStatus: (fsqId, status) => {
    const leadData = { ...get().leadData }
    leadData[fsqId] = { ...leadData[fsqId], status }
    localStorage.setItem('leadData', JSON.stringify(leadData))
    set({ leadData })
  },
  setLeadNote: (fsqId, note) => {
    const leadData = { ...get().leadData }
    leadData[fsqId] = { ...leadData[fsqId], note }
    localStorage.setItem('leadData', JSON.stringify(leadData))
    set({ leadData })
  },

  // Auth actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  logout: async () => {
    pb.authStore.clear()
    set({
      user: null,
      isAuthenticated: false,
      searchResults: [],
      searchHistory: [],
      savedSearches: []
    })
  },

  // Search actions
  setSearchResults: (results) => set({ searchResults: results }),
  
  setIsSearching: (isSearching) => set({ isSearching }),
  
  setSearchError: (error) => set({ searchError: error }),
  
  setSelectedBusiness: (business) => set({ selectedBusiness: business }),
  
  setSearchFilters: (filters) => set((state) => ({
    searchFilters: { ...state.searchFilters, ...filters }
  })),
  
  resetSearchFilters: () => set({
    searchFilters: {
      query: '',
      location: '',
      latitude: null,
      longitude: null,
      radius: 5000,
      categories: [],
    }
  }),

  // History actions
  loadSearchHistory: async () => {
    try {
      const records = await pb.collection('searches').getList(1, 50, {
        sort: '-created',
        filter: `user = "${pb.authStore.model?.id}"`
      })
      set({ searchHistory: records.items })
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  },

  addSearchToHistory: async (searchData) => {
    try {
      const record = await pb.collection('searches').create({
        user: pb.authStore.model?.id,
        ...searchData
      })
      set((state) => ({
        searchHistory: [record, ...state.searchHistory]
      }))
    } catch (error) {
      console.error('Failed to save search to history:', error)
    }
  },

  deleteSearchFromHistory: async (id) => {
    try {
      await pb.collection('searches').delete(id)
      set((state) => ({
        searchHistory: state.searchHistory.filter(s => s.id !== id)
      }))
    } catch (error) {
      console.error('Failed to delete search from history:', error)
    }
  },

  // Saved searches actions
  loadSavedSearches: async () => {
    try {
      const records = await pb.collection('saved_searches').getList(1, 50, {
        sort: '-created',
        filter: `user = "${pb.authStore.model?.id}"`
      })
      set({ savedSearches: records.items })
    } catch (error) {
      console.error('Failed to load saved searches:', error)
    }
  },

  saveSearch: async (searchData) => {
    try {
      const record = await pb.collection('saved_searches').create({
        user: pb.authStore.model?.id,
        ...searchData
      })
      set((state) => ({
        savedSearches: [record, ...state.savedSearches]
      }))
      return record
    } catch (error) {
      console.error('Failed to save search:', error)
      throw error
    }
  },

  updateSavedSearch: async (id, data) => {
    try {
      const record = await pb.collection('saved_searches').update(id, data)
      set((state) => ({
        savedSearches: state.savedSearches.map(s => s.id === id ? record : s)
      }))
    } catch (error) {
      console.error('Failed to update saved search:', error)
      throw error
    }
  },

  deleteSavedSearch: async (id) => {
    try {
      await pb.collection('saved_searches').delete(id)
      set((state) => ({
        savedSearches: state.savedSearches.filter(s => s.id !== id)
      }))
    } catch (error) {
      console.error('Failed to delete saved search:', error)
      throw error
    }
  },

  // Dashboard stats
  loadStats: async () => {
    try {
      const searches = await pb.collection('searches').getList(1, 1, {
        filter: `user = "${pb.authStore.model?.id}"`
      })

      const recentSearches = await pb.collection('searches').getList(1, 50, {
        sort: '-created',
        filter: `user = "${pb.authStore.model?.id}"`
      })

      const totalBusinesses = recentSearches.items.reduce((sum, search) => {
        return sum + (search.results_count || 0)
      }, 0)

      // Category breakdown
      const categoryCount = {}
      recentSearches.items.forEach(search => {
        const q = search.query || 'General'
        categoryCount[q] = (categoryCount[q] || 0) + (search.results_count || 0)
      })
      const categoryBreakdown = Object.entries(categoryCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)

      set({
        stats: {
          totalSearches: searches.totalItems,
          totalBusinessesFound: totalBusinesses,
          recentActivity: recentSearches.items.slice(0, 5),
          categoryBreakdown,
        }
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  },

  // Cache business data
  cacheBusiness: async (businessData) => {
    try {
      // Check if business already exists
      const existing = await pb.collection('businesses').getFirstListItem(
        `fsq_id = "${businessData.fsq_id}"`
      ).catch(() => null)

      if (existing) {
        return existing
      }

      // Create new record
      const record = await pb.collection('businesses').create({
        fsq_id: businessData.fsq_id,
        name: businessData.name,
        address: businessData.formatted_address || businessData.address,
        latitude: businessData.latitude,
        longitude: businessData.longitude,
        categories: businessData.categories,
        phone: businessData.tel,
        email: businessData.email,
        raw_data: businessData.raw_data
      })

      return record
    } catch (error) {
      console.error('Failed to cache business:', error)
    }
  }
}))

// Subscribe to auth changes
pb.authStore.onChange((token, model) => {
  useStore.getState().setUser(model)
})

export default useStore
