"use client"

import type React from "react"

import { useState } from "react"
import { Edit, Trash2, Star, Archive, FolderOpen, Check } from "lucide-react"
import type { Bookmark } from "@/app/page"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

  const handleTouchStart = () => {
    if (isSelectionMode) return

    const timer = setTimeout(() => {
      // Enable selection mode on long press
      if (onSelect) {
        onSelect(bookmark.id)
      }
    }, 500)
    setLongPressTimer(timer)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleClick = () => {
    if (isSelectionMode && onSelect) {
      onSelect(bookmark.id)
    }
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdate(bookmark.id, { isFavorite: !bookmark.isFavorite })
  }

  const toggleArchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdate(bookmark.id, { isArchived: !bookmark.isArchived })
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Edit bookmark:", bookmark.id)
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
      draggable={false}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      className={`relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/80 overflow-hidden cursor-pointer ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${isDragOver ? "ring-2 ring-black/20 scale-105" : ""} ${isSelected ? "ring-2 ring-black scale-105" : ""}`}
    >
      {/* Selection Indicator */}
      {isSelectionMode && (
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

      {/* Preview Image - Full Size with Proper Aspect Ratio */}
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        <img
          src={bookmark.image || "/placeholder.svg"}
          alt={bookmark.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=200&width=400"
          }}
        />

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
      </div>

      {/* Content - Bottom Section */}
      <div className="p-4 space-y-3">
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

        {/* Action Icons - Always Visible (Hidden in Selection Mode) */}
        {!isSelectionMode && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
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

              <button
                onClick={toggleArchive}
                className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                title={bookmark.isArchived ? "Unarchive" : "Archive"}
              >
                <Archive
                  className={`w-4 h-4 transition-colors ${
                    bookmark.isArchived
                      ? "text-black dark:text-white"
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
