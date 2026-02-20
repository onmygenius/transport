import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientShipmentsClient from './client'

export default async function ClientShipmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shipments } = await supabase
    .from('shipments')
    .select('*, offers(count)')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return <ClientShipmentsClient shipments={shipments || []} />
}

