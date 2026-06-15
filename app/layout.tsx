import Sidebar from "@/app/Sidebar";
import "./globals.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#f4f8fb] text-gray-800 font-['Plus_Jakarta_Sans'] flex antialiased">
          <Sidebar />

          <div className="flex-1 pl-64 flex flex-col min-h-screen">
            {/* Header */}
            <header className="h-[62px] bg-white/95 backdrop-blur-md border-b border-gray-200 fixed top-0 left-64 right-0 z-40 flex items-center justify-between px-7 shadow-sm">
              <div className="text-xs font-medium text-gray-500">
                Management
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-[14px] py-[6px] w-60 focus-within:border-[#006aa0] focus-within:bg-white transition-all">
                  <span className="text-xs text-gray-400">🔍</span>

                  <input
                    type="text"
                    placeholder="Search name or ID…"
                    className="bg-transparent border-none outline-none text-xs text-gray-800 w-full placeholder:text-gray-400"
                  />
                </div>

                <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-600 cursor-pointer relative hover:bg-gray-100 transition-colors">
                  🔔
                  <span className="absolute top-[2px] right-[2px] w-[8px] h-[8px] bg-red-500 rounded-full border border-white" />
                </div>

                <div className="w-9 h-9 rounded-full bg-[#006aa0] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  A
                </div>
              </div>
            </header>

            <main className="pt-[86px] p-7 flex-1 flex flex-col gap-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}