'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Save, CheckCircle, AlertTriangle, Upload, Camera, User, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const tabs = [
  { id: 'profile', label: 'Company Profile' },
  { id: 'kyc', label: 'KYC Verification' },
  { id: 'bank', label: 'Bank Account' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
]

const EQUIPMENT_TYPES = ['flatbed', 'curtainsider', 'reefer', 'tank', 'lowbed', 'mega_trailer', 'other']
const CONTAINER_TYPES = ['20ft', '40ft', '40ft_hc', '45ft', 'reefer_20ft', 'reefer_40ft', 'open_top', 'flat_rack']

export default function TransporterSettingsPage() {
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
    avatar_url: ''
  })
  
  const [transporterProfile, setTransporterProfile] = useState({
    fleet_size: 1,
    equipment_types: [] as string[],
    container_types: [] as string[],
    operating_countries: [] as string[]
  })
  
  const [operatingCountry, setOperatingCountry] = useState('')

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
          avatar_url: profileData.avatar_url || ''
        })
      }

      const { data: transporterData } = await supabase
        .from('transporter_profiles')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (transporterData) {
        setTransporterProfile({
          fleet_size: transporterData.fleet_size || 1,
          equipment_types: transporterData.equipment_types || [],
          container_types: transporterData.container_types || [],
          operating_countries: transporterData.operating_countries || []
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

      const { error: transporterError } = await supabase
        .from('transporter_profiles')
        .update({
          fleet_size: transporterProfile.fleet_size,
          equipment_types: transporterProfile.equipment_types,
          container_types: transporterProfile.container_types,
          operating_countries: transporterProfile.operating_countries
        })
        .eq('profile_id', user.id)

      if (transporterError) throw transporterError

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleEquipmentType = (type: string) => {
    setTransporterProfile(prev => ({
      ...prev,
      equipment_types: prev.equipment_types.includes(type)
        ? prev.equipment_types.filter(t => t !== type)
        : [...prev.equipment_types, type]
    }))
  }

  const toggleContainerType = (type: string) => {
    setTransporterProfile(prev => ({
      ...prev,
      container_types: prev.container_types.includes(type)
        ? prev.container_types.filter(t => t !== type)
        : [...prev.container_types, type]
    }))
  }

  const addOperatingCountry = () => {
    if (operatingCountry && !transporterProfile.operating_countries.includes(operatingCountry)) {
      setTransporterProfile(prev => ({
        ...prev,
        operating_countries: [...prev.operating_countries, operatingCountry]
      }))
      setOperatingCountry('')
    }
  }

  const removeOperatingCountry = (country: string) => {
    setTransporterProfile(prev => ({
      ...prev,
      operating_countries: prev.operating_countries.filter(c => c !== country)
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TransporterHeader title="Settings" subtitle="Loading..." />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <TransporterHeader title="Settings" subtitle="Manage your account and company details" />

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
                      ? 'bg-blue-50 text-blue-700'
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
                        <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
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
                        <p className="text-sm text-blue-600">Uploading...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Company Profile</CardTitle>
                    <CardDescription>Update your company information visible to clients</CardDescription>
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
                      <div className="space-y-2">
                        <Label>Fleet Size</Label>
                        <Input 
                          type="number" 
                          min="1"
                          value={transporterProfile.fleet_size}
                          onChange={e => setTransporterProfile(prev => ({ ...prev, fleet_size: parseInt(e.target.value) || 1 }))}
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

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Equipment Types</CardTitle>
                    <CardDescription>Select the types of equipment you operate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {EQUIPMENT_TYPES.map(type => (
                        <Badge
                          key={type}
                          variant={transporterProfile.equipment_types.includes(type) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleEquipmentType(type)}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Container Types</CardTitle>
                    <CardDescription>Select the container types you can transport</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {CONTAINER_TYPES.map(type => (
                        <Badge
                          key={type}
                          variant={transporterProfile.container_types.includes(type) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleContainerType(type)}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Operating Countries</CardTitle>
                    <CardDescription>Countries where you operate</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={operatingCountry}
                        onChange={e => setOperatingCountry(e.target.value.toUpperCase())}
                        placeholder="Enter country code (e.g., RO, DE, FR)"
                        maxLength={2}
                      />
                      <Button onClick={addOperatingCountry} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {transporterProfile.operating_countries.map(country => (
                        <Badge
                          key={country}
                          className="cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200"
                          onClick={() => removeOperatingCountry(country)}
                        >
                          {country} ×
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'kyc' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">KYC Verification</CardTitle>
                  <CardDescription>Upload your company documents for verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">KYC Approved</p>
                      <p className="text-xs text-emerald-600">Your company is verified. Verified badge is active on your profile.</p>
                    </div>
                    <Badge variant="success" className="ml-auto">Approved</Badge>
                  </div>
                  <Separator />
                  {[
                    { label: 'Company Registration Certificate', status: 'verified', file: 'registration.pdf' },
                    { label: 'Transport License', status: 'verified', file: 'license.pdf' },
                    { label: 'CMR Insurance', status: 'verified', file: 'insurance.pdf' },
                  ].map(doc => (
                    <div key={doc.label} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                        <p className="text-xs text-gray-400">{doc.file}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success">Verified</Badge>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <Upload className="h-3.5 w-3.5" />
                          Replace
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === 'bank' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bank Account</CardTitle>
                  <CardDescription>IBAN used for payouts from your wallet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>IBAN</Label>
                    <Input defaultValue="RO49AAAA1B31007593840000" />
                    <p className="text-xs text-gray-500">Funds will be transferred to this account when you request a payout</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input defaultValue="Trans Test SRL" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input defaultValue="Banca Transilvania" />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'New matching shipment', desc: 'When a shipment matches your saved filters' },
                    { label: 'Offer accepted / rejected', desc: 'When a client responds to your offer' },
                    { label: 'Shipment status changed', desc: 'Updates on your active jobs' },
                    { label: 'New chat message', desc: 'When a client sends you a message' },
                    { label: 'Subscription expiring', desc: '7, 3 and 1 day before expiry' },
                    { label: 'Payment released', desc: 'When escrow funds are released to your wallet' },
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
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline" size="sm">Enable 2FA</Button>
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
              <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-32">
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
