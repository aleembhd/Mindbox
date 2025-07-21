"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FolderPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Bookmark } from "@/app/page"
import BookmarkCard from "@/components/bookmark-card"

interface DashboardProps {
  bookmarks: Bookmark[]
  collections: string[]
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => void
  onDeleteBookmark: (id: string) => void
  onReorderBookmarks: (newOrder: Bookmark[]) => void
  onAddCollection?: (collection: string) => void
}

export default function Dashboard({
  bookmarks,
  collections,
  onUpdateBookmark,
  onDeleteBookmark,
  onReorderBookmarks,
  onAddCollection,
}: DashboardProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showCreateCollection, setShowCreateCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const dragCounter = useRef(0)

  const handleDragStart = (e: React.DragEvent, bookmarkId: string) => {
    setDraggedItem(bookmarkId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, bookmarkId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverItem(bookmarkId)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
  }

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverItem(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    dragCounter.current = 0

    if (draggedItem && draggedItem !== targetId) {
      const draggedIndex = bookmarks.findIndex((b) => b.id === draggedItem)
      const targetIndex = bookmarks.findIndex((b) => b.id === targetId)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newBookmarksOrder = [...bookmarks]
        const [draggedBookmark] = newBookmarksOrder.splice(draggedIndex, 1)
        newBookmarksOrder.splice(targetIndex, 0, draggedBookmark)
        onReorderBookmarks(newBookmarksOrder)
      }
    }

    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
    dragCounter.current = 0
  }

  const handleBookmarkSelect = (bookmarkId: string) => {
    if (!isSelectionMode) {
      // Start selection mode
      setIsSelectionMode(true)
      setSelectedBookmarks([bookmarkId])
    } else {
      // Toggle selection
      setSelectedBookmarks((prev) =>
        prev.includes(bookmarkId) ? prev.filter((id) => id !== bookmarkId) : [...prev, bookmarkId],
      )
    }
  }

  const exitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedBookmarks([])
    setShowCreateCollection(false)
    setNewCollectionName("")
  }

  const handleCreateCollection = () => {
    if (newCollectionName.trim() && onAddCollection) {
      onAddCollection(newCollectionName.trim())

      // Move selected bookmarks to new collection
      selectedBookmarks.forEach((bookmarkId) => {
        onUpdateBookmark(bookmarkId, { collection: newCollectionName.trim() })
      })

      exitSelectionMode()
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      {!isSelectionMode ? (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Your MindBox</h2>
          <p className="text-gray-600 dark:text-gray-400">{bookmarks.length} saved bookmarks</p>
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white">{selectedBookmarks.length} selected</h2>
              <p className="text-gray-600 dark:text-gray-400">Long press to select bookmarks</p>
            </div>
            <button
              onClick={exitSelectionMode}
              className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Create Collection Actions */}
          {selectedBookmarks.length > 0 && (
            <div className="space-y-3">
              {!showCreateCollection ? (
                <Button
                  onClick={() => setShowCreateCollection(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl h-12 flex items-center gap-2 hover:from-blue-700 hover:to-cyan-600"
                >
                  <FolderPlus className="w-5 h-5" />
                  Create Collection from Selected
                </Button>
              ) : (
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-black dark:text-white">Create New Collection</h3>
                    <Input
                      placeholder="Collection name (e.g., AI Videos, Design Ideas)"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      className="h-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl"
                      onKeyPress={(e) => e.key === "Enter" && handleCreateCollection()}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateCollection}
                        className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600"
                        disabled={!newCollectionName.trim()}
                      >
                        Create & Move {selectedBookmarks.length} bookmarks
                      </Button>
                      <Button
                        onClick={() => setShowCreateCollection(false)}
                        variant="outline"
                        className="h-10 px-4 rounded-xl dark:border-gray-700 dark:text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bookmarks */}
      <div className="space-y-4">
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            collections={collections}
            isSelected={selectedBookmarks.includes(bookmark.id)}
            isSelectionMode={isSelectionMode}
            onSelect={handleBookmarkSelect}
            onUpdate={onUpdateBookmark}
            onDelete={onDeleteBookmark}
            isDragging={draggedItem === bookmark.id}
            isDragOver={dragOverItem === bookmark.id}
            onDragStart={(e) => handleDragStart(e, bookmark.id)}
            onDragOver={(e) => handleDragOver(e, bookmark.id)}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, bookmark.id)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </div>
  )
}
