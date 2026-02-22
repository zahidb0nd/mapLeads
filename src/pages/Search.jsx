import { useState, useMemo, useCallback } from 'react'
import {
  Search as SearchIcon, MapPin, Tag, SlidersHorizontal, Download,
  LayoutGrid, Table2, Building2, Globe, Star, Phone, ExternalLink,
  Bookmark, SearchX, WifiOff, X, RefreshCw, ChevronUp, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BusinessCardSkeleton } from '@/components/ui/skeleton'
import useStore from '@/stores/useStore'
import { useToast } from '@/components/ui/toast'
import { exportToCSV } from '@/lib/utils'
import { usePageTitle } from '@/hooks/usePageTitle'
import SearchForm from '@/components/search/SearchForm'
import { useBusinessSearch } from '@/hooks/useBusinessSearch'

const QUICK_CATEGORIES = [
  { label: 'All',         emoji: '🌐', value: '' },
  { label: 'Restaurants', emoji: '🍽️', value: 'restaurant' },
  { label: 'Salons',      emoji: '💅', value: 'salon' },
  { label: 'Plumbers',    emoji: '🔧', value: 'plumber' },
  { label: 'Shops',       emoji: '🛍️', value: 'shop' },
  { label: 'Hotels',      emoji: '🏨', value: 'hotel' },
  { label: 'Gyms',        emoji: '💪', value: 'gym' },
]

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.round(rating) ? 'text-warning fill-warning' : 'text-text-muted'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function BusinessCard({ business, onSave }) {
  const mapsUrl = business.latitude && business.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
    : null
  const category = business.categories?.[0]?.name || ''

  return (
    <div className="rounded-2xl border p-4 md:p-5 transition-all duration-200 bg-card-gradient hover:border-purple hover:shadow-purple-glow hover:-translate-y-0.5 group animate-slideUp"
      style={{ borderColor: '#2E2A45' }}>
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-lg p-2 flex-shrink-0" style={{ background: '#7C3AED15' }}>
          <Building2 className="h-5 w-5 text-purple" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary text-sm leading-tight truncate">{business.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {category && <Badge variant="purple">{category}</Badge>}
            <Badge variant="green" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />No website
            </Badge>
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-1.5 mb-4 text-sm text-text-secondary">
        {(business.formatted_address || business.address) && (
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-text-muted flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="truncate">{business.formatted_address || business.address}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-text-muted flex-shrink-0" aria-hidden="true" />
          <span>{business.tel || 'No phone listed'}</span>
        </div>
        {business.rating && (
          <div className="flex items-center gap-2">
            <StarRating rating={business.rating} />
            <span className="text-xs text-text-muted">
              {business.rating} ({business.stats?.total_ratings || 0} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-purple transition-colors px-3 py-2 rounded-lg hover:bg-purple-subtle flex-1 justify-center min-h-[36px]"
          >
            <ExternalLink className="h-3.5 w-3.5" />Google Maps
          </a>
        )}
        <button
          onClick={() => onSave?.(business)}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-warning transition-colors px-3 py-2 rounded-lg hover:bg-warning-subtle flex-1 justify-center min-h-[36px]"
          aria-label="Save lead"
        >
          <Bookmark className="h-3.5 w-3.5" />Save lead
        </button>
      </div>
    </div>
  )
}

function TableView({ businesses }) {
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    if (!sortCol) return businesses
    return [...businesses].sort((a, b) => {
      let av = a[sortCol] ?? '', bv = b[sortCol] ?? ''
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
  }, [businesses, sortCol, sortDir])

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ChevronUp className="h-3 w-3 text-text-muted opacity-50" />
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-purple" />
      : <ChevronDown className="h-3 w-3 text-purple" />
  }

  const cols = [
    { key: 'name',    label: 'Business Name' },
    { key: 'category',label: 'Category' },
    { key: 'formatted_address', label: 'Address' },
    { key: 'tel',     label: 'Phone' },
    { key: 'rating',  label: 'Rating' },
  ]

  return (
    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: '#2E2A45' }}>
      <table className="w-full text-sm">
        <thead style={{ background: '#1C1828' }}>
          <tr>
            {cols.map(c => (
              <th
                key={c.key}
                onClick={() => handleSort(c.key)}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted cursor-pointer hover:text-text-primary transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  {c.label}<SortIcon col={c.key} />
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((b, i) => {
            const mapsUrl = b.latitude && b.longitude
              ? `https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`
              : null
            return (
              <tr
                key={b.fsq_id || i}
                className="border-t transition-colors hover:bg-purple-subtle"
                style={{ borderColor: '#1E1A30', height: 56 }}
              >
                <td className="px-4 py-2 font-semibold text-text-primary max-w-[180px] truncate">{b.name}</td>
                <td className="px-4 py-2">
                  {b.categories?.[0]?.name && <Badge variant="purple">{b.categories[0].name}</Badge>}
                </td>
                <td className="px-4 py-2 text-text-secondary max-w-[200px] truncate">{b.formatted_address || b.address || '-'}</td>
                <td className="px-4 py-2 text-text-secondary">{b.tel || '-'}</td>
                <td className="px-4 py-2">
                  {b.rating ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      <span className="text-text-secondary">{b.rating}</span>
                    </div>
                  ) : '-'}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {mapsUrl && (
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="text-text-muted hover:text-purple transition-colors min-h-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-subtle"
                        aria-label="Open in Google Maps">
                        <MapPin className="h-4 w-4" />
                      </a>
                    )}
                    <button className="text-text-muted hover:text-warning transition-colors min-h-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-warning-subtle"
                      aria-label="Save lead">
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function Search() {
  const {
    searchResults, searchFilters, isSearching, searchError,
    sortBy, setSortBy, filterByPhone, setFilterByPhone,
  } = useStore()
  const { search } = useBusinessSearch()
  const { success, warning } = useToast()
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [showFilters, setShowFilters] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  usePageTitle('Search — MapLeads Bangalore')

  const handleCategoryChip = async (value) => {
    setActiveCategory(value)
    // Trigger search for Bangalore with selected category
    await search({ query: value, categories: [] })
  }

  const displayResults = useMemo(() => {
    let results = [...searchResults]
    if (filterByPhone) results = results.filter(b => b.tel)
    if (activeCategory) results = results.filter(b =>
      b.categories?.some(c => c.name?.toLowerCase().includes(activeCategory))
    )
    switch (sortBy) {
      case 'name':    results.sort((a, b) => a.name?.localeCompare(b.name)); break
      case 'name_desc': results.sort((a, b) => b.name?.localeCompare(a.name)); break
      case 'reviews': results.sort((a, b) => (b.stats?.total_ratings || 0) - (a.stats?.total_ratings || 0)); break
      case 'rating':  results.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break
      default: break
    }
    return results
  }, [searchResults, sortBy, filterByPhone, activeCategory])

  const handleExportCSV = () => {
    if (!searchResults.length) { warning('No results', 'Run a search first.'); return }
    const data = searchResults.map(b => ({
      'Business Name': b.name || '',
      'Category': b.categories?.[0]?.name || '',
      'Address': b.formatted_address || b.address || '',
      'Phone': b.tel || '',
      'Rating': b.rating || '',
      'Reviews': b.stats?.total_ratings || '',
      'Google Maps URL': b.latitude && b.longitude
        ? `https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}` : '',
    }))
    exportToCSV(data, `mapleads_bangalore_${new Date().toISOString().split('T')[0]}.csv`)
    success('Exported!', `${searchResults.length} businesses exported to CSV.`)
  }

  const hasSearched = searchResults.length > 0 || isSearching || searchError

  return (
    <div className="space-y-6 animate-slideUp">
      {/* Hero Search Section */}
      <div className="rounded-2xl p-6 md:p-8" style={{ background: 'radial-gradient(ellipse at 50% 0%, #7C3AED22 0%, transparent 70%), linear-gradient(145deg, #13111C, #1C1828)', border: '1px solid #2E2A45' }}>
        <h1 className="text-xl md:text-3xl font-extrabold text-text-primary mb-1">
          Find businesses in Bangalore with no website
        </h1>
        <p className="text-text-secondary text-sm mb-6">Discover local Bangalore businesses with no online presence</p>

        {/* Search Form */}
        <SearchForm />

        {/* Quick category pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 flex-nowrap md:flex-wrap">
          {QUICK_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChip(cat.value)}
              className={[
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                activeCategory === cat.value
                  ? 'bg-purple text-white border-purple'
                  : 'bg-bg-elevated text-text-secondary border-border hover:border-purple hover:text-text-primary',
              ].join(' ')}
            >
              <span>{cat.emoji}</span>{cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      {hasSearched && (
        <>
          {/* Mobile filter toggle */}
          <div className="md:hidden">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {showFilters ? <X className="h-4 w-4 ml-auto" /> : null}
            </Button>

            {showFilters && (
              <div
                className="fixed inset-0 z-40 flex flex-col justify-end"
                style={{ background: 'rgba(0,0,0,0.6)' }}
              >
                <div className="rounded-t-2xl p-6 space-y-4 animate-slideInBottom" style={{ background: '#13111C', border: '1px solid #2E2A45' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-text-primary">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="text-text-muted hover:text-text-primary min-h-0 w-8 h-8">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <FilterControls sortBy={sortBy} setSortBy={setSortBy} filterByPhone={filterByPhone} setFilterByPhone={setFilterByPhone} />
                  <Button fullWidth onClick={() => setShowFilters(false)}>Apply Filters</Button>
                  <Button variant="ghost" fullWidth onClick={() => { setSortBy('default'); setFilterByPhone(false); setShowFilters(false) }}>Reset</Button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop filter bar */}
          <div className="hidden md:flex items-center gap-4 flex-wrap">
            <FilterControls sortBy={sortBy} setSortBy={setSortBy} filterByPhone={filterByPhone} setFilterByPhone={setFilterByPhone} />
          </div>
        </>
      )}

      {/* Results header */}
      {searchResults.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-success" aria-hidden="true" />
            <span className="text-success font-bold text-lg">
              Found {displayResults.length} businesses with no website
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Grid/Table toggle */}
            <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: '#2E2A45' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-colors min-h-0 h-9 ${viewMode === 'grid' ? 'bg-purple text-white' : 'text-text-muted hover:text-text-primary bg-bg-elevated'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 transition-colors min-h-0 h-9 ${viewMode === 'table' ? 'bg-purple text-white' : 'text-text-muted hover:text-text-primary bg-bg-elevated'}`}
                aria-label="Table view"
              >
                <Table2 className="h-4 w-4" />
              </button>
            </div>
            <Button
              variant="success"
              size="sm"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <BusinessCardSkeleton key={i} />)}
        </div>
      ) : searchError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <WifiOff className="h-16 w-16 text-text-muted mb-4" aria-hidden="true" />
          <p className="text-text-primary font-semibold text-lg mb-1">Search unavailable right now</p>
          <p className="text-text-muted text-sm mb-6">{searchError}</p>
          <Button onClick={() => useStore.getState().retrySearch?.()}>
            <RefreshCw className="h-4 w-4" />Retry
          </Button>
        </div>
      ) : searchResults.length === 0 && !hasSearched ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6">
            <MapPin className="h-20 w-20 text-purple opacity-80" aria-hidden="true" />
            <div className="absolute inset-0 rounded-full" style={{ background: '#7C3AED22', filter: 'blur(20px)' }} />
          </div>
          <p className="text-text-primary font-semibold text-lg">Enter a city above to start finding leads</p>
          <p className="text-text-muted text-sm mt-1">Search any city, town, or neighbourhood worldwide</p>
        </div>
      ) : searchResults.length === 0 && hasSearched ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="h-16 w-16 text-text-muted mb-4" aria-hidden="true" />
          <p className="text-text-primary font-semibold text-lg mb-1">No businesses found without a website</p>
          <p className="text-text-muted text-sm mb-6">Try a nearby city or different category</p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button variant="secondary" onClick={() => setActiveCategory('')}>
              <X className="h-4 w-4" />Clear filters
            </Button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <div>
          <div className="md:hidden text-center py-8 text-text-muted text-sm">
            Switch to grid view on mobile
          </div>
          <div className="hidden md:block">
            <TableView businesses={displayResults} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayResults.map((business, i) => (
            <BusinessCard key={business.fsq_id || i} business={business} />
          ))}
        </div>
      )}

      {/* Floating export FAB (mobile) */}
      {searchResults.length > 0 && (
        <button
          onClick={handleExportCSV}
          className="md:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{ background: '#10B981' }}
          aria-label="Export CSV"
        >
          <Download className="h-6 w-6 text-white" />
        </button>
      )}
    </div>
  )
}

function FilterControls({ sortBy, setSortBy, filterByPhone, setFilterByPhone }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-text-muted flex-shrink-0" aria-hidden="true" />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="rounded-xl border border-border bg-bg-elevated text-text-primary px-3 py-2 text-sm outline-none focus:border-purple min-h-[40px]"
        >
          <option value="default">Most Reviews</option>
          <option value="rating">Highest Rating</option>
          <option value="name">Alphabetical</option>
          <option value="name_desc">Z → A</option>
        </select>
      </div>
      <Button
        variant={filterByPhone ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setFilterByPhone(!filterByPhone)}
      >
        <Phone className="h-4 w-4" />
        Has Phone
      </Button>
    </>
  )
}
