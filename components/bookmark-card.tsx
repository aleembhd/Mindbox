"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Edit, Trash2, Star, FolderOpen, Check, X, Play, Pause } from "lucide-react"
import type { Bookmark } from "@/app/page"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface BookmarkCardProps {
  bookmark: Bookmark
  collections?: string[]
  isSelected?: boolean
  isSelectionMode?: boolean
  onUpdate: (id: string, updates: Partial<Bookmark>) => void
  onDelete: (id: string) => void
  onSelect?: (id: string) => void
  isDragging: boolean
  isDragOver: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: () => void
}

export default function BookmarkCard({
  bookmark,
  collections = [],
  isSelected = false,
  isSelectionMode = false,
  onUpdate,
  onDelete,
  onSelect,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
}: BookmarkCardProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(bookmark.title)
  const [editedDescription, setEditedDescription] = useState(bookmark.description)
  const [editedUrl, setEditedUrl] = useState(bookmark.url)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // Detect if this bookmark is a video
  const isVideo = bookmark.isVideo || 
    (bookmark.url && (
      bookmark.url.includes('youtube.com') || 
      bookmark.url.includes('youtu.be') || 
      bookmark.url.includes('vimeo.com') ||
      bookmark.url.includes('twitter.com/') && bookmark.url.includes('/video/') ||
      bookmark.url.includes('x.com/') && bookmark.url.includes('/video/') ||
      bookmark.url.includes('linkedin.com') && bookmark.url.includes('/video/') ||
      bookmark.url.endsWith('.mp4') || 
      bookmark.url.endsWith('.webm') || 
      bookmark.url.endsWith('.ogg')
    ))
    
  // Determine video type and create embed URL
  const getVideoEmbedUrl = () => {
    if (!bookmark.url) return ''
    
    // YouTube
    if (bookmark.videoProvider === 'youtube' || bookmark.url.includes('youtube.com') || bookmark.url.includes('youtu.be')) {
      const videoId = bookmark.videoId || (() => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
        const match = bookmark.url.match(regExp)
        return (match && match[7].length === 11) ? match[7] : null
      })()
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`
      }
    }
    
    // Vimeo
    if (bookmark.videoProvider === 'vimeo' || bookmark.url.includes('vimeo.com')) {
      const videoId = bookmark.videoId || (() => {
        const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/
        const match = bookmark.url.match(regExp)
        return match ? match[1] : null
      })()
      
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}?autoplay=1`
      }
    }
    
    // For direct video files
    if (bookmark.url.endsWith('.mp4') || bookmark.url.endsWith('.webm') || bookmark.url.endsWith('.ogg')) {
      return bookmark.url
    }
    
    // For other URLs, just return the original URL
    return bookmark.url
  }
  
  const isDirectVideo = bookmark.url?.endsWith('.mp4') || bookmark.url?.endsWith('.webm') || bookmark.url?.endsWith('.ogg')

  // Handle video play/pause
  const toggleVideo = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isSelectionMode || isEditing) return
    
    setIsVideoPlaying(!isVideoPlaying)
    
    // For direct video files
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleTouchStart = () => {
    if (isSelectionMode || isEditing) return

    const timer = setTimeout(() => {
      // Enable selection mode on long press
      if (onSelect) {
        onSelect(bookmark.id)
      }
    }, 2000) // 2 seconds
    setLongPressTimer(timer)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // If it's a video, prevent other handlers and play/pause the video
    if (isVideo && !isEditing && !isSelectionMode) {
      toggleVideo(e)
      return
    }
    
    // Otherwise, handle click normally
    if (isSelectionMode && onSelect) {
      onSelect(bookmark.id)
    }
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdate(bookmark.id, { isFavorite: !bookmark.isFavorite })
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const saveEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdate(bookmark.id, { 
      title: editedTitle, 
      description: editedDescription, 
      url: editedUrl 
    })
    setIsEditing(false)
  }

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditedTitle(bookmark.title)
    setEditedDescription(bookmark.description)
    setEditedUrl(bookmark.url)
    setIsEditing(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(bookmark.id)
  }

  const moveToCollection = (collection: string) => {
    onUpdate(bookmark.id, { collection })
  }

  // Show 1-2 lines of description (15-20 words)
  const getShortDescription = (text: string) => {
    const words = text.split(" ")
    return words.length > 15 ? words.slice(0, 15).join(" ") + "..." : text
  }

  return (
    <div
      id={`bookmark-${bookmark.id}`}
      draggable={!isEditing && false}
      onDragStart={isEditing ? undefined : onDragStart}
      onDragOver={isEditing ? undefined : onDragOver}
      onDragEnter={isEditing ? undefined : onDragEnter}
      onDragLeave={isEditing ? undefined : onDragLeave}
      onDrop={isEditing ? undefined : onDrop}
      onDragEnd={isEditing ? undefined : onDragEnd}
      onTouchStart={isEditing ? undefined : handleTouchStart}
      onTouchEnd={isEditing ? undefined : handleTouchEnd}
      onClick={isEditing ? undefined : handleCardClick}
      className={`relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/80 overflow-hidden ${isEditing ? "cursor-default" : "cursor-pointer"} ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${isDragOver ? "ring-2 ring-black/20 scale-105" : ""} ${isSelected ? "ring-2 ring-black scale-105" : ""}`}
    >
      {/* Selection Indicator */}
      {isSelectionMode && !isEditing && (
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected ? "bg-black border-black" : "bg-white/80 border-gray-300"
            }`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}

      {/* Media Section - Either image preview or video player */}
      <div className="relative aspect-video w-full">
        {!isEditing ? (
          <>
            {/* Show video player when playing, otherwise show preview image */}
            {isVideo && isVideoPlaying ? (
              <>
                {/* Show proper video player based on type */}
                {isDirectVideo ? (
                  <video
                    ref={videoRef}
                    src={getVideoEmbedUrl()}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <iframe
                      ref={iframeRef}
                      src={getVideoEmbedUrl()}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}
                
                {/* Close button for videos */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsVideoPlaying(false)
                  }}
                  className="absolute top-2 right-2 z-10 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* Preview Image */}
                <img
                  src={bookmark.image || "/placeholder.svg"}
                  alt={bookmark.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                  }}
                />
                
                {/* Play Button for Videos */}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-black/70 flex items-center justify-center text-white">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                  </div>
                )}

                {/* Category Badge */}
                <div className={`absolute top-2 ${isSelectionMode ? "right-2" : "left-2"}`}>
                  <span className="text-xs text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                    {bookmark.category}
                  </span>
                </div>

                {/* Collection Badge */}
                {bookmark.collection && bookmark.collection !== "General" && (
                  <div className="absolute bottom-2 left-2">
                    <span className="text-xs text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" />
                      {bookmark.collection}
                    </span>
                  </div>
                )}

                {/* Favorite Indicator */}
                {bookmark.isFavorite && (
                  <div className="absolute bottom-2 right-2">
                    <Star className="w-4 h-4 fill-current text-white drop-shadow-sm" />
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-center text-sm text-gray-500 dark:text-gray-400 p-4">
            Enter URL below to change image
          </div>
        )}
      </div>

      {/* Content - Bottom Section */}
      <div className="p-3 space-y-2">
        {!isEditing ? (
          <>
            {/* Title */}
            <h3 className="font-semibold text-black dark:text-white text-sm leading-tight break-words line-clamp-2">
              {bookmark.title}
            </h3>

            {/* Description - 1-2 lines */}
            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed break-words line-clamp-2">
              {getShortDescription(bookmark.description)}
            </p>

            {/* Domain */}
            <p className="text-gray-400 dark:text-gray-500 text-xs break-all">{bookmark.domain}</p>
          </>
        ) : (
          <div className="space-y-2">
            <Input 
              value={editedTitle} 
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Title"
              className="text-sm"
            />
            <Textarea 
              value={editedDescription} 
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Description"
              className="text-xs min-h-[60px]"
            />
            <Input 
              value={editedUrl} 
              onChange={(e) => setEditedUrl(e.target.value)}
              placeholder="URL"
              className="text-xs"
            />
          </div>
        )}

        {/* Action Icons - Always Visible (Hidden in Selection Mode) */}
        {!isSelectionMode && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
            {!isEditing ? (
              <>
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleFavorite}
                    className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title={bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        bookmark.isFavorite
                          ? "fill-current text-black dark:text-white"
                          : "text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white"
                      }`}
                    />
                  </button>

                  {/* Move to Collection */}
                  {collections.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors">
                        <FolderOpen className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        {collections.map((collection) => (
                          <DropdownMenuItem
                            key={collection}
                            onClick={() => moveToCollection(collection)}
                            className={bookmark.collection === collection ? "bg-gray-100 dark:bg-gray-700" : ""}
                          >
                            {collection}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleEdit}
                    className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit bookmark"
                  >
                    <Edit className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={handleDelete}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete bookmark"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-between w-full">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={cancelEdit}
                  className="flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={saveEdit}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="w-3 h-3" /> Save
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="text-black dark:text-white font-medium text-sm">Moving...</div>
        </div>
      )}
    </div>
  )
}
