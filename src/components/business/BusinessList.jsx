import { MapPin, SearchX } from 'lucide-react'
import { BusinessCardSkeleton } from '@/components/ui/skeleton'
import BusinessCard from './BusinessCard'
import useStore from '@/stores/useStore'

export default function BusinessList({ businesses = [], onBusinessClick }) {
  const { isSearching, searchResults } = useStore()

  if (isSearching) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <BusinessCardSkeleton key={i} />)}
      </div>
    )
  }

  if (businesses.length === 0 && searchResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#7C3AED15' }}>
          <MapPin className="h-8 w-8 text-purple" aria-hidden="true" />
        </div>
        <div>
          <p className="text-text-primary font-semibold">You haven't searched yet</p>
          <p className="text-text-muted text-sm mt-1">Enter a city and business type above to find leads.</p>
        </div>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#F43F5E15' }}>
          <SearchX className="h-8 w-8 text-danger" aria-hidden="true" />
        </div>
        <div>
          <p className="text-text-primary font-semibold">No businesses found without a website</p>
          <p className="text-text-muted text-sm mt-1">Try a different city or remove filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {businesses.map((business, i) => (
        <BusinessCard
          key={business.fsq_id || i}
          business={business}
          onClick={onBusinessClick}
        />
      ))}
    </div>
  )
}
