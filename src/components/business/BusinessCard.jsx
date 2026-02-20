import { MapPin, Phone, Star, Globe, ExternalLink, Bookmark, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function BusinessCard({ business, onClick }) {
  const category = business.categories?.[0]?.name || ''
  const mapsUrl = business.latitude && business.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}` : null

  return (
    <div
      className="rounded-2xl border p-4 md:p-5 transition-all duration-200 bg-card-gradient hover:border-purple hover:shadow-purple-glow hover:-translate-y-0.5 flex flex-col gap-3 cursor-pointer"
      style={{ borderColor: '#2E2A45' }}
      onClick={() => onClick?.(business)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.(business)}
    >
      {/* Top */}
      <div className="flex items-start gap-3">
        <div className="rounded-lg p-2 flex-shrink-0" style={{ background: '#7C3AED15' }}>
          <Building2 className="h-5 w-5 text-purple" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary text-sm leading-tight truncate">{business.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {category && <Badge variant="purple">{category}</Badge>}
            <Badge variant="green" className="flex items-center gap-1 text-xs">
              <Globe className="h-3 w-3" />No website
            </Badge>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 text-sm text-text-secondary flex-1">
        {(business.formatted_address || business.address) && (
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-text-muted flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="truncate">{business.formatted_address || business.address}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-text-muted flex-shrink-0" aria-hidden="true" />
          <span className={business.tel ? '' : 'text-text-muted italic'}>
            {business.tel || 'No phone listed'}
          </span>
        </div>
        {business.rating && (
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-warning fill-warning" aria-hidden="true" />
            <span className="text-warning font-medium">{business.rating}</span>
            <span className="text-text-muted text-xs">({business.stats?.total_ratings || 0} reviews)</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t" style={{ borderColor: '#2E2A45' }}
        onClick={e => e.stopPropagation()}>
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-purple transition-colors px-3 py-2 rounded-lg hover:bg-purple-subtle flex-1 justify-center min-h-[36px]"
          >
            <ExternalLink className="h-3.5 w-3.5" />Maps
          </a>
        )}
        <button
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-warning transition-colors px-3 py-2 rounded-lg hover:bg-warning-subtle flex-1 justify-center min-h-[36px]"
          aria-label="Save lead"
        >
          <Bookmark className="h-3.5 w-3.5" />Save
        </button>
      </div>
    </div>
  )
}
