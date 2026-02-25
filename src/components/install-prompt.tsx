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
    console.log('InstallPrompt: useEffect triggered')
    
    // Check if running as standalone app
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)
    console.log('InstallPrompt: standalone =', standalone)

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)
    console.log('InstallPrompt: iOS =', ios)

    // Detect mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setIsMobile(mobile)
    console.log('InstallPrompt: mobile =', mobile)

    // Don't show if already installed or not mobile
    if (standalone) {
      console.log('InstallPrompt: Already installed, not showing')
      return
    }

    if (!mobile) {
      console.log('InstallPrompt: Not mobile, not showing')
      return
    }

    // Check if user already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      console.log('InstallPrompt: User dismissed, not showing')
      return
    }

    // For Android - listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('InstallPrompt: beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show prompt after 2 seconds for all mobile devices
    const timer = setTimeout(() => {
      console.log('InstallPrompt: Timer fired, showing prompt')
      setShowPrompt(true)
    }, 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
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

  if (!showPrompt || !isMobile || isStandalone) {
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

              {isIOS ? (
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p>To install:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Tap the Share button <span className="inline-block">⎙</span></li>
                    <li>Scroll and tap "Add to Home Screen"</li>
                    <li>Tap "Add"</li>
                  </ol>
                </div>
              ) : (
                <Button 
                  onClick={handleInstallClick}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install Now
                </Button>
              )}
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
