'use client'

import { useState } from 'react'
import { ClientHeader } from '@/components/client/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Save, CheckCircle, Upload } from 'lucide-react'

const tabs = [
  { id: 'profile', label: 'Company Profile' },
  { id: 'kyc', label: 'KYC Verification' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
]

export default function ClientSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Company Profile</CardTitle>
                  <CardDescription>Update your company information visible to transporters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input defaultValue="Client Test SRL" />
                    </div>
                    <div className="space-y-2">
                      <Label>CIF / Registration Number</Label>
                      <Input defaultValue="RO87654321" />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input defaultValue="Romania" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input defaultValue="+40 700 111 222" />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input defaultValue="Maria Ionescu" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Company Address</Label>
                    <Input defaultValue="Str. Test nr. 5, Cluj-Napoca" />
                  </div>
                </CardContent>
              </Card>
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
                    { label: 'Company Registration Certificate', file: 'registration.pdf' },
                    { label: 'Other Documents (optional)', file: 'other.pdf' },
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
              <Button onClick={handleSave} className="gap-2 min-w-32 bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4" />
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
