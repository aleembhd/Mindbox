"use client"

import { BookOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  activeTab: "home" | "favorites"
  onAddBookmark: () => void
}

export default function EmptyState({ activeTab, onAddBookmark }: EmptyStateProps) {
  const getMessage = () => {
    switch (activeTab) {
      case "favorites":
        return {
          title: "No favorites yet",
          description: "Star your important bookmarks to find them here",
        }
      default:
        return {
          title: "Your MindBox is empty",
          description: "Start by adding your first link",
        }
    }
  }

  const message = getMessage()

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-8 text-center">
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mb-6">
        <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>

      <h3 className="text-xl font-semibold text-black dark:text-white mb-2">{message.title}</h3>

      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm leading-relaxed">{message.description}</p>

      {activeTab === "home" && (
        <Button
          onClick={onAddBookmark}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 rounded-2xl px-8 py-3 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Bookmark
        </Button>
      )}
    </div>
  )
}
