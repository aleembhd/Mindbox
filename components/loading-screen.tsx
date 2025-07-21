"use client"

import { useEffect, useState } from "react"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl min-h-screen flex items-center justify-center">
        <div className="text-center px-8">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <img src="/logo.png" alt="MindBox Logo" className="w-full h-full object-contain drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text mb-2 tracking-tight">
              MindBox
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Your personal memory sanctuary</p>
          </div>

          {/* Loading Progress */}
          <div className="w-64 mx-auto">
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Loading your memories...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
