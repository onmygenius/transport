'use client'

import { EuropeMap } from '@/components/ui/europe-map'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function MapTestPage() {
  const europeanRoutes = [
    {
      start: { lat: 51.9225, lng: 4.4792, label: 'Rotterdam' },
      end: { lat: 53.5511, lng: 9.9937, label: 'Hamburg' }
    },
    {
      start: { lat: 51.9225, lng: 4.4792, label: 'Rotterdam' },
      end: { lat: 45.4642, lng: 9.1900, label: 'Milan' }
    },
    {
      start: { lat: 48.8566, lng: 2.3522, label: 'Paris' },
      end: { lat: 52.5200, lng: 13.4050, label: 'Berlin' }
    },
    {
      start: { lat: 52.2297, lng: 21.0122, label: 'Warsaw' },
      end: { lat: 48.2082, lng: 16.3738, label: 'Vienna' }
    },
    {
      start: { lat: 41.3851, lng: 2.1734, label: 'Barcelona' },
      end: { lat: 43.2965, lng: 5.3698, label: 'Marseille' }
    },
    {
      start: { lat: 51.5074, lng: -0.1278, label: 'London' },
      end: { lat: 51.9225, lng: 4.4792, label: 'Rotterdam' }
    },
    {
      start: { lat: 44.4268, lng: 26.1025, label: 'Bucharest' },
      end: { lat: 47.4979, lng: 19.0402, label: 'Budapest' }
    },
    {
      start: { lat: 55.6761, lng: 12.5683, label: 'Copenhagen' },
      end: { lat: 53.5511, lng: 9.9937, label: 'Hamburg' }
    },
    {
      start: { lat: 50.0755, lng: 14.4378, label: 'Prague' },
      end: { lat: 48.2082, lng: 16.3738, label: 'Vienna' }
    },
    {
      start: { lat: 52.5200, lng: 13.4050, label: 'Berlin' },
      end: { lat: 52.2297, lng: 21.0122, label: 'Warsaw' }
    },
    {
      start: { lat: 48.8566, lng: 2.3522, label: 'Paris' },
      end: { lat: 45.4642, lng: 9.1900, label: 'Milan' }
    },
    {
      start: { lat: 59.3293, lng: 18.0686, label: 'Stockholm' },
      end: { lat: 55.6761, lng: 12.5683, label: 'Copenhagen' }
    },
    {
      start: { lat: 48.2082, lng: 16.3738, label: 'Vienna' },
      end: { lat: 47.4979, lng: 19.0402, label: 'Budapest' }
    },
    {
      start: { lat: 41.9028, lng: 12.4964, label: 'Rome' },
      end: { lat: 45.4642, lng: 9.1900, label: 'Milan' }
    }
  ]

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-7xl">
        <EuropeMap
          dots={europeanRoutes}
          lineColor="#f59e0b"
          showLabels={true}
          animationDuration={3}
          loop={true}
        />
      </div>
    </div>
  )
}
