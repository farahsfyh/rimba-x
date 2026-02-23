export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary via-[#1a2744] to-[#0c1220] relative overflow-hidden items-center justify-center p-12">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />

        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-8 shadow-2xl shadow-primary/30">
            R
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Rimba<span className="text-primary">X</span> AI Tutor
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Transform your study materials into personalized, conversational AI tutoring sessions — completely free.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold text-white">5</p>
              <p className="text-xs text-gray-500 mt-1">Languages</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Free</p>
              <p className="text-xs text-gray-500 mt-1">Forever</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">AI</p>
              <p className="text-xs text-gray-500 mt-1">Powered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12">
        {children}
      </div>
    </div>
  )
}
