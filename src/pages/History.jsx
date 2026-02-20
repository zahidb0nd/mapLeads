import { useEffect, useState } from 'react'
import { Trash2, Search, MapPin, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HistoryItemSkeleton } from '@/components/ui/skeleton'
import useStore from '@/stores/useStore'
import { useToast } from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function History() {
  const { searchHistory, loadSearchHistory, deleteSearchFromHistory, setSearchFilters } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  usePageTitle('Search History')

  useEffect(() => {
    loadSearchHistory().finally(() => setLoading(false))
  }, [])

  const handleRerunSearch = (search) => {
    setSearchFilters({
      query: search.query,
      location: search.location,
      latitude: search.latitude,
      longitude: search.longitude,
      radius: search.radius,
      categories: search.categories || []
    })
    navigate('/search')
  }

  const handleDelete = async (id) => {
    await deleteSearchFromHistory(id)
    toast.success('Deleted', 'Search removed from history.')
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Search History</h1>
        <p className="text-muted-foreground mt-1">Review your past searches</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <HistoryItemSkeleton key={i} />)}
        </div>
      ) : searchHistory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="h-16 w-16 bg-primary-500/10 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-primary-500" />
            </div>
            <div>
              <p className="text-lg font-medium">No search history yet</p>
              <p className="text-sm text-muted-foreground mt-1">You haven't searched yet. Go find some leads!</p>
            </div>
            <Button onClick={() => navigate('/search')}>
              <Search className="h-4 w-4 mr-2" /> Start Searching
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {searchHistory.map((search) => (
            <Card key={search.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{search.query || 'All Businesses'}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {search.location}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRerunSearch(search)}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Re-run
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(search.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(search.created), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <div>
                    <Badge variant="secondary">
                      {search.results_count || 0} results
                    </Badge>
                  </div>
                  <div>
                    <Badge variant="outline">
                      {(search.radius / 1000).toFixed(0)} km radius
                    </Badge>
                  </div>
                  {search.categories && search.categories.length > 0 && (
                    <div>
                      <Badge variant="outline">
                        {search.categories.length} categories
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
