export default function WelcomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl min-h-screen flex items-center justify-center">
        <div className="text-center px-8">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <img src="/logo.png" alt="MindBox Logo" className="w-full h-full object-contain drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text mb-2 tracking-tight">
              MindBox
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Your personal memory sanctuary</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
