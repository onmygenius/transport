import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, PlusCircle, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'
import { getTruckAvailability } from '@/lib/actions/trucks'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TrucksList from './trucks-list'

export default async function TransporterTrucksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = await getTruckAvailability()
  const trucks = result.success ? result.data : []

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="My Trucks" subtitle="Manage your truck availability posts" />

      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-end">
          <Link href="/dashboard/transporter/trucks/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Post Truck Availability
            </Button>
          </Link>
        </div>

        <TrucksList trucks={trucks} />
      </main>
    </div>
  )
}
