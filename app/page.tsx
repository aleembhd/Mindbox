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
import { db, storage } from "../firebase"
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, orderBy, query } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

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
  isCustomImage?: boolean
  imageFile?: File
  isVideo?: boolean
  videoId?: string
  videoProvider?: 'youtube' | 'twitter' | 'linkedin' | 'vimeo' | 'other'
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
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false)
  const [firebaseError, setFirebaseError] = useState("")
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

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

  // Load bookmarks from Firebase when app starts
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setIsFirebaseLoaded(false)
        const bookmarksQuery = query(collection(db, "bookmarks"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(bookmarksQuery);

        const fetchedBookmarks: Bookmark[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedBookmarks.push({
            id: doc.id,
            title: data.title || "Untitled",
            description: data.description || "",
            image: data.image || "/placeholder.svg",
            domain: data.domain || (data.url ? new URL(data.url).hostname : "Local Image"),
            url: data.url || "",
            category: data.category || "General",
            collection: data.collection || "General",
            isFavorite: data.isFavorite || false,
            isArchived: data.isArchived || false,
            createdAt: data.createdAt?.toDate() || new Date(),
            isCustomImage: data.isCustomImage || false
          });
        });

        setBookmarks(fetchedBookmarks);
        setIsFirebaseLoaded(true);
      } catch (error) {
        console.error("Error fetching bookmarks from Firebase:", error);
        setFirebaseError("Failed to load bookmarks. Please try refreshing the page.");
        setIsFirebaseLoaded(true);
      }
    };

    // Only fetch if not in welcome or loading screen
    if (!isLoading && !showWelcome) {
      fetchBookmarks();
    }
  }, [isLoading, showWelcome]);

  const addBookmark = async (bookmark: Omit<Bookmark, "id" | "createdAt">) => {
    try {
      console.log("Adding bookmark:", bookmark);
      console.log("Is custom image:", bookmark.isCustomImage);
      console.log("Has image file:", !!bookmark.imageFile);
      
      let imageUrl = bookmark.image;
      
      // Handle image upload if it's a custom image
      if (bookmark.isCustomImage && bookmark.imageFile) {
        console.log("Starting image upload process");
        try {
          const timestamp = Date.now();
          const fileName = bookmark.imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
          const storageRef = ref(storage, `images/${timestamp}_${fileName}`);
          
          console.log("Created storage reference:", storageRef);
          
          // Upload the image to Firebase Storage
          setUploadProgress(0);
          console.log("Starting upload");
          const uploadResult = await uploadBytes(storageRef, bookmark.imageFile);
          console.log("Upload complete:", uploadResult);
          setUploadProgress(50);
          
          // Get the download URL
          console.log("Getting download URL");
          imageUrl = await getDownloadURL(uploadResult.ref);
          console.log("Download URL:", imageUrl);
          setUploadProgress(100);
          
          // Reset progress after a delay
          setTimeout(() => setUploadProgress(null), 1000);
        } catch (uploadError: any) {
          console.error("Error during image upload:", uploadError);
          setUploadProgress(null);
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
      }
      
      console.log("Preparing bookmark data with image:", imageUrl);
      
      // Save to Firebase - prepare minimal data object
      const bookmarkData = {
        title: bookmark.title || "Untitled",
        description: bookmark.description?.split(" ").slice(0, 15).join(" ") + 
                    (bookmark.description?.split(" ").length > 15 ? "..." : "") || "Image bookmark",
        image: imageUrl,
        url: bookmark.url || "",
        domain: bookmark.domain || "Local Image",
        category: bookmark.category || "Images",
        collection: bookmark.collection || "General",
        isFavorite: bookmark.isFavorite || false,
        isArchived: bookmark.isArchived || false,
        isCustomImage: bookmark.isCustomImage || false,
        createdAt: serverTimestamp()
      };
      
      console.log("Saving to Firestore:", bookmarkData);
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, "bookmarks"), bookmarkData);
      console.log("Document saved with ID:", docRef.id);
      
      // Create a new bookmark with ID and current date for local state
    const newBookmark: Bookmark = {
      ...bookmark,
        id: docRef.id, // Use Firestore ID
        image: imageUrl, // Use uploaded image URL if applicable
      createdAt: new Date(),
      };
      
      // Update local state
      setBookmarks((prev) => [newBookmark, ...prev]);
      console.log("Local bookmark state updated");
      
      setActiveTab("home");
    } catch (error: any) {
      console.error("Error adding bookmark to Firebase:", error);
      alert(`Error saving bookmark: ${error.message}`);
    }
  };

  const updateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    // Update local state
    setBookmarks((prev) => prev.map((bookmark) => (bookmark.id === id ? { ...bookmark, ...updates } : bookmark)))
    
    try {
      // Update in Firebase - only if the bookmark exists in Firebase
      const docRef = doc(db, "bookmarks", id);
      
      // Prepare updates for Firebase - don't include special properties
      const { imageFile, ...updateData } = updates;
      
      // If updating description, ensure we only store what's needed
      if (updateData.description) {
        updateData.description = updateData.description.split(" ").slice(0, 15).join(" ") + 
                              (updateData.description.split(" ").length > 15 ? "..." : "");
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating bookmark in Firebase: ${error}`);
      // Silently fail - the local update will still work
    }
  }

  const deleteBookmark = async (id: string) => {
    // Update local state
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id))

    try {
      // Delete from Firebase
      const docRef = doc(db, "bookmarks", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting bookmark from Firebase: ${error}`);
      // Silently fail - the local deletion will still work
    }
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

        {/* Main Content with padding bottom for fixed navigation */}
        <div className="pb-24"> {/* Added padding bottom to make space for the fixed nav bar */}
          {firebaseError && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-lg mx-4 my-2 text-sm">
              {firebaseError}
            </div>
          )}

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

        {/* Floating Bottom Navigation */}
        <div className="fixed bottom-6 left-0 right-0 z-30 mx-auto max-w-[250px]">
          <div className="flex justify-around items-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 px-2 py-2">
              <button
                onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                  activeTab === "home"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Home className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab("add")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                  activeTab === "add"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Plus className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab("favorites")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                  activeTab === "favorites"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Star className="w-5 h-5" />
              </button>
          </div>
        </div>

        {/* Show upload progress if applicable */}
        {uploadProgress !== null && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80 text-center">
              <div className="mb-4">Uploading Image</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-500">{uploadProgress}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="mindbox-ui-theme">
      <MindBoxApp />
    </ThemeProvider>
  )
}
