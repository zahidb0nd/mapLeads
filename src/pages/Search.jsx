import { useState } from 'react'
import { Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SearchForm from '@/components/search/SearchForm'
import MapView from '@/components/search/MapView'
import BusinessList from '@/components/business/BusinessList'
import BusinessDetails from '@/components/business/BusinessDetails'
import useStore from '@/stores/useStore'
import { exportToCSV } from '@/lib/utils'

export default function Search() {
  const { searchResults, searchFilters, selectedBusiness, setSelectedBusiness } = useStore()
  const [showDetails, setShowDetails] = useState(false)

  const handleBusinessClick = (business) => {
    setSelectedBusiness(business)
    setShowDetails(true)
  }

  const handleExportCSV = () => {
    if (searchResults.length === 0) {
      alert('No results to export')
      return
    }

    const exportData = searchResults.map(business => ({
      name: business.name,
      address: business.formatted_address || business.address,
      phone: business.tel || '',
      email: business.email || '',
      category: business.categories?.[0]?.name || '',
      latitude: business.latitude,
      longitude: business.longitude,
      distance: business.distance ? `${(business.distance / 1000).toFixed(2)} km` : ''
    }))

    const timestamp = new Date().toISOString().split('T')[0]
    exportToCSV(exportData, `mapleads-export-${timestamp}.csv`)
  }

  const mapCenter = searchFilters.latitude && searchFilters.longitude
    ? [searchFilters.latitude, searchFilters.longitude]
    : [51.505, -0.09]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Search Businesses</h1>
          <p className="text-muted-foreground mt-1">
            Find local businesses without websites
          </p>
        </div>
        {searchResults.length > 0 && (
          <Button onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchForm />
            </CardContent>
          </Card>
        </div>

        {/* Map and Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle>Map View</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96">
                <MapView
                  businesses={searchResults}
                  center={mapCenter}
                  onBusinessClick={handleBusinessClick}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results List */}
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessList
                businesses={searchResults}
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
