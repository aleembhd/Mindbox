"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface VideoPlayerProps {
  videoUrl: string
  videoProvider?: 'youtube' | 'twitter' | 'linkedin' | 'vimeo' | 'other'
  videoId?: string
  isOpen: boolean
  onClose: () => void
}

export default function VideoPlayer({ videoUrl, videoProvider, videoId, isOpen, onClose }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  if (!isOpen) return null
  
  // Extract YouTube video ID if not provided
  const getYouTubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : null
  }
  
  // Get Vimeo ID
  const getVimeoId = (url: string) => {
    const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }
  
  let embedUrl = ''
  
  // Determine the video provider and create the appropriate embed URL
  if (videoProvider === 'youtube' || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const ytId = videoId || getYouTubeId(videoUrl)
    if (ytId) {
      embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1`
    }
  } else if (videoProvider === 'vimeo' || videoUrl.includes('vimeo.com')) {
    const vimeoId = videoId || getVimeoId(videoUrl)
    if (vimeoId) {
      embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1`
    }
  } else if (videoProvider === 'twitter' || videoUrl.includes('twitter.com') || videoUrl.includes('x.com')) {
    // For Twitter, we'll just redirect to the URL since embedding requires API access
    embedUrl = videoUrl
  } else if (videoProvider === 'linkedin' || videoUrl.includes('linkedin.com')) {
    // LinkedIn doesn't have a simple embed URL, so we'll just redirect
    embedUrl = videoUrl
  } else if (videoUrl.includes('.mp4') || videoUrl.includes('.webm') || videoUrl.includes('.ogg')) {
    // Direct video file URL
    embedUrl = videoUrl
  } else {
    // Default to just opening the URL in an iframe if we can't determine the type
    embedUrl = videoUrl
  }
  
  const handleLoad = () => {
    setIsLoading(false)
  }
  
  const isDirectVideo = videoUrl.includes('.mp4') || videoUrl.includes('.webm') || videoUrl.includes('.ogg')
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80" onClick={onClose}>
      <div 
        className="relative w-full max-w-4xl max-h-[80vh] rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
        
        {isDirectVideo ? (
          <video 
            src={embedUrl} 
            controls 
            autoPlay 
            className="w-full h-full max-h-[80vh]" 
            onLoadedData={handleLoad}
          />
        ) : (
          <iframe
            src={embedUrl}
            className="w-full aspect-video"
            allowFullScreen
            onLoad={handleLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
      </div>
    </div>
  )
} 