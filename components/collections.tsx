"use client"

import { useState } from "react"
import { Plus, FolderOpen, Trash2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Bookmark } from "@/app/page"
import BookmarkCard from "@/components/bookmark-card"

interface CollectionsProps {
  bookmarks: Bookmark[]
  collections: string[]
  onAddCollection: (collection: string) => void
  onDeleteCollection: (collection: string) => void
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => void
  onDeleteBookmark: (id: string) => void
  onReorderBookmarks: (newOrder: Bookmark[]) => void
}

export default function Collections({
  bookmarks,
  collections,
  onAddCollection,
  onDeleteCollection,
  onUpdateBookmark,
  onDeleteBookmark,
  onReorderBookmarks,
}: CollectionsProps) {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [showAddCollection, setShowAddCollection] = useState(false)
  const [newCollection, setNewCollection] = useState("")

  const handleAddCollection = () => {
    if (newCollection.trim()) {
      onAddCollection(newCollection.trim())
      setNewCollection("")
      setShowAddCollection(false)
    }
  }

  const getBookmarksByCollection = (collection: string) => {
    return bookmarks.filter((bookmark) => bookmark.collection === collection && !bookmark.isArchived)
  }

  if (selectedCollection) {
    const collectionBookmarks = getBookmarksByCollection(selectedCollection)

    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setSelectedCollection(null)}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white">{selectedCollection}</h2>
            <p className="text-gray-600 dark:text-gray-400">{collectionBookmarks.length} bookmarks</p>
          </div>
        </div>

        {collectionBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mb-4">
              <FolderOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Collection is empty</h3>
            <p className="text-gray-600 dark:text-gray-400">Add bookmarks to this collection from the main view</p>
          </div>
        ) : (
          <div className="space-y-4">
            {collectionBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                collections={collections}
                onUpdate={onUpdateBookmark}
                onDelete={onDeleteBookmark}
                isDragging={false}
                isDragOver={false}
                onDragStart={() => {}}
                onDragOver={() => {}}
                onDragEnter={() => {}}
                onDragLeave={() => {}}
                onDrop={() => {}}
                onDragEnd={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Collections</h2>
        <p className="text-gray-600 dark:text-gray-400">Organize your bookmarks into folders</p>
      </div>

      {/* Collections Grid - Side by Side */}
      <div className="grid grid-cols-2 gap-3">
        {collections.map((collection) => {
          const bookmarkCount = getBookmarksByCollection(collection).length

          return (
            <div
              key={collection}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
            >
              <button onClick={() => setSelectedCollection(collection)} className="w-full text-left">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-black dark:text-white text-sm line-clamp-1">{collection}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{bookmarkCount} items</p>
                  </div>
                </div>
              </button>

              {collection !== "General" && (
                <button
                  onClick={() => onDeleteCollection(collection)}
                  className="w-full mt-2 p-1 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete collection"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors mx-auto" />
                </button>
              )}
            </div>
          )
        })}

        {/* Add New Collection */}
        {!showAddCollection ? (
          <button
            onClick={() => setShowAddCollection(true)}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-dashed border-gray-300 text-gray-600 dark:text-gray-400 hover:border-black/30 hover:text-black dark:hover:text-white transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[120px]"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium text-center">Create New</span>
          </button>
        ) : (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <div className="space-y-3">
              <Input
                placeholder="Collection name"
                value={newCollection}
                onChange={(e) => setNewCollection(e.target.value)}
                className="h-8 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-lg"
                onKeyPress={(e) => e.key === "Enter" && handleAddCollection()}
              />
              <div className="flex gap-1">
                <Button
                  onClick={handleAddCollection}
                  className="flex-1 h-8 text-xs bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600"
                  disabled={!newCollection.trim()}
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setShowAddCollection(false)
                    setNewCollection("")
                  }}
                  variant="outline"
                  className="h-8 px-2 text-xs rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
