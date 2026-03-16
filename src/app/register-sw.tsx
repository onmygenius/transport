'use client'

import { useEffect } from 'react'

export function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let refreshing = false

      // Detectează când Service Worker-ul nou preia controlul
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return
        refreshing = true
        console.log('New Service Worker activated - reloading page...')
        window.location.reload()
      })

      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)

          // Verifică IMEDIAT pentru update-uri la load
          registration.update()

          // Verifică periodic pentru update-uri (la fiecare 30 secunde)
          setInterval(() => {
            registration.update()
          }, 30000)

          // Detectează când există un Service Worker nou în așteptare
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Există o versiune nouă - trimite mesaj să preia controlul
                console.log('New Service Worker installed - activating...')
                newWorker.postMessage({ type: 'SKIP_WAITING' })
              }
            })
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}
