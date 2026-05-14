'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/',            icon: '🌅', label: 'Morning Brief' },
  { href: '/checkin',     icon: '✅', label: 'Daily Check-In' },
  { href: '/scanner',     icon: '🔍', label: 'Signal Scanner' },
  { href: '/plan',        icon: '📋', label: 'Trade Plans' },
  { href: '/journal',     icon: '📓', label: 'Trade Journal' },
  { href: '/performance', icon: '📊', label: 'Performance' },
  { href: '/eod',         icon: '🌙', label: 'End-of-Day Review' },
  { href: '/strategy',    icon: '🧠', label: 'Strategy Builder' },
  { href: '/calculator',  icon: '⚖️',  label: 'Risk Calculator' },
  { href: '/settings',    icon: '⚙️',  label: 'Settings' },
]

export function SideNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-20">
      {/* Logo */}
      <div className="h-14 flex items-center px-6 border-b border-gray-800">
        <span className="text-blue-400 font-bold text-xl">⚡</span>
        <span className="ml-2 font-bold text-white text-sm">Signal Guard AI</span>
      </div>
      {/* Nav links */}
      <div className="flex-1 py-4 overflow-auto">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                active
                  ? 'bg-blue-900/40 text-blue-300 border-r-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
      {/* Bottom status */}
      <div className="px-6 py-4 border-t border-gray-800 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Mode</span>
          <span className="text-blue-400 font-semibold">PAPER</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Account</span>
          <span className="text-gray-300">$500 simulated</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Daily limit</span>
          <span className="text-gray-300">$25.00</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Trades today</span>
          <span className="text-gray-300">0 / 2</span>
        </div>
      </div>
    </nav>
  )
}
