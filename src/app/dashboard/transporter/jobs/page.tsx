import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TransporterJobsClient from './client'

export default async function TransporterJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: jobs } = await supabase
    .from('shipments')
    .select(`
      *,
      client:profiles!shipments_client_id_fkey(id, company_name, full_name)
    `)
    .eq('transporter_id', user.id)
    .in('status', ['confirmed', 'picked_up', 'in_transit', 'delivered', 'completed', 'disputed'])
    .order('updated_at', { ascending: false })

  return <TransporterJobsClient jobs={jobs || []} />
}
