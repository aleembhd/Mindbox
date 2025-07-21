"use client"

import { useState } from "react"
import { Link, Plus, Loader2, ChevronDown, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Bookmark } from "@/app/page"
// Remove Firebase imports as saving will be handled in the parent component
// import { db } from "../firebase"
// import { collection, addDoc, serverTimestamp } from "firebase/firestore"

interface LinkPreviewData {
  title: string
  description: string
  image: string
  url: string
  isVideo?: boolean
  videoProvider?: 'youtube' | 'twitter' | 'linkedin' | 'vimeo' | 'other'
  videoId?: string
}

interface AddBookmarkProps {
  onAddBookmark: (bookmark: Omit<Bookmark, "id" | "createdAt">) => Promise<void>
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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isImageUpload, setIsImageUpload] = useState(false)

  const handleUrlChange = (value: string) => {
    setUrl(value)
    // Reset image upload mode if URL is entered
    if (value) {
      setIsImageUpload(false)
      setSelectedImage(null)
      setImagePreview(null)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Image selected:", file.name, file.type, file.size);
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Maximum size is 5MB.");
        return;
      }
      
      // Reset URL input if image is selected
      setUrl("");
      setIsImageUpload(true);
      setSelectedImage(file);
      
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Image preview created");
        setImagePreview(reader.result as string);
        // Create preview data for the image
        setPreview({
          title: file.name.split('.')[0] || "Image Bookmark",
          description: "Custom image bookmark",
          image: reader.result as string,
          url: ""  // No URL for image uploads
        });
      };
      reader.readAsDataURL(file);
    }
  }

  const handleSubmitUrl = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    try {
      // Add protocol if missing
      const formattedUrl = url.startsWith("http") ? url : `https://${url}`
      
      // Detect video URLs
      const isYouTube = formattedUrl.includes('youtube.com') || formattedUrl.includes('youtu.be')
      const isVimeo = formattedUrl.includes('vimeo.com')
      const isTwitterVideo = formattedUrl.includes('twitter.com/') && formattedUrl.includes('/video/')
      const isXVideo = formattedUrl.includes('x.com/') && formattedUrl.includes('/video/')
      const isLinkedInVideo = formattedUrl.includes('linkedin.com') && formattedUrl.includes('/video/')
      const isDirectVideo = formattedUrl.endsWith('.mp4') || formattedUrl.endsWith('.webm') || formattedUrl.endsWith('.ogg')
      
      const isVideo = isYouTube || isVimeo || isTwitterVideo || isXVideo || isLinkedInVideo || isDirectVideo
      
      // Determine video provider and extract video ID
      let videoProvider: 'youtube' | 'twitter' | 'linkedin' | 'vimeo' | 'other' | undefined
      let videoId: string | undefined
      
      if (isYouTube) {
        videoProvider = 'youtube'
        const ytRegExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
        const match = formattedUrl.match(ytRegExp)
        videoId = (match && match[7].length === 11) ? match[7] : undefined
      } else if (isVimeo) {
        videoProvider = 'vimeo'
        const vimeoRegExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/
        const match = formattedUrl.match(vimeoRegExp)
        videoId = match ? match[1] : undefined
      } else if (isTwitterVideo || isXVideo) {
        videoProvider = 'twitter'
      } else if (isLinkedInVideo) {
        videoProvider = 'linkedin'
      } else if (isDirectVideo) {
        videoProvider = 'other'
      }

      // Get link preview as usual
      const response = await fetch(
        `https://api.linkpreview.net/?key=f69c5ba5851cc913f4644f92a205ee24&q=${encodeURIComponent(formattedUrl)}`,
      )

      if (response.ok) {
        const data = await response.json()
        // Keep exactly 15 words for description
        const shortDescription = data.description
          ? data.description.split(" ").slice(0, 15).join(" ") + (data.description.split(" ").length > 15 ? "..." : "")
          : "Quick memory note"

        setPreview({
          title: data.title || "Untitled",
          description: shortDescription,
          image: data.image || "/placeholder.svg?height=200&width=400",
          url: formattedUrl,
          isVideo,
          videoProvider,
          videoId
        })
      } else {
        // Fallback preview
        const domain = new URL(formattedUrl).hostname
        setPreview({
          title: domain,
          description: "Memory bookmark for quick reference",
          image: "/placeholder.svg?height=200&width=400",
          url: formattedUrl,
          isVideo,
          videoProvider,
          videoId
        })
      }
    } catch (error) {
      console.error("Error fetching preview:", error)
      // Fallback preview
      setPreview({
        title: url,
        description: "Memory bookmark for quick reference",
        image: "/placeholder.svg?height=200&width=400",
        url: url
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

  const handleSaveBookmark = async () => {
    if (preview && (selectedCategory || isImageUpload)) {
      try {
        setSaveStatus("saving");
        
        // Create bookmark object with different properties based on source type
        let bookmarkData: Omit<Bookmark, "id" | "createdAt">;
        
        if (isImageUpload && selectedImage) {
          console.log("Preparing image bookmark with file:", selectedImage.name);
          // For image uploads
          bookmarkData = {
            title: preview.title || selectedImage.name.split('.')[0] || "Image Bookmark",
            description: "Custom image bookmark",
            image: imagePreview || "/placeholder.svg",
            domain: "Local Image",
            url: "",  // No URL for image uploads
            category: selectedCategory || "Images",
            collection: selectedCollection,
            isFavorite: false,
            isArchived: false,
            isCustomImage: true,  // Flag to identify custom uploads
            imageFile: selectedImage // Pass the file to the parent for upload
          };
        } else {
          // For URL bookmarks
          const domain = preview.url ? new URL(preview.url).hostname : "";
          bookmarkData = {
            title: preview.title,
            description: preview.description,
            image: preview.image,
            domain,
            url: preview.url,
            category: selectedCategory,
            collection: selectedCollection,
            isFavorite: false,
            isArchived: false,
            isVideo: preview.isVideo,
            videoProvider: preview.videoProvider,
            videoId: preview.videoId
          };
        }
        
        console.log("Sending bookmark data to parent:", bookmarkData);
        
        // Use parent component's handler to save bookmark
        await onAddBookmark(bookmarkData);
        
        setSaveStatus("success");
        
        // Reset form
        setUrl("");
        setPreview(null);
        setSelectedCategory("");
        setSelectedCollection("General");
        setSelectedImage(null);
        setImagePreview(null);
        setIsImageUpload(false);
        
        // Reset save status after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Error saving bookmark:", error);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Add Bookmark</h2>
        <p className="text-gray-600 dark:text-gray-400">Paste a URL or upload an image to save to your MindBox</p>
      </div>

      {/* Tab Selection for URL/Image */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setIsImageUpload(false)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !isImageUpload 
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Link className="w-5 h-5 inline-block mr-1" />
          URL
        </button>
        <button
          onClick={() => setIsImageUpload(true)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isImageUpload 
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <ImagePlus className="w-5 h-5 inline-block mr-1" />
          Image
        </button>
      </div>

      {/* URL Input */}
      {!isImageUpload && (
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
        </div>
      )}

      {/* Image Upload */}
      {isImageUpload && (
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="image-upload" className="cursor-pointer block">
              <div className="h-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-full rounded-2xl object-contain" />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8" />
                    <span>Click to upload image</span>
                    <span className="text-xs">JPG, PNG, GIF up to 5MB</span>
                  </>
                )}
              </div>
            </label>
            <input 
              type="file" 
              id="image-upload" 
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          
          {/* Image Title Input */}
          {selectedImage && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <Input
                type="text"
                placeholder="Enter title for your image"
                value={preview?.title || ""}
                onChange={(e) => setPreview(prev => prev ? {...prev, title: e.target.value} : null)}
                className="h-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl"
              />
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Fetching preview...</span>
        </div>
      )}

      {/* Preview Card - Full Size Preview */}
      {preview && !isLoading && !imagePreview && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
          {/* Preview Image - Full Size with Proper Aspect Ratio */}
          <div className="relative aspect-video w-full">
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
            {preview.url && (
              <p className="text-gray-400 dark:text-gray-500 text-xs">{new URL(preview.url).hostname}</p>
            )}
          </div>
        </div>
      )}

      {/* Category Selection */}
      {preview && !isImageUpload && (
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

      {/* Category Selection for Image Uploads */}
      {imagePreview && (
        <div className="space-y-4">
          <h3 className="font-semibold text-black dark:text-white">Select Category (Optional)</h3>

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
        </div>
      )}

      {/* Optional Collection Selection - Dropdown */}
      {preview && (selectedCategory || isImageUpload) && (
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
      {preview && (selectedCategory || isImageUpload) && (
        <Button
          onClick={handleSaveBookmark}
          disabled={saveStatus === "saving"}
          className={`w-full h-12 rounded-2xl font-medium ${
            saveStatus === "error"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : saveStatus === "success"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600"
          }`}
        >
          {saveStatus === "saving" ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </div>
          ) : saveStatus === "success" ? (
            "Saved Successfully!"
          ) : saveStatus === "error" ? (
            "Error Saving! Try Again"
          ) : (
            "Save Bookmark"
          )}
        </Button>
      )}
    </div>
  )
}
