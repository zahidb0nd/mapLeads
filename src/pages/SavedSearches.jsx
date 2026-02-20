import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, MapPin, Tag, Clock, RefreshCw, Trash2, Search, MoreVertical, Pencil } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { HistoryItemSkeleton } from '@/components/ui/skeleton'
import useStore from '@/stores/useStore'
import { useToast } from '@/components/ui/toast'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function SavedSearches() {
  const { savedSearches, loadSavedSearches, deleteSavedSearch, setSearchFilters } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(null)
  const [renaming, setRenaming] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [rerunning, setRerunning] = useState(null)
  usePageTitle('Saved Searches')

  useEffect(() => {
    loadSavedSearches().finally(() => setLoading(false))
  }, [])

  const handleRerun = async (search) => {
    setRerunning(search.id)
    setSearchFilters({
      query: search.query,
      location: search.location,
      latitude: search.latitude,
      longitude: search.longitude,
      radius: search.radius,
      categories: search.categories || [],
    })
    setTimeout(() => {
      navigate('/search')
      setRerunning(null)
    }, 300)
  }

  const handleDelete = async (id) => {
    await deleteSavedSearch(id)
    setMenuOpen(null)
    toast.success('Deleted', 'Saved search removed.')
  }

  const handleRename = (search) => {
    setRenaming(search.id)
    setRenameValue(search.name || search.query || '')
    setMenuOpen(null)
  }

  const handleRenameSubmit = (e, id) => {
    e.preventDefault()
    // In a real app we'd persist this — for now just toast
    toast.info('Renamed', `Search renamed to "${renameValue}".`)
    setRenaming(null)
  }

  return (
    <div className="space-y-6 animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">Saved Searches</h1>
          <p className="text-text-secondary text-sm mt-1">Quickly re-run your favourite searches</p>
        </div>
        {savedSearches.length > 0 && (
          <Badge variant="amber" className="text-sm px-3 py-1.5">
            {savedSearches.length} saved
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <HistoryItemSkeleton key={i} />)}
        </div>
      ) : savedSearches.length === 0 ? (
        <Card className="text-center py-16">
          <Bookmark className="h-14 w-14 text-warning mx-auto mb-4 opacity-60" aria-hidden="true" />
          <p className="text-text-primary font-semibold text-lg mb-1">No saved searches yet</p>
          <p className="text-text-muted text-sm mb-6">Save a search to quickly re-run it anytime</p>
          <Button onClick={() => navigate('/search')}>
            <Search className="h-4 w-4" />Go to Search
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="rounded-2xl border p-5 transition-all duration-200 bg-card-gradient hover:border-purple hover:shadow-purple-glow hover:-translate-y-0.5 flex flex-col gap-4"
              style={{ borderColor: '#2E2A45' }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-warning flex-shrink-0" aria-hidden="true" />
                  {renaming === search.id ? (
                    <form onSubmit={(e) => handleRenameSubmit(e, search.id)} className="flex gap-2">
                      <Input
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        className="h-8 text-sm py-1 px-2"
                        autoFocus
                      />
                      <Button type="submit" size="sm">Save</Button>
                    </form>
                  ) : (
                    <h3 className="font-bold text-text-primary text-base truncate">
                      {search.name || search.query || 'Saved Search'}
                    </h3>
                  )}
                </div>

                {/* 3-dot menu */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setMenuOpen(menuOpen === search.id ? null : search.id)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all min-h-0"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuOpen === search.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div
                        className="absolute right-0 top-full mt-1 w-40 rounded-xl border shadow-card z-20 py-1 animate-slideUp"
                        style={{ background: '#13111C', borderColor: '#2E2A45' }}
                      >
                        <button
                          onClick={() => handleRename(search)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated min-h-[36px]"
                        >
                          <Pencil className="h-3.5 w-3.5" />Rename
                        </button>
                        <button
                          onClick={() => handleDelete(search.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger-subtle min-h-[36px]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <MapPin className="h-4 w-4 text-text-muted flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{search.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-text-muted flex-shrink-0" aria-hidden="true" />
                  {search.query ? (
                    <Badge variant="purple">{search.query}</Badge>
                  ) : (
                    <span className="text-text-muted text-xs">All categories</span>
                  )}
                </div>
                {search.created && (
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    Last run: {formatDistanceToNow(new Date(search.created), { addSuffix: true })}
                  </div>
                )}
              </div>

              {/* Re-run button */}
              <Button
                fullWidth
                onClick={() => handleRerun(search)}
                disabled={rerunning === search.id}
              >
                {rerunning === search.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Re-run Search
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
