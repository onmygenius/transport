'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Save, CreditCard, Percent, Settings2, Bell, Globe, Shield } from 'lucide-react'

const tabs = [
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'commissions', label: 'Commissions', icon: Percent },
  { id: 'limits', label: 'Limits', icon: Settings2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'general', label: 'General', icon: Globe },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('subscriptions')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="System Settings" subtitle="General platform configuration" />

      <main className="flex-1 p-6">
        <div className="flex gap-6">
          <aside className="w-52 shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 space-y-6">
            {activeTab === 'subscriptions' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Transporter Subscription Prices</CardTitle>
                    <CardDescription>Set prices for transporter accounts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Monthly Subscription (EUR)</Label>
                        <Input type="number" defaultValue="49" min="0" />
                        <p className="text-xs text-gray-500">Monthly price for transporters</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Annual Subscription (EUR)</Label>
                        <Input type="number" defaultValue="470" min="0" />
                        <p className="text-xs text-gray-500">Annual price for transporters</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Client Subscription Prices</CardTitle>
                    <CardDescription>Set prices for client accounts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Monthly Subscription (EUR)</Label>
                        <Input type="number" defaultValue="29" min="0" />
                      </div>
                      <div className="space-y-2">
                        <Label>Annual Subscription (EUR)</Label>
                        <Input type="number" defaultValue="278" min="0" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Free Trial</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Free Trial Days</Label>
                        <Input type="number" defaultValue="14" min="0" max="90" />
                        <p className="text-xs text-gray-500">0 = trial disabled</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Annual Discount (%)</Label>
                        <Input type="number" defaultValue="20" min="0" max="80" />
                        <p className="text-xs text-gray-500">Discount vs. monthly price × 12</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'commissions' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Platform Commissions</CardTitle>
                  <CardDescription>Commission retained from each transport transaction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Commission (%)</Label>
                      <Input type="number" defaultValue="3" min="0" max="20" step="0.5" />
                      <p className="text-xs text-gray-500">Percentage of shipment value</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Commission (EUR)</Label>
                      <Input type="number" defaultValue="10" min="0" />
                      <p className="text-xs text-gray-500">Minimum commission value</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Commission (EUR)</Label>
                      <Input type="number" defaultValue="500" min="0" />
                      <p className="text-xs text-gray-500">Maximum commission cap</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                    <p className="text-sm font-medium text-blue-800">Commission calculation example</p>
                    <p className="mt-1 text-xs text-blue-600">
                      Shipment €2,000 × 3% = €60 platform commission → Transporter receives €1,940
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Escrow release days after delivery</Label>
                    <Input type="number" defaultValue="3" min="1" max="14" />
                    <p className="text-xs text-gray-500">Funds are automatically released N days after confirmation</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum withdrawal (EUR)</Label>
                    <Input type="number" defaultValue="50" min="0" />
                    <p className="text-xs text-gray-500">Minimum amount for transporter payout</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'limits' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Post Limits</CardTitle>
                    <CardDescription>Maximum number of active posts per user</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Active posts without subscription</Label>
                        <Input type="number" defaultValue="1" min="0" max="5" />
                      </div>
                      <div className="space-y-2">
                        <Label>Active posts with subscription</Label>
                        <Input type="number" defaultValue="20" min="1" max="100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Auto Expiry</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Post expiry (days)</Label>
                        <Input type="number" defaultValue="30" min="1" max="90" />
                        <p className="text-xs text-gray-500">Posts expire automatically after N days</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Offer expiry (hours)</Label>
                        <Input type="number" defaultValue="72" min="1" max="168" />
                        <p className="text-xs text-gray-500">Offers expire automatically after N hours</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum file upload size (MB)</Label>
                      <Input type="number" defaultValue="10" min="1" max="50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Matching Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default matching radius (km)</Label>
                      <Input type="number" defaultValue="200" min="50" max="2000" />
                      <p className="text-xs text-gray-500">Maximum distance for automatic suggestions</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Global Notifications</CardTitle>
                  <CardDescription>Send messages to all users or segments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Global Banner (visible to all)</Label>
                    <Input placeholder="E.g.: Scheduled maintenance Saturday 02:00-04:00 UTC" />
                    <p className="text-xs text-gray-500">Leave empty to disable the banner</p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Email Broadcast</Label>
                    <div className="space-y-2">
                      <Input placeholder="Email subject" />
                      <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                        placeholder="Email content..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Send to Transporters</Button>
                      <Button variant="outline" size="sm">Send to Clients</Button>
                      <Button size="sm">Send to All</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Platform Name</Label>
                    <Input defaultValue="FreightEx Europe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input type="email" defaultValue="support@freightex.eu" />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Phone</Label>
                    <Input defaultValue="+40 21 000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Address</Label>
                    <Input defaultValue="Str. Exemplu nr. 1, București, România" />
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
