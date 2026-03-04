'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Save, CheckCircle, Upload, Camera, User, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { KycUpload } from '@/components/kyc-upload'
import type { KycStatus } from '@/lib/types'

const tabs = [
  { id: 'profile', label: 'Company Profile' },
  { id: 'kyc', label: 'KYC Verification' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
]

export default function ClientSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  const [profile, setProfile] = useState({
    company_name: '',
    company_cif: '',
    company_country: '',
    company_address: '',
    phone: '',
    contact_person: '',
    avatar_url: '',
    kyc_status: 'pending' as KycStatus,
    kyc_rejection_reason: null as string | null
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({
          company_name: profileData.company_name || '',
          company_cif: profileData.company_cif || '',
          company_country: profileData.company_country || '',
          company_address: profileData.company_address || '',
          phone: profileData.phone || '',
          contact_person: profileData.contact_person || '',
          avatar_url: profileData.avatar_url || '',
          kyc_status: profileData.kyc_status || 'pending',
          kyc_rejection_reason: profileData.kyc_rejection_reason || null
        })
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
      
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar. Please try again.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_name: profile.company_name,
          company_cif: profile.company_cif,
          company_country: profile.company_country,
          company_address: profile.company_address,
          phone: profile.phone,
          contact_person: profile.contact_person
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <ClientHeader title="Settings" subtitle="Loading..." />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <ClientHeader title="Settings" subtitle="Manage your account and company details" />

      <main className="flex-1 p-6">
        <div className="flex gap-6">
          <aside className="w-48 shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 space-y-6">
            {activeTab === 'profile' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Profile Picture</CardTitle>
                    <CardDescription>Upload a photo for your company profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors">
                          <Camera className="h-4 w-4 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                          />
                        </label>
                      </div>
                      {uploadingAvatar && (
                        <p className="text-sm text-emerald-600">Uploading...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Company Profile</CardTitle>
                    <CardDescription>Update your company information visible to transporters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input 
                          value={profile.company_name}
                          onChange={e => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CIF / Registration Number</Label>
                        <Input 
                          value={profile.company_cif}
                          onChange={e => setProfile(prev => ({ ...prev, company_cif: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input 
                          value={profile.company_country}
                          onChange={e => setProfile(prev => ({ ...prev, company_country: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input 
                          value={profile.phone}
                          onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Person</Label>
                        <Input 
                          value={profile.contact_person}
                          onChange={e => setProfile(prev => ({ ...prev, contact_person: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Company Address</Label>
                      <Input 
                        value={profile.company_address}
                        onChange={e => setProfile(prev => ({ ...prev, company_address: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'kyc' && (
              <KycUpload 
                kycStatus={profile.kyc_status} 
                kycRejectionReason={profile.kyc_rejection_reason}
              />
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'New offer received', desc: 'When a transporter submits an offer on your shipment' },
                    { label: 'Offer expiring soon', desc: '24h before an offer expires' },
                    { label: 'Shipment status changed', desc: 'Picked up, in transit, delivered updates' },
                    { label: 'Cargo delivered', desc: 'When transporter confirms delivery — action required' },
                    { label: 'New chat message', desc: 'When a transporter sends you a message' },
                    { label: 'Subscription expiring', desc: '7, 3 and 1 day before expiry' },
                    { label: 'Dispute updated', desc: 'When admin updates your dispute status' },
                  ].map(n => (
                    <div key={n.label} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{n.label}</p>
                        <p className="text-xs text-gray-500">{n.desc}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded" />
                          Email
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded" />
                          In-app
                        </label>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="Minimum 8 characters" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="Repeat new password" />
                  </div>
                  <Separator />
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-800">Delete Account</p>
                    <p className="text-xs text-red-600 mt-1">This action is irreversible. All data will be permanently deleted.</p>
                    <Button variant="destructive" size="sm" className="mt-3">Delete My Account</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-32 bg-emerald-600 hover:bg-emerald-700">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {saved ? 'Saved!' : 'Save Changes'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
