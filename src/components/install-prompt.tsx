'use client'

import { useEffect, useState } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    console.log('InstallPrompt: Component mounted')
    
    // Check if running as standalone app
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    console.log('InstallPrompt: standalone =', standalone)
    if (standalone) {
      console.log('InstallPrompt: App already installed, not showing prompt')
      return
    }

    // Check if user already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    console.log('InstallPrompt: dismissed =', dismissed)
    if (dismissed) {
      console.log('InstallPrompt: User dismissed prompt, not showing. Clear localStorage to test again.')
      return
    }

    console.log('InstallPrompt: Waiting for beforeinstallprompt event...')

    // Listen for beforeinstallprompt event (Android Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('InstallPrompt: beforeinstallprompt event fired!', e)
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
      console.log('InstallPrompt: Prompt will be shown')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Card className="bg-white shadow-lg border-2 border-red-500">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <img 
                src="/logo-pwa.png" 
                alt="TRADE CONTAINER" 
                className="w-12 h-12 rounded-lg"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">
                Install TRADE CONTAINER App
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Get faster access and work offline!
              </p>

              <Button 
                onClick={handleInstallClick}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Install Now
              </Button>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
