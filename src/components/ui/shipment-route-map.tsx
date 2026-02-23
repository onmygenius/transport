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

  useEffect(() => {
    if (locations.length < 2) {
      setLoading(false)
      setError('Not enough locations to show route')
      return
    }

    let mounted = true

    // Wait for DOM to be ready with retry logic
    const checkAndInit = () => {
      if (!mounted) return
      
      if (mapRef.current) {
        initMap()
      } else {
        // Retry after a short delay
        setTimeout(checkAndInit, 50)
      }
    }

    // Start checking after initial delay
    const timer = setTimeout(checkAndInit, 100)

    const initMap = async () => {
      console.log('Initializing map with', locations.length, 'locations')
      try {
        // Load Google Maps script
        await loadGoogleMapsScript(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '')

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

        // Create map centered on first location
        const map = new google.maps.Map(mapRef.current!, {
          zoom: 6,
          center: validLocations[0]!.position,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        })

        // If we have multiple locations, draw route
        if (validLocations.length >= 2) {
          const directionsService = new google.maps.DirectionsService()
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#06b6d4', // cyan-500
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          })

          // Build waypoints (all locations except first and last)
          const waypoints = validLocations.slice(1, -1).map(loc => ({
            location: loc!.position,
            stopover: true
          }))

          try {
            const result = await directionsService.route({
              origin: validLocations[0]!.position,
              destination: validLocations[validLocations.length - 1]!.position,
              waypoints,
              travelMode: google.maps.TravelMode.DRIVING,
              optimizeWaypoints: false
            })

            directionsRenderer.setDirections(result)
          } catch (err) {
            console.error('Directions request failed:', err)
            // Fallback: just show markers
            validLocations.forEach((loc, idx) => {
              new google.maps.Marker({
                position: loc!.position,
                map,
                title: loc!.label,
                label: {
                  text: (idx + 1).toString(),
                  color: 'white',
                  fontWeight: 'bold'
                },
              })
            })

            // Fit bounds to show all markers
            const bounds = new google.maps.LatLngBounds()
            validLocations.forEach(loc => bounds.extend(loc!.position))
            map.fitBounds(bounds)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Map initialization failed:', err)
        setError('Failed to load map')
        setLoading(false)
      }
    }

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [locations])

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={mapRef} className="w-full h-96 rounded-lg" />
  )
}
