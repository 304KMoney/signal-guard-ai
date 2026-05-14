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
  // Brand colors
  const navy = '#0B1F33'
  const teal = '#14B8A6'
  const slate = '#64748B'
  const gold = '#D4A017'
  const white = '#F8FAFC'

  return (
    <nav className="fixed top-0 left-0 h-full w-64 flex flex-col z-20"
      style={{ backgroundColor: navy, borderRight: '1px solid rgba(20,184,166,0.15)' }}>
      {/* SG Logo */}
      <div className="h-14 flex items-center px-5 gap-3"
        style={{ borderBottom: '1px solid rgba(20,184,166,0.12)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
          style={{ backgroundColor: teal, color: navy }}>
          SG
        </div>
        <div>
          <div className="font-bold text-sm leading-tight" style={{ color: white }}>Signal Guard</div>
          <div className="text-xs leading-tight" style={{ color: teal }}>AI</div>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 py-3 overflow-auto">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm transition-all"
              style={{
                color: active ? teal : slate,
                backgroundColor: active ? 'rgba(20,184,166,0.08)' : 'transparent',
                borderRight: active ? `2px solid ${teal}` : '2px solid transparent',
              }}
            >
              <span className="w-5 text-center text-base">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Bottom status panel */}
      <div className="px-5 py-4 space-y-2"
        style={{ borderTop: '1px solid rgba(20,184,166,0.12)' }}>
        <div className="text-xs font-bold mb-2" style={{ color: slate }}>SESSION STATUS</div>
        {[
          { label: 'Mode', value: 'PAPER', valueColor: teal },
          { label: 'Account', value: '$500 simulated', valueColor: white },
          { label: 'Daily limit', value: '$25.00', valueColor: white },
          { label: 'Trades today', value: '0 / 2', valueColor: white },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span style={{ color: slate }}>{item.label}</span>
            <span className="font-semibold" style={{ color: item.valueColor }}>{item.value}</span>
          </div>
        ))}
        {/* Grade A signal indicator */}
        <div className="mt-3 rounded-lg px-3 py-2 text-center"
          style={{ backgroundColor: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}>
          <div className="text-xs font-bold" style={{ color: gold }}>⭐ 0 Grade A Signals</div>
          <div className="text-xs mt-0.5" style={{ color: slate }}>Run scanner to find setups</div>
        </div>
      </div>
    </nav>
  )
}
