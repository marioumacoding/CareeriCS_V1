import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in:', { email, password });
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-6 md:p-12 overflow-x-hidden">
      <main className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4">
        
        {/* Left Section: Sign In Card */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
          <div 
            className="w-full max-w-md p-10 rounded-[45px] shadow-2xl border border-white/10"
            style={{ backgroundColor: "#2A2A2A" }}
          >
            <h1 className="text-3xl font-semibold text-center mb-10 tracking-tight font-[family-name:var(--font-nova-square)]">
              Sign In
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium opacity-80 ml-1">Email</label>
                <input
                  type="email"
                  placeholder="Value"
                  className="w-full px-4 py-3 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium opacity-80 ml-1">Password</label>
                <input
                  type="password"
                  placeholder="Value"
                  className="w-full px-4 py-3 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="text-xs mt-1 text-gray-400 text-left hover:text-white transition-colors">
                  Forgot your password? - <span className="underline decoration-gray-600">Reset Here</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 font-bold py-3 px-4 rounded-full transition-transform active:scale-95 text-black hover:opacity-90"
                  style={{ backgroundColor: "var(--primary-green)" }}
                >
                  Sign In
                </button>
                
                <span className="text-sm text-gray-500 font-medium px-1">or</span>

                <button
                  type="button"
                  className="flex-[2.5] flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold py-3 px-4 rounded-full hover:bg-gray-100 transition-all border border-gray-200"
                >
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" 
                    className="w-5 h-5" 
                    alt="Google" 
                  />
                  <span className="text-sm whitespace-nowrap">Sign in using Google</span>
                </button>
              </div>
            </form>

            <div className="mt-10 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account yet? - <button className="underline decoration-gray-600 hover:text-white">Register Here</button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Branding & AI Visual */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end relative">
          {/* Blue Background Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-10" />
          
          <h2 
            className="text-7xl md:text-9xl font-bold tracking-tighter text-gray-300/80 mb-4"
            style={{ fontFamily: "var(--font-nova-square), sans-serif" }}
          >
            CareerICS
          </h2>
          
          <div className="w-full max-w-lg">
            <img 
              src="https://img.freepik.com/free-photo/view-3d-robot-reading-book_23-2150849045.jpg" 
              alt="AI Robot Reading" 
              className="w-full h-auto object-contain mix-blend-lighten drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]"
            />
          </div>
        </div>

      </main>
    </div>
  );
}