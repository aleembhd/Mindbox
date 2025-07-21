"use client"

import { useState } from "react"
import { Plus, Lock, Eye, EyeOff, Copy, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Password } from "@/app/page"

interface PasswordManagerProps {
  passwords: Password[]
  onAddPassword: (password: Omit<Password, "id" | "createdAt">) => void
  onUpdatePassword: (id: string, updates: Partial<Password>) => void
  onDeletePassword: (id: string) => void
}

export default function PasswordManager({
  passwords,
  onAddPassword,
  onUpdatePassword,
  onDeletePassword,
}: PasswordManagerProps) {
  const [showAddPassword, setShowAddPassword] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())

  const handleAddPassword = () => {
    if (newTitle.trim() && newPassword.trim()) {
      onAddPassword({
        title: newTitle.trim(),
        password: newPassword.trim(),
      })

      // Reset form
      setNewTitle("")
      setNewPassword("")
      setShowAddPassword(false)
    }
  }

  const togglePasswordVisibility = (passwordId: string) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(passwordId)) {
        newSet.delete(passwordId)
      } else {
        newSet.add(passwordId)
      }
      return newSet
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const maskPassword = (password: string) => {
    return "•".repeat(password.length)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Password Manager</h2>
        <p className="text-gray-600 dark:text-gray-400">Securely store and manage your passwords</p>
      </div>

      {/* Add New Password */}
      {!showAddPassword ? (
        <button
          onClick={() => setShowAddPassword(true)}
          className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:text-black dark:hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add New Password</span>
        </button>
      ) : (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="space-y-4">
            <h3 className="font-semibold text-black dark:text-white">Add New Password</h3>

            <div className="space-y-3">
              <Input
                placeholder="Title (e.g., Gmail, Facebook, Netflix)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />

              <Input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                onKeyPress={(e) => e.key === "Enter" && handleAddPassword()}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddPassword}
                className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600"
                disabled={!newTitle.trim() || !newPassword.trim()}
              >
                Save Password
              </Button>
              <Button
                onClick={() => {
                  setShowAddPassword(false)
                  setNewTitle("")
                  setNewPassword("")
                }}
                variant="outline"
                className="h-10 px-4 rounded-xl dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Cards Grid - Side by Side like Collections */}
      {passwords.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {passwords.map((password) => (
            <div
              key={password.id}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Header with Lock Icon */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-black dark:text-white text-sm line-clamp-1 flex-1">
                    {password.title}
                  </h3>
                </div>

                {/* Password Display */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono flex-1">
                      {visiblePasswords.has(password.id) ? password.password : maskPassword(password.password)}
                    </span>
                    <button
                      onClick={() => togglePasswordVisibility(password.id)}
                      className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                      title={visiblePasswords.has(password.id) ? "Hide password" : "Show password"}
                    >
                      {visiblePasswords.has(password.id) ? (
                        <EyeOff className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <Eye className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                    <button
                      onClick={() => copyToClipboard(password.password)}
                      className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                      title="Copy password"
                    >
                      <Copy className="w-3 h-3 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => console.log("Edit password:", password.id)}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                        title="Edit password"
                      >
                        <Edit className="w-3 h-3 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white" />
                      </button>

                      <button
                        onClick={() => onDeletePassword(password.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Delete password"
                      >
                        <Trash2 className="w-3 h-3 text-gray-400 dark:text-gray-500 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Added {password.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {passwords.length === 0 && !showAddPassword && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">No passwords saved</h3>
          <p className="text-gray-600 dark:text-gray-400">Start by adding your first password</p>
        </div>
      )}
    </div>
  )
}
