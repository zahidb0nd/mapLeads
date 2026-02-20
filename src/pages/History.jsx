import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, MapPin, Building2, RefreshCw, Trash2, Search, AlertTriangle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HistoryItemSkeleton } from '@/components/ui/skeleton'
import useStore from '@/stores/useStore'
import { useToast } from '@/components/ui/toast'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function History() {
  const { searchHistory, loadSearchHistory, deleteSearchFromHistory, setSearchFilters } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)
  const [selected, setSelected] = useState(new Set())
  usePageTitle('Search History')

  useEffect(() => {
    loadSearchHistory().finally(() => setLoading(false))
  }, [])

  const handleRerun = (search) => {
    setSearchFilters({
      query: search.query,
      location: search.location,
      latitude: search.latitude,
      longitude: search.longitude,
      radius: search.radius,
      categories: search.categories || [],
    })
    navigate('/search')
  }

  const handleDelete = async (id) => {
    await deleteSearchFromHistory(id)
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
    toast.success('Deleted', 'Search removed from history.')
  }

  const handleBulkDelete = async () => {
    for (const id of selected) {
      await deleteSearchFromHistory(id)
    }
    setSelected(new Set())
    toast.success('Deleted', `${selected.size} searches removed.`)
  }

  const toggleSelect = (id) => {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  return (
    <div className="space-y-6 animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">Search History</h1>
          <p className="text-text-secondary text-sm mt-1">Review and re-run your past searches</p>
        </div>
        {searchHistory.length > 0 && (
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4" />
                Delete {selected.size} selected
              </Button>
            )}
            {!confirmClear ? (
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)} className="text-danger hover:bg-danger-subtle">
                Clear all
              </Button>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-xl border border-danger/30 bg-danger-subtle">
                <AlertTriangle className="h-4 w-4 text-danger" />
                <span className="text-sm text-danger">Are you sure?</span>
                <Button variant="danger" size="sm" onClick={async () => {
                  for (const s of searchHistory) await deleteSearchFromHistory(s.id)
                  setConfirmClear(false)
                  toast.success('Cleared', 'All history deleted.')
                }}>Yes, clear</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>Cancel</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk select bar */}
      {searchHistory.length > 0 && selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-danger/30 bg-danger-subtle">
          <span className="text-sm text-danger font-medium">{selected.size} selected</span>
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4" /> Delete selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Cancel</Button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <HistoryItemSkeleton key={i} />)}
        </div>
      ) : searchHistory.length === 0 ? (
        <Card className="text-center py-16">
          <Clock className="h-14 w-14 text-text-muted mx-auto mb-4" aria-hidden="true" />
          <p className="text-text-primary font-semibold text-lg mb-1">No search history yet</p>
          <p className="text-text-muted text-sm mb-6">Your searches will appear here</p>
          <Button onClick={() => navigate('/search')}>
            <Search className="h-4 w-4" />Start Searching
          </Button>
        </Card>
      ) : (
        /* Mobile: card list */
        <div className="space-y-3 lg:hidden">
          {searchHistory.map((search) => (
            <div
              key={search.id}
              className={[
                'rounded-2xl border p-4 transition-all duration-200 bg-card-gradient',
                selected.has(search.id) ? 'border-purple shadow-purple-glow' : 'hover:border-purple/50',
              ].join(' ')}
              style={{ borderColor: selected.has(search.id) ? '#7C3AED' : '#2E2A45' }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={selected.has(search.id)}
                    onChange={() => toggleSelect(search.id)}
                    className="rounded accent-purple flex-shrink-0"
                    aria-label="Select search"
                  />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="h-4 w-4 text-purple flex-shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-text-primary text-sm truncate">{search.location}</span>
                  </div>
                </div>
                <span className="text-xs text-text-muted flex-shrink-0">
                  {search.created ? formatDistanceToNow(new Date(search.created), { addSuffix: true }) : ''}
                </span>
              </div>

              {/* Second row */}
              <div className="flex items-center gap-2 flex-wrap mb-3 ml-7">
                {search.query ? (
                  <Badge variant="purple">{search.query}</Badge>
                ) : (
                  <Badge variant="default">All categories</Badge>
                )}
                <span className="flex items-center gap-1 text-xs text-success">
                  <Building2 className="h-3 w-3" />{search.results_count || 0} found
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 ml-7">
                <Button variant="secondary" size="sm" fullWidth onClick={() => handleRerun(search)}>
                  <RefreshCw className="h-3.5 w-3.5" />Re-run
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(search.id)} className="text-danger hover:bg-danger-subtle px-3">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop: table */}
      {!loading && searchHistory.length > 0 && (
        <div className="hidden lg:block overflow-x-auto rounded-2xl border" style={{ borderColor: '#2E2A45' }}>
          <table className="w-full text-sm">
            <thead style={{ background: '#1C1828' }}>
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox"
                    checked={selected.size === searchHistory.length}
                    onChange={() => setSelected(selected.size === searchHistory.length ? new Set() : new Set(searchHistory.map(s => s.id)))}
                    className="rounded accent-purple"
                    aria-label="Select all"
                  />
                </th>
                {['Location', 'Category', 'Found', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {searchHistory.map((search) => (
                <tr
                  key={search.id}
                  className="border-t transition-colors hover:bg-purple-subtle"
                  style={{ borderColor: '#1E1A30', height: 56 }}
                >
                  <td className="px-4 py-2">
                    <input type="checkbox" checked={selected.has(search.id)} onChange={() => toggleSelect(search.id)} className="rounded accent-purple" />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple flex-shrink-0" />
                      <span className="font-semibold text-text-primary">{search.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {search.query ? <Badge variant="purple">{search.query}</Badge> : <Badge variant="default">All</Badge>}
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-success font-semibold">{search.results_count || 0}</span>
                  </td>
                  <td className="px-4 py-2 text-text-muted text-xs">
                    {search.created ? format(new Date(search.created), 'MMM d, yyyy HH:mm') : ''}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleRerun(search)}>
                        <RefreshCw className="h-4 w-4" />Re-run
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(search.id)} className="text-danger hover:bg-danger-subtle px-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
