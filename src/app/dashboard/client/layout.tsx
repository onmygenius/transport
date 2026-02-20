import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientSidebar } from '@/components/client/sidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, company_name, full_name, kyc_status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'client') redirect('/dashboard')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ClientSidebar
        companyName={profile.company_name || profile.full_name || 'My Company'}
        email={profile.email}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
