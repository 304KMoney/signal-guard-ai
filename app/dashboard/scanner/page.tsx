import Link from "next/link";
import { getSignalsWithLivePrices, getScoreBadgeColor } from "@/lib/mock-signals";
import { getScoreBadge } from "@/lib/utils";

export const revalidate = 60; // Revalidate every 60s for live prices

export default async function ScannerPage() {
  const signals = await getSignalsWithLivePrices();
  const qualifiedSignals = signals.filter((s) => s.score >= 70).slice(0, 3);
  const belowThreshold = signals.filter((s) => s.score < 70);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-200">🔍 Signal Scanner</h1>
        <p className="text-sm text-slate-500 mt-1">
          Only signals scoring ≥ 70 are shown. Maximum 3 setups per day.
        </p>
      </div>

      {/* Score legend */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: "A Grade (85+)", color: "text-green-400 bg-green-500/10 border-green-500/30" },
          { label: "B Grade (70–84)", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
          { label: "Below Min (< 70)", color: "text-slate-500 bg-slate-800 border-slate-700" },
        ].map((item) => (
          <div
            key={item.label}
            className={`text-xs px-3 py-1 rounded-full border font-mono ${item.color}`}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Qualified signals */}
      {qualifiedSignals.length > 0 ? (
        <div className="terminal-card overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-slate-800 bg-cyan-500/5">
            <h2 className="text-sm font-semibold text-cyan-400">
              ✅ Active Signals ({qualifiedSignals.length}/3 max)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500">
                  <th className="px-5 py-3 text-left font-medium">Ticker</th>
                  <th className="px-5 py-3 text-left font-medium">Market</th>
                  <th className="px-5 py-3 text-left font-medium">Signal Type</th>
                  <th className="px-5 py-3 text-center font-medium">Score</th>
                  <th className="px-5 py-3 text-right font-medium">Entry Zone</th>
                  <th className="px-5 py-3 text-right font-medium">Stop</th>
                  <th className="px-5 py-3 text-right font-medium">TP1</th>
                  <th className="px-5 py-3 text-right font-medium">TP2</th>
                  <th className="px-5 py-3 text-center font-medium">R:R</th>
                  <th className="px-5 py-3 text-center font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {qualifiedSignals.map((signal, idx) => {
                  const badge = getScoreBadge(signal.score);
                  const price = (v: number) =>
                    v >= 1000
                      ? `$${v.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
                      : `$${v.toFixed(2)}`;

                  return (
                    <tr
                      key={signal.id}
                      className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                        idx === 0 ? "bg-cyan-500/3" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {idx === 0 && (
                            <span className="text-xs text-yellow-400">★</span>
                          )}
                          <span className="font-mono font-semibold text-slate-200">
                            {signal.ticker}
                          </span>
                          {signal.currentPrice && (
                            <span className="text-xs text-slate-600 font-mono">
                              @ {price(signal.currentPrice)}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            signal.direction === "LONG"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {signal.direction}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {signal.market}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400 max-w-[180px] truncate">
                        {signal.signalType}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`font-mono font-bold text-sm px-2.5 py-1 rounded border ${badge.color}`}
                        >
                          {signal.score}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-slate-300">
                        {price(signal.entryLow)}–{price(signal.entryHigh)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-red-400">
                        {price(signal.stopLoss)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-green-400">
                        {price(signal.tp1)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-green-400">
                        {signal.tp2 ? price(signal.tp2) : "—"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`font-mono text-sm font-semibold ${
                            signal.rrRatio >= 2
                              ? "text-green-400"
                              : signal.rrRatio >= 1.5
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {signal.rrRatio}x
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link
                          href={`/dashboard/trade-plan/${signal.id}`}
                          className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-400/30 px-3 py-1.5 rounded transition-colors hover:bg-cyan-400/5"
                        >
                          View Plan
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="terminal-card p-12 text-center mb-6">
          <div className="text-4xl mb-3">🚫</div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            No Qualified Signals Today
          </h3>
          <p className="text-sm text-slate-500">
            No setups scored ≥ 70 today. This may be a no-trade day.
            Patience protects capital.
          </p>
        </div>
      )}

      {/* Below threshold */}
      {belowThreshold.length > 0 && (
        <div className="terminal-card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/50">
            <h2 className="text-sm font-semibold text-slate-500">
              ⚠️ Below Minimum Score (Not Tradeable)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-600">
                  <th className="px-5 py-3 text-left font-medium">Ticker</th>
                  <th className="px-5 py-3 text-left font-medium">Market</th>
                  <th className="px-5 py-3 text-center font-medium">Score</th>
                  <th className="px-5 py-3 text-center font-medium">R:R</th>
                  <th className="px-5 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {belowThreshold.map((signal) => (
                  <tr
                    key={signal.id}
                    className="border-b border-slate-800/30 opacity-50"
                  >
                    <td className="px-5 py-3 font-mono text-sm text-slate-500">
                      {signal.ticker}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">
                      {signal.market}
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-sm text-slate-600">
                      {signal.score}
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-sm text-slate-600">
                      {signal.rrRatio}x
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded">
                        BELOW MIN
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="disclaimer-banner mt-6 text-center">
        ⚠️ AI-generated signals only. Not financial advice. Always do your own analysis.
        All trades require manual approval.
      </div>
    </div>
  );
}
