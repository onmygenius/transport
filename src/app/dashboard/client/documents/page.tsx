import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientDocumentsClient from './client'

export default async function ClientDocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: documents } = await supabase
    .from('shipment_documents')
    .select(`
      *,
      shipment:shipments!inner(
        id,
        shipment_number,
        status
      ),
      uploader:profiles!shipment_documents_uploaded_by_fkey(
        full_name
      )
    `)
    .eq('shipment.client_id', user.id)
    .order('created_at', { ascending: false })

  return <ClientDocumentsClient documents={documents || []} />
}
