import { MapPin, Phone, Mail, Navigation } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistance } from '@/lib/utils'

export default function BusinessCard({ business, onClick }) {
  const primaryCategory = business.categories?.[0]

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick && onClick(business)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{business.name}</CardTitle>
            {primaryCategory && (
              <Badge variant="secondary" className="mt-2">
                {primaryCategory.name}
              </Badge>
            )}
          </div>
          {business.distance && (
            <div className="text-xs text-muted-foreground">
              <Navigation className="h-3 w-3 inline mr-1" />
              {formatDistance(business.distance)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {/* Address */}
          {(business.formatted_address || business.address) && (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">
                {business.formatted_address || business.address}
              </span>
            </div>
          )}

          {/* Phone */}
          {business.tel && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
              <a 
                href={`tel:${business.tel}`}
                className="text-primary-500 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {business.tel}
              </a>
            </div>
          )}

          {/* Email */}
          {business.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
              <a 
                href={`mailto:${business.email}`}
                className="text-primary-500 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {business.email}
              </a>
            </div>
          )}

          {/* No Website Badge */}
          <div className="pt-2">
            <Badge variant="outline" className="text-green-500 border-green-500">
              ✓ No Website
            </Badge>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={(e) => {
            e.stopPropagation()
            onClick && onClick(business)
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
