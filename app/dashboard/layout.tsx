import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/dashboard/morning-brief", icon: "🌅", label: "Morning Brief" },
  { href: "/dashboard/scanner", icon: "🔍", label: "Signal Scanner" },
  { href: "/dashboard/journal", icon: "📓", label: "Trade Journal" },
  { href: "/dashboard/performance", icon: "📈", label: "Performance" },
  { href: "/dashboard/strategies", icon: "🧠", label: "Strategies" },
  { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex h-screen bg-[#0a0f1e] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0f172a] border-r border-slate-800 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">⚡</span>
            <span className="font-bold text-sm tracking-tight text-slate-200">
              Signal Guard AI
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors group"
                >
                  <span className="w-4 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User + mode */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
            <div className="min-w-0">
              <p className="text-xs text-slate-300 truncate">
                {user.firstName || user.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-xs text-slate-600">Paper Mode</p>
            </div>
          </div>
          <div className="disclaimer-banner text-center">
            Not financial advice
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
