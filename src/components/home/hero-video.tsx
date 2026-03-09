'use client'

import { useState, useEffect } from 'react'

export default function HeroVideo() {
  const [isMobile, setIsMobile] = useState(false)
  const [showVideo, setShowVideo] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const videoSrc = isMobile ? '/hero_login.mp4' : '/hero.mp4'

  return (
    <>
      {showVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          onError={() => setShowVideo(false)}
        />
      )}
      {!showVideo && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900" />
      )}
    </>
  )
}
