'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

// Load Google Maps script
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.maps) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(script)
  })
}

interface Location {
  city: string
  country: string
  label: string
  type: 'pickup' | 'stop' | 'dropoff'
}

interface Props {
  locations: Location[]
}

export function ShipmentRouteMap({ locations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('ShipmentRouteMap component rendered with locations:', locations)

  useEffect(() => {
    console.log('useEffect triggered with', locations.length, 'locations')
    
    if (locations.length < 2) {
      console.warn('Not enough locations (need at least 2):', locations.length)
      setLoading(false)
      setError('Not enough locations to show route')
      return
    }

    const initMap = async () => {
      console.log('initMap called, checking mapRef.current:', !!mapRef.current)
      
      if (!mapRef.current) {
        console.error('Map ref is not available, will retry...')
        // Retry after DOM is ready
        setTimeout(initMap, 100)
        return
      }
      
      console.log('Initializing map with', locations.length, 'locations')
      console.log('API Key available:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
      try {
        // Load Google Maps script
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          console.error('Google Maps API key is missing!')
          setError('Google Maps API key is not configured')
          setLoading(false)
          return
        }
        console.log('Loading Google Maps script...')
        await loadGoogleMapsScript(apiKey)
        console.log('Google Maps script loaded successfully')

        const geocoder = new google.maps.Geocoder()
        
        // Geocode all locations
        console.log('Starting geocoding for locations:', locations)
        const geocodedLocations = await Promise.all(
          locations.map(async (loc, idx) => {
            const address = `${loc.city}, ${loc.country}`
            console.log(`Geocoding ${idx + 1}/${locations.length}: "${address}"`)
            try {
              const result = await geocoder.geocode({ address })
              console.log(`Geocode result for "${address}":`, result)
              
              if (result.results[0]) {
                console.log(`✓ Found: ${result.results[0].formatted_address}`)
                return {
                  ...loc,
                  position: result.results[0].geometry.location
                }
              }
              console.warn(`✗ No results for "${address}"`)
              return null
            } catch (err) {
              console.error(`✗ Failed to geocode "${address}":`, err)
              return null
            }
          })
        )
        
        console.log('Geocoded locations:', geocodedLocations)

        const validLocations = geocodedLocations.filter(Boolean)
        
        if (validLocations.length < 2) {
          setError('Could not geocode locations')
          setLoading(false)
          return
        }

        // Create map
        const bounds = new google.maps.LatLngBounds()
        validLocations.forEach(loc => bounds.extend(loc!.position))
        
        const map = new google.maps.Map(mapRef.current!, {
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        })

        // Try to draw route with Directions API
        if (validLocations.length >= 2) {
          const directionsService = new google.maps.DirectionsService()
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true, // We'll add custom markers
            polylineOptions: {
              strokeColor: '#ef4444', // red-500
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          })

          try {
            const result = await directionsService.route({
              origin: validLocations[0]!.position,
              destination: validLocations[validLocations.length - 1]!.position,
              travelMode: google.maps.TravelMode.DRIVING,
            })

            directionsRenderer.setDirections(result)
            console.log('Directions route displayed successfully')
          } catch (err) {
            console.error('Directions request failed, showing markers only:', err)
          }
        }

        // Add custom markers for all locations
        validLocations.forEach((loc, idx) => {
          const marker = new google.maps.Marker({
            position: loc!.position,
            map,
            title: loc!.label,
            label: {
              text: loc!.type === 'pickup' ? 'A' : 'B',
              color: 'white',
              fontWeight: 'bold'
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: loc!.type === 'pickup' ? '#06b6d4' : '#10b981',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            }
          })

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 8px;"><strong>${loc!.label}</strong></div>`
          })

          marker.addListener('click', () => {
            infoWindow.open(map, marker)
          })
        })

        // Fit map to show all markers
        map.fitBounds(bounds)

        setLoading(false)
      } catch (err) {
        console.error('Map initialization failed:', err)
        setError('Failed to load map')
        setLoading(false)
      }
    }

    initMap()
  }, [locations])

  return (
    <div className="relative w-full h-96">
      <div ref={mapRef} className="w-full h-96 rounded-lg" />
      
      {loading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
