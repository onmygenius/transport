import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TransporterSubscriptionClient from './client'

export default async function TransporterSubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return <TransporterSubscriptionClient subscription={subscription} />
}

