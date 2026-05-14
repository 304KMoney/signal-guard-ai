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
        <div className="flex min-h-screen text-[#F8FAFC]" style={{ backgroundColor: '#0B1F33' }}>
          {/* Sidebar */}
          <SideNav />
          {/* Main content */}
          <div className="flex-1 flex flex-col ml-64">
            {/* Top bar — Deep Navy with teal accent */}
            <header className="h-14 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10"
              style={{ backgroundColor: '#0B1F33', borderBottom: '1px solid rgba(20,184,166,0.15)' }}>
              <div className="flex items-center gap-3">
                {/* SG Monogram */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black"
                    style={{ backgroundColor: '#14B8A6', color: '#0B1F33' }}>
                    SG
                  </div>
                  <span className="font-bold text-base tracking-tight" style={{ color: '#F8FAFC' }}>
                    Signal Guard <span style={{ color: '#14B8A6' }}>AI</span>
                  </span>
                </div>
                <span className="text-xs" style={{ color: '#64748B' }}>
                  Risk-first intelligence · Not financial advice
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(20,184,166,0.12)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.3)' }}>
                  📄 PAPER MODE
                </span>
                <span className="text-sm" style={{ color: '#64748B' }}>$500 simulated</span>
              </div>
            </header>
            {/* Page content */}
            <main className="flex-1 pt-14 p-6 overflow-auto">
              {children}
            </main>
            {/* Footer disclaimer */}
            <footer className="px-6 py-3 text-center" style={{ borderTop: '1px solid rgba(20,184,166,0.1)' }}>
              <p className="text-xs" style={{ color: '#64748B' }}>
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
