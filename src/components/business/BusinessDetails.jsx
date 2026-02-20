import { MapPin, Phone, Mail, X, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistance } from '@/lib/utils'

export default function BusinessDetails({ business, open, onClose }) {
  const [copiedField, setCopiedField] = useState(null)

  if (!business) return null

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{business.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Categories */}
          {business.categories && business.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {business.categories.map((category) => (
                <Badge key={category.id} variant="secondary">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Distance */}
          {business.distance && (
            <div className="flex items-center text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4 mr-2" />
              {formatDistance(business.distance)} away
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Information</h3>

            {/* Address */}
            {(business.formatted_address || business.address) && (
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {business.formatted_address || business.address}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(business.formatted_address || business.address, 'address')}
                >
                  {copiedField === 'address' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Phone */}
            {business.tel && (
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <Phone className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a 
                      href={`tel:${business.tel}`}
                      className="text-sm text-primary-500 hover:underline"
                    >
                      {business.tel}
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(business.tel, 'phone')}
                >
                  {copiedField === 'phone' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Email */}
            {business.email && (
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <Mail className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href={`mailto:${business.email}`}
                      className="text-sm text-primary-500 hover:underline"
                    >
                      {business.email}
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(business.email, 'email')}
                >
                  {copiedField === 'email' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {/* No Website Notice */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-green-500">
                ✓ This business does not have a website
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This could be a great lead for web design or digital marketing services
              </p>
            </div>
          </div>

          {/* Coordinates */}
          {business.latitude && business.longitude && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Coordinates</h3>
              <p className="text-xs text-muted-foreground font-mono">
                {business.latitude.toFixed(6)}, {business.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              className="flex-1"
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
                window.open(url, '_blank')
              }}
            >
              Open in Google Maps
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
