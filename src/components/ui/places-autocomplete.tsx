'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface PlacesAutocompleteProps {
  placeholder?: string
  value: string
  onChange: (value: string, placeId?: string, lat?: number, lng?: number) => void
  types?: string[]
  className?: string
}

let mapsLoaded = false
let mapsLoading = false
const mapsCallbacks: (() => void)[] = []

function loadGoogleMaps(callback: () => void) {
  if (mapsLoaded) { callback(); return }
  mapsCallbacks.push(callback)
  if (mapsLoading) return
  mapsLoading = true
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
  script.async = true
  script.onload = () => {
    mapsLoaded = true
    mapsCallbacks.forEach(cb => cb())
    mapsCallbacks.length = 0
  }
  document.head.appendChild(script)
}

export function PlacesAutocomplete({
  placeholder = 'Search...',
  value,
  onChange,
  types = ['establishment', 'geocode'],
  className = '',
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadGoogleMaps(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, { types, fields: ['formatted_address', 'name', 'place_id', 'geometry'] })

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current!.getPlace()
      const lat = place.geometry?.location?.lat()
      const lng = place.geometry?.location?.lng()
      onChange(place.formatted_address || place.name || '', place.place_id, lat, lng)
    })
  }, [ready, types, onChange])

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        placeholder={placeholder}
        className={`flex h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 py-1 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${className}`}
        style={{ color: '#111827', caretColor: '#111827' }}
      />
    </div>
  )
}
