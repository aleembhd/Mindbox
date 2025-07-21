"use client"

import { useState, useEffect } from "react"
import { Home, Plus, Star, FolderOpen, Lock } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import LoadingScreen from "@/components/loading-screen"
import WelcomeScreen from "@/components/welcome-screen"
import AddBookmark from "@/components/add-bookmark"
import Dashboard from "@/components/dashboard"
import Collections from "@/components/collections"
import PasswordManager from "@/components/password-manager"
import EmptyState from "@/components/empty-state"
import { ThemeToggle } from "@/components/theme-toggle"

export interface Bookmark {
  id: string
  title: string
  description: string
  image: string
  domain: string
  url: string
  category: string
  collection: string
  isFavorite: boolean
  isArchived: boolean
  createdAt: Date
}

export interface Password {
  id: string
  title: string
  password: string
  createdAt: Date
}

function MindBoxApp() {
  const [isLoading, setIsLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)
  const [activeTab, setActiveTab] = useState<"home" | "add" | "favorites">("home")
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [passwords, setPasswords] = useState<Password[]>([])
  const [categories, setCategories] = useState<string[]>(["YouTube", "Twitter", "Instagram", "LinkedIn"])
  const [collections, setCollections] = useState<string[]>(["General"])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Show loading screen first
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
      // Then show welcome screen briefly
      const welcomeTimer = setTimeout(() => {
        setShowWelcome(false)
      }, 1500)
      return () => clearTimeout(welcomeTimer)
    }, 2500)
    return () => clearTimeout(loadingTimer)
  }, [])

  const addBookmark = (bookmark: Omit<Bookmark, "id" | "createdAt">) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setBookmarks((prev) => [newBookmark, ...prev])
    setActiveTab("home")
  }

  const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
    setBookmarks((prev) => prev.map((bookmark) => (bookmark.id === id ? { ...bookmark, ...updates } : bookmark)))
  }

  const deleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id))
  }

  const reorderBookmarks = (newOrder: Bookmark[]) => {
    setBookmarks(newOrder)
  }

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories((prev) => [...prev, category])
    }
  }

  const addCollection = (collection: string) => {
    if (!collections.includes(collection)) {
      setCollections((prev) => [...prev, collection])
    }
  }

  const deleteCollection = (collection: string) => {
    if (collection !== "General") {
      // Move all bookmarks from deleted collection to General
      setBookmarks((prev) =>
        prev.map((bookmark) =>
          bookmark.collection === collection ? { ...bookmark, collection: "General" } : bookmark,
        ),
      )
      setCollections((prev) => prev.filter((c) => c !== collection))
    }
  }

  const addPassword = (password: Omit<Password, "id" | "createdAt">) => {
    const newPassword: Password = {
      ...password,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setPasswords((prev) => [newPassword, ...prev])
  }

  const updatePassword = (id: string, updates: Partial<Password>) => {
    setPasswords((prev) => prev.map((password) => (password.id === id ? { ...password, ...updates } : password)))
  }

  const deletePassword = (id: string) => {
    setPasswords((prev) => prev.filter((password) => password.id !== id))
  }

  const getFilteredBookmarks = () => {
    switch (activeTab) {
      case "favorites":
        return bookmarks.filter((bookmark) => bookmark.isFavorite && !bookmark.isArchived)
      case "home":
      default:
        return bookmarks.filter((bookmark) => !bookmark.isArchived)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (showWelcome) {
    return <WelcomeScreen />
  }

  const filteredBookmarks = getFilteredBookmarks()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl min-h-screen relative">
        {/* Header with Hamburger Menu and Theme Toggle */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                  <div
                    className={`h-0.5 bg-black dark:bg-white transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1.5" : "w-5"}`}
                  ></div>
                  <div
                    className={`h-0.5 bg-black dark:bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : "w-5"}`}
                  ></div>
                  <div
                    className={`h-0.5 bg-black dark:bg-white transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : "w-5"}`}
                  ></div>
                </div>
              </button>
              <img src="/logo.png" alt="MindBox" className="w-8 h-8 object-contain" />
              <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text">
                MindBox
              </h1>
            </div>
            <ThemeToggle />
          </div>

          {/* Hamburger Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className="px-6 py-4 space-y-2">
                <button
                  onClick={() => {
                    setActiveTab("collections")
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <FolderOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <span className="font-medium text-black dark:text-white">Collections</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Organize bookmarks into folders</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("security")
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <span className="font-medium text-black dark:text-white">Security</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your passwords securely</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="pb-24">
          {activeTab === "add" && (
            <AddBookmark
              onAddBookmark={addBookmark}
              categories={categories}
              collections={collections}
              onAddCategory={addCategory}
            />
          )}

          {activeTab === "collections" && (
            <Collections
              bookmarks={bookmarks}
              collections={collections}
              onAddCollection={addCollection}
              onDeleteCollection={deleteCollection}
              onUpdateBookmark={updateBookmark}
              onDeleteBookmark={deleteBookmark}
              onReorderBookmarks={reorderBookmarks}
            />
          )}

          {activeTab === "security" && (
            <PasswordManager
              passwords={passwords}
              onAddPassword={addPassword}
              onUpdatePassword={updatePassword}
              onDeletePassword={deletePassword}
            />
          )}

          {(activeTab === "home" || activeTab === "favorites") && (
            <>
              {filteredBookmarks.length === 0 ? (
                <EmptyState activeTab={activeTab} onAddBookmark={() => setActiveTab("add")} />
              ) : (
                <Dashboard
                  bookmarks={filteredBookmarks}
                  collections={collections}
                  onUpdateBookmark={updateBookmark}
                  onDeleteBookmark={deleteBookmark}
                  onReorderBookmarks={reorderBookmarks}
                  onAddCollection={addCollection}
                />
              )}
            </>
          )}
        </div>

        {/* Fixed Bottom Navigation - Simplified */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 px-4 py-3 shadow-lg">
            <div className="flex justify-around items-center">
              <button
                onClick={() => setActiveTab("home")}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                  activeTab === "home"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-xs font-medium">Home</span>
              </button>

              <button
                onClick={() => setActiveTab("add")}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                  activeTab === "add"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs font-medium">Add</span>
              </button>

              <button
                onClick={() => setActiveTab("favorites")}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                  activeTab === "favorites"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Star className="w-5 h-5" />
                <span className="text-xs font-medium">Favorites</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="mindbox-ui-theme">
      <MindBoxApp />
    </ThemeProvider>
  )
}
