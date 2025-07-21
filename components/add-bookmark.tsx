"use client"

import { useState } from "react"
import { Link, Plus, Loader2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Bookmark } from "@/app/page"

interface LinkPreviewData {
  title: string
  description: string
  image: string
  url: string
}

interface AddBookmarkProps {
  onAddBookmark: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void
  categories: string[]
  collections: string[]
  onAddCategory: (category: string) => void
}

export default function AddBookmark({ onAddBookmark, categories, collections, onAddCategory }: AddBookmarkProps) {
  const [url, setUrl] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCollection, setSelectedCollection] = useState("General")
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")

  const handleUrlChange = (value: string) => {
    setUrl(value)
    // Remove automatic fetching - only update URL state
  }

  const handleSubmitUrl = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    try {
      // Add protocol if missing
      const formattedUrl = url.startsWith("http") ? url : `https://${url}`

      const response = await fetch(
        `https://api.linkpreview.net/?key=f69c5ba5851cc913f4644f92a205ee24&q=${encodeURIComponent(formattedUrl)}`,
      )

      if (response.ok) {
        const data = await response.json()
        // Keep more words for description (15-20 words for 1-2 lines)
        const shortDescription = data.description
          ? data.description.split(" ").slice(0, 15).join(" ") + (data.description.split(" ").length > 15 ? "..." : "")
          : "Quick memory note"

        setPreview({
          title: data.title || "Untitled",
          description: shortDescription,
          image: data.image || "/placeholder.svg?height=200&width=400",
          url: formattedUrl,
        })
      } else {
        // Fallback preview
        const domain = new URL(formattedUrl).hostname
        setPreview({
          title: domain,
          description: "Memory bookmark for quick reference",
          image: "/placeholder.svg?height=200&width=400",
          url: formattedUrl,
        })
      }
    } catch (error) {
      console.error("Error fetching preview:", error)
      // Fallback preview
      setPreview({
        title: url,
        description: "Memory bookmark for quick reference",
        image: "/placeholder.svg?height=200&width=400",
        url: url,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim())
      setSelectedCategory(newCategory.trim())
      setNewCategory("")
      setShowAddCategory(false)
    }
  }

  const handleSaveBookmark = () => {
    if (preview && selectedCategory) {
      const domain = new URL(preview.url).hostname
      onAddBookmark({
        title: preview.title,
        description: preview.description,
        image: preview.image,
        domain,
        url: preview.url,
        category: selectedCategory,
        collection: selectedCollection,
        isFavorite: false,
        isArchived: false,
      })

      // Reset form
      setUrl("")
      setPreview(null)
      setSelectedCategory("")
      setSelectedCollection("General")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Add Bookmark</h2>
        <p className="text-gray-600 dark:text-gray-400">Paste a URL to save it to your MindBox</p>
      </div>

      {/* URL Input */}
      <div className="space-y-4">
        <div className="relative">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <Input
            type="url"
            placeholder="Paste your URL here..."
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmitUrl()}
            className="pl-10 pr-20 h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-black/20 focus:border-black/30 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          <button
            onClick={handleSubmitUrl}
            disabled={!url.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Fetching preview...</span>
          </div>
        )}

        {/* Preview Card - Full Size Preview */}
        {preview && !isLoading && (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
            {/* Preview Image - Full Size with Proper Aspect Ratio */}
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              <img
                src={preview.image || "/placeholder.svg"}
                alt={preview.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                }}
              />
            </div>

            {/* Content */}
            <div className="p-3 space-y-1">
              <h3 className="font-semibold text-black dark:text-white text-sm line-clamp-2">{preview.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">
                {preview.description}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">{new URL(preview.url).hostname}</p>
            </div>
          </div>
        )}
      </div>

      {/* Category Selection */}
      {preview && (
        <div className="space-y-4">
          <h3 className="font-semibold text-black dark:text-white">Select Category</h3>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-black"
                    : "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 text-black dark:text-white hover:border-blue-500/50 dark:hover:border-blue-400/50"
                }`}
              >
                <span className="text-sm font-medium">{category}</span>
              </button>
            ))}
          </div>

          {/* Add New Category */}
          {!showAddCategory ? (
            <button
              onClick={() => setShowAddCategory(true)}
              className="w-full p-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 dark:text-gray-400 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:text-black dark:hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add new category</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 h-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <Button
                onClick={handleAddCategory}
                className="h-10 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600"
              >
                Add
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Optional Collection Selection - Dropdown */}
      {preview && selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-black dark:text-white">Collection (Optional)</h3>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-colors text-black dark:text-white">
                <span className="text-sm">{selectedCollection}</span>
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {collections.map((collection) => (
                  <DropdownMenuItem
                    key={collection}
                    onClick={() => setSelectedCollection(collection)}
                    className={selectedCollection === collection ? "bg-gray-100" : ""}
                  >
                    {collection}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Save Button */}
      {preview && selectedCategory && (
        <Button
          onClick={handleSaveBookmark}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-600 font-medium"
        >
          Save Bookmark
        </Button>
      )}
    </div>
  )
}
