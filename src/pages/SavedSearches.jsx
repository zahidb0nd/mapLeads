import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Search, Edit, MapPin, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import useStore from '@/stores/useStore'
import { useToast } from '@/components/ui/toast'

export default function SavedSearches() {
  const { 
    savedSearches, 
    loadSavedSearches, 
    saveSearch, 
    updateSavedSearch,
    deleteSavedSearch,
    searchFilters,
    setSearchFilters 
  } = useStore()

  const toast = useToast()
  const navigate = useNavigate()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSavedSearches()
  }, [])

  const handleSaveCurrentSearch = async () => {
    if (!searchName.trim()) {
      toast.error('Name required', 'Please enter a name for this search.')
      return
    }

    setIsSaving(true)
    try {
      await saveSearch({
        name: searchName,
        query: searchFilters.query,
        location: searchFilters.location,
        latitude: searchFilters.latitude,
        longitude: searchFilters.longitude,
        radius: searchFilters.radius,
        categories: searchFilters.categories || [],
        notifications_enabled: false
      })
      setSearchName('')
      setShowSaveDialog(false)
      toast.success('Saved!', `"${searchName}" has been saved.`)
    } catch (error) {
      toast.error('Failed to save', 'Could not save this search.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRunSearch = (search) => {
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
    await deleteSavedSearch(id)
    toast.success('Deleted', 'Saved search removed.')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saved Searches</h1>
          <p className="text-muted-foreground mt-1">
            Quick access to your favorite searches
          </p>
        </div>
        <Button onClick={() => setShowSaveDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Save Current Search
        </Button>
      </div>

      {savedSearches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No saved searches yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Save your frequently used searches for quick access
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedSearches.map((search) => (
            <Card key={search.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{search.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {search.query || 'All Businesses'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {search.location}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {(search.radius / 1000).toFixed(0)} km radius
                    </Badge>
                    {search.categories && search.categories.length > 0 && (
                      <Badge variant="outline">
                        {search.categories.length} categories
                      </Badge>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRunSearch(search)}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Run Search
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Save Search Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent onClose={() => setShowSaveDialog(false)}>
          <DialogHeader>
            <DialogTitle>Save Current Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">Search Name</Label>
              <Input
                id="search-name"
                placeholder="e.g., Downtown Restaurants"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <p><strong>Query:</strong> {searchFilters.query || 'All Businesses'}</p>
              <p><strong>Location:</strong> {searchFilters.location || 'Not set'}</p>
              <p><strong>Radius:</strong> {(searchFilters.radius / 1000).toFixed(0)} km</p>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleSaveCurrentSearch}
                disabled={isSaving || !searchName.trim()}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
