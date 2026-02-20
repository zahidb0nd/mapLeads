import { Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BusinessCard from './BusinessCard'
import { useState } from 'react'

export default function BusinessList({ businesses = [], onBusinessClick }) {
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground text-lg">No businesses found</p>
        <p className="text-muted-foreground text-sm mt-2">
          Try adjusting your search criteria or location
        </p>
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
