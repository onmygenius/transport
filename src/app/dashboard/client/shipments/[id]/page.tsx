import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ShipmentDetailClient from './client'

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shipment } = await supabase
    .from('shipments')
    .select(`
      *,
      offers(
        *,
        transporter:profiles!offers_transporter_id_fkey(id, company_name, full_name, company_country, kyc_status)
      )
    `)
    .eq('id', id)
    .eq('client_id', user.id)
    .single()

  if (!shipment) notFound()

  // Fetch documents for this shipment
  const { data: documents } = await supabase
    .from('shipment_documents')
    .select(`
      *,
      uploader:profiles!shipment_documents_uploaded_by_fkey(
        id,
        full_name,
        company_name,
        role
      )
    `)
    .eq('shipment_id', id)
    .order('created_at', { ascending: false })

  return <ShipmentDetailClient shipment={shipment} initialDocuments={documents || []} />
}
