import { useState, useMemo } from 'react'
import { Download, FileSpreadsheet, SlidersHorizontal, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import SearchForm from '@/components/search/SearchForm'
import MapView from '@/components/search/MapView'
import BusinessList from '@/components/business/BusinessList'
import BusinessDetails from '@/components/business/BusinessDetails'
import useStore from '@/stores/useStore'
import { useToast } from '@/components/ui/toast'
import { exportToCSV, exportToXLSX } from '@/lib/utils'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function Search() {
  const {
    searchResults, searchFilters, selectedBusiness, setSelectedBusiness,
    sortBy, setSortBy, filterByPhone, setFilterByPhone,
  } = useStore()
  const [showDetails, setShowDetails] = useState(false)
  const { success, error, warning } = useToast()
  usePageTitle('Search')

  const handleBusinessClick = (business) => {
    setSelectedBusiness(business)
    setShowDetails(true)
  }

  // Apply filter + sort
  const displayResults = useMemo(() => {
    let results = [...searchResults]
    if (filterByPhone) results = results.filter(b => b.tel)
    switch (sortBy) {
      case 'name': results.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'distance': results.sort((a, b) => (a.distance || 0) - (b.distance || 0)); break
      case 'name_desc': results.sort((a, b) => b.name.localeCompare(a.name)); break
      default: break
    }
    return results
  }, [searchResults, sortBy, filterByPhone])

  const getExportData = () => searchResults.map(business => ({
    'Business Name': business.name || '',
    'Category': business.categories?.[0]?.name || '',
    'Address': business.formatted_address || business.address || '',
    'Phone': business.tel || '',
    'Email': business.email || '',
    'Rating': business.rating || '',
    'Review Count': business.stats?.total_ratings || '',
    'Google Maps URL': business.latitude && business.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
      : '',
    'Latitude': business.latitude || '',
    'Longitude': business.longitude || '',
    'Distance': business.distance ? `${(business.distance / 1000).toFixed(2)} km` : '',
  }))

  const getExportFilename = (ext) => {
    const city = searchFilters.location
      ? searchFilters.location.split(',')[0].trim().replace(/\s+/g, '_').toLowerCase()
      : 'results'
    const date = new Date().toISOString().split('T')[0]
    return `mapleads_${city}_${date}.${ext}`
  }

  const handleExportCSV = () => {
    if (searchResults.length === 0) { warning('No results', 'Run a search first.'); return }
    exportToCSV(getExportData(), getExportFilename('csv'))
    success('Exported!', `${searchResults.length} businesses exported to CSV.`)
  }

  const handleExportXLSX = () => {
    if (searchResults.length === 0) { warning('No results', 'Run a search first.'); return }
    exportToXLSX(getExportData(), getExportFilename('xlsx'))
    success('Exported!', `${searchResults.length} businesses exported to Excel.`)
  }

  const mapCenter = searchFilters.latitude && searchFilters.longitude
    ? [searchFilters.latitude, searchFilters.longitude]
    : [51.505, -0.09]

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Search Businesses</h1>
          <p className="text-muted-foreground mt-1 text-sm">Find local businesses without websites</p>
        </div>
        {searchResults.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportXLSX}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Search Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Search Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchForm />
            </CardContent>
          </Card>
        </div>

        {/* Map and Results */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Map View</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 md:h-96">
                <MapView
                  businesses={displayResults}
                  center={mapCenter}
                  onBusinessClick={handleBusinessClick}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sort/Filter bar */}
          {searchResults.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-40 h-8 text-sm"
              >
                <option value="default">Default order</option>
                <option value="name">Name A→Z</option>
                <option value="name_desc">Name Z→A</option>
                <option value="distance">Nearest first</option>
              </Select>
              <Button
                variant={filterByPhone ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-sm"
                onClick={() => setFilterByPhone(!filterByPhone)}
              >
                <Phone className="h-3 w-3 mr-1" />
                Has Phone
              </Button>
              <span className="text-xs text-muted-foreground ml-auto">
                {displayResults.length} of {searchResults.length} results
              </span>
            </div>
          )}

          {/* Results List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessList
                businesses={displayResults}
                onBusinessClick={handleBusinessClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Details Modal */}
      <BusinessDetails
        business={selectedBusiness}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  )
}

