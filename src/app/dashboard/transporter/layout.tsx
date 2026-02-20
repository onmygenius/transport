import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TransporterSidebar } from '@/components/transporter/sidebar'

export default async function TransporterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, company_name, full_name, kyc_status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'transporter') redirect('/dashboard')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <TransporterSidebar
        companyName={profile.company_name || profile.full_name || 'My Company'}
        email={profile.email}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
