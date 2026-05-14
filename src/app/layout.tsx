import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SideNav } from '@/components/SideNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Signal Guard AI',
  description: 'Personal AI trading discipline and signal system — educational use only',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-950 text-gray-100">
          {/* Sidebar */}
          <SideNav />
          {/* Main content */}
          <div className="flex-1 flex flex-col ml-64">
            {/* Top bar */}
            <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
              <div className="flex items-center gap-3">
                <span className="text-blue-400 font-bold text-lg">⚡ Signal Guard AI</span>
                <span className="text-gray-500 text-sm">|</span>
                <span className="text-xs text-gray-400">Educational use only · Not financial advice</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-blue-900 text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                  📄 PAPER MODE
                </span>
                <span className="text-gray-400 text-sm">$500 simulated</span>
              </div>
            </header>
            {/* Page content */}
            <main className="flex-1 pt-14 p-6 overflow-auto">
              {children}
            </main>
            {/* Footer disclaimer */}
            <footer className="bg-gray-900 border-t border-gray-800 px-6 py-3 text-center">
              <p className="text-xs text-gray-500">
                ⚠️ Signal Guard AI is for personal educational use only. Not financial advice. No trades are placed automatically.
                All trading involves substantial risk of loss. Never risk money you cannot afford to lose.
              </p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
}
