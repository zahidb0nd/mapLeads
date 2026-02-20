import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom purple marker
const purpleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function MapUpdater({ center, businesses }) {
  const map = useMap()

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 13)
    }
  }, [center, map])

  useEffect(() => {
    if (businesses && businesses.length > 0) {
      const bounds = businesses
        .filter(b => b.latitude && b.longitude)
        .map(b => [b.latitude, b.longitude])
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [businesses, map])

  return null
}

export default function MapView({ businesses = [], center = [51.505, -0.09], onBusinessClick }) {
  const defaultCenter = center && center[0] && center[1] ? center : [51.505, -0.09]

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={center} businesses={businesses} />

        {businesses.map((business) => {
          if (!business.latitude || !business.longitude) return null
          
          return (
            <Marker
              key={business.fsq_id}
              position={[business.latitude, business.longitude]}
              icon={purpleIcon}
              eventHandlers={{
                click: () => onBusinessClick && onBusinessClick(business)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm">{business.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {business.formatted_address || business.address}
                  </p>
                  {business.categories && business.categories.length > 0 && (
                    <p className="text-xs text-primary-500 mt-1">
                      {business.categories[0].name}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
