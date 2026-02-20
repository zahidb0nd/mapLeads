import { Grid, List, SearchX, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/ui/skeleton'
import BusinessCard from './BusinessCard'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '@/stores/useStore'

export default function BusinessList({ businesses = [], onBusinessClick }) {
  const [viewMode, setViewMode] = useState('grid')
  const navigate = useNavigate()
  const { isSearching, searchResults, filterByPhone } = useStore()

  // Show skeletons while searching
  if (isSearching) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  // Never searched yet
  if (businesses.length === 0 && searchResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="h-16 w-16 bg-primary-500/10 rounded-full flex items-center justify-center">
          <MapPin className="h-8 w-8 text-primary-500" />
        </div>
        <div>
          <p className="text-lg font-medium">You haven't searched yet</p>
          <p className="text-sm text-muted-foreground mt-1">Go find some leads! Enter a city and business type above.</p>
        </div>
      </div>
    )
  }

  // Filtered to zero but results exist
  if (businesses.length === 0 && searchResults.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="h-16 w-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
          <SearchX className="h-8 w-8 text-yellow-500" />
        </div>
        <div>
          <p className="text-lg font-medium">No results match your filters</p>
          <p className="text-sm text-muted-foreground mt-1">Try removing the "Has Phone" filter or changing the sort order.</p>
        </div>
      </div>
    )
  }

  // Zero results from API
  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
          <SearchX className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-medium">No businesses found without a website</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different city, category, or increase the search radius.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => document.getElementById('location')?.focus()}>
          Adjust Search
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {businesses.length} business{businesses.length !== 1 ? 'es' : ''} without websites
        </p>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Business Cards */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
          : 'space-y-4'
      }>
        {businesses.map((business) => (
          <BusinessCard
            key={business.fsq_id}
            business={business}
            onClick={onBusinessClick}
          />
        ))}
      </div>
    </div>
  )
}
