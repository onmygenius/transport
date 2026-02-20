'use client'

import { useState } from 'react'
import { TransporterHeader } from '@/components/transporter/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Save, CheckCircle, AlertTriangle, Upload } from 'lucide-react'

const tabs = [
  { id: 'profile', label: 'Company Profile' },
  { id: 'kyc', label: 'KYC Verification' },
  { id: 'bank', label: 'Bank Account' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
]

export default function TransporterSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Company Profile</CardTitle>
                  <CardDescription>Update your company information visible to clients</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input defaultValue="Trans Test SRL" />
                    </div>
                    <div className="space-y-2">
                      <Label>CIF / Registration Number</Label>
                      <Input defaultValue="RO12345678" />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input defaultValue="Romania" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input defaultValue="+40 700 000 000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input defaultValue="Ion Popescu" />
                    </div>
                    <div className="space-y-2">
                      <Label>Fleet Size</Label>
                      <Input type="number" defaultValue="5" min="1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Company Address</Label>
                    <Input defaultValue="Str. Exemplu nr. 1, București" />
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
              <Button onClick={handleSave} className="gap-2 min-w-32">
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
