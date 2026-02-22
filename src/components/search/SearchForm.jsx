import { useState } from 'react'
import { Search as SearchIcon, Loader2, RefreshCw, AlertCircle, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useStore from '@/stores/useStore'
import { useBusinessSearch } from '@/hooks/useBusinessSearch'
import { useToast } from '@/components/ui/toast'

export default function SearchForm({ onSearchComplete }) {
  const { searchFilters, setSearchFilters } = useStore()
  const { search, isLoading, error } = useBusinessSearch()
  const { warning, error: toastError } = useToast()

  const [localQuery, setLocalQuery] = useState(searchFilters.query || '')
  const [lastSubmit, setLastSubmit] = useState(null)

  const doSearch = async (query) => {
    try {
      const filters = {
        query,
        categories: searchFilters.categories || []
      }
      
      setSearchFilters(filters)
      setLastSubmit({ query })
      
      // Execute search (always searches Bangalore via BANGALORE_BBOX)
      const results = await search(filters)
      if (onSearchComplete) onSearchComplete(results)
    } catch (err) {
      toastError('Search failed', err.message)
      return
    }
  }

  const handleSubmit = (e) => { e.preventDefault(); doSearch(localQuery) }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-danger/30 bg-danger-subtle">
          <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-danger font-semibold">Search failed</p>
            <p className="text-xs text-danger/80 mt-0.5">{error}</p>
          </div>
          {lastSubmit && (
            <Button type="button" variant="danger" size="sm" onClick={() => doSearch(lastSubmit.query)}>
              <RefreshCw className="h-3 w-3" />Retry
            </Button>
          )}
        </div>
      )}

      {/* Desktop: inline row | Mobile: stacked */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Category input */}
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none z-10" aria-hidden="true" />
          <input
            type="text"
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            placeholder="Business type (e.g. plumber, salon, restaurant)..."
            aria-label="Business type"
            className="input-base pl-10 h-14 rounded-xl md:rounded-l-xl md:rounded-r-none text-base"
          />
        </div>

        {/* Search button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary h-14 px-6 rounded-xl md:rounded-l-none md:rounded-r-xl w-full md:w-auto flex-shrink-0 relative overflow-hidden"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <SearchIcon className="h-5 w-5" />
              <span>Search Bangalore</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
