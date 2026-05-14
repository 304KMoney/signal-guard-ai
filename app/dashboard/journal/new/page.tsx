"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewTradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    ticker: "",
    direction: "LONG",
    entryPrice: "",
    stopLoss: "",
    target: "",
    size: "",
    market: "STOCK",
    mode: "PAPER",
    notes: "",
    exitPrice: "",
    pnl: "",
    status: "OPEN",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to log trade");
      }

      router.push("/dashboard/journal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log trade");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "terminal-input text-sm";
  const labelClass = "block text-xs text-slate-500 mb-1 uppercase tracking-wide";
  const selectClass =
    "bg-[#0a0f1e] border border-slate-700 text-slate-200 focus:border-cyan-500 rounded-md px-3 py-2 w-full outline-none text-sm";

  // Calculate R:R in real-time
  const entry = parseFloat(form.entryPrice);
  const stop = parseFloat(form.stopLoss);
  const target = parseFloat(form.target);
  const rr =
    entry && stop && target
      ? Math.abs(target - entry) / Math.abs(entry - stop)
      : null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-200">Log a Trade</h1>
        <p className="text-sm text-slate-500 mt-1">
          Record every trade — paper or live. Discipline starts with documentation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="terminal-card p-5">
          <h2 className="font-semibold text-slate-300 mb-4 text-sm">
            Trade Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ticker *</label>
              <input
                className={inputClass}
                placeholder="e.g. AAPL, BTC-USD"
                value={form.ticker}
                onChange={(e) => set("ticker", e.target.value.toUpperCase())}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Market *</label>
              <select
                className={selectClass}
                value={form.market}
                onChange={(e) => set("market", e.target.value)}
              >
                <option value="STOCK">Stock</option>
                <option value="CRYPTO">Crypto</option>
                <option value="FUTURES">Futures</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Direction *</label>
              <select
                className={selectClass}
                value={form.direction}
                onChange={(e) => set("direction", e.target.value)}
              >
                <option value="LONG">Long (Buy)</option>
                <option value="SHORT">Short (Sell)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Mode *</label>
              <select
                className={selectClass}
                value={form.mode}
                onChange={(e) => set("mode", e.target.value)}
              >
                <option value="PAPER">Paper</option>
                <option value="LIVE">Live (Tiny)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Price levels */}
        <div className="terminal-card p-5">
          <h2 className="font-semibold text-slate-300 mb-4 text-sm">
            Price Levels
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Entry Price *</label>
              <input
                type="number"
                step="any"
                className={inputClass}
                placeholder="0.00"
                value={form.entryPrice}
                onChange={(e) => set("entryPrice", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Stop Loss *</label>
              <input
                type="number"
                step="any"
                className={`${inputClass} border-red-900/50 focus:border-red-400`}
                placeholder="0.00"
                value={form.stopLoss}
                onChange={(e) => set("stopLoss", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Target *</label>
              <input
                type="number"
                step="any"
                className={`${inputClass} border-green-900/50 focus:border-green-400`}
                placeholder="0.00"
                value={form.target}
                onChange={(e) => set("target", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Size (shares/units) *</label>
              <input
                type="number"
                step="any"
                className={inputClass}
                placeholder="0"
                value={form.size}
                onChange={(e) => set("size", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Live R:R display */}
          {rr !== null && (
            <div
              className={`mt-4 px-4 py-2 rounded border text-sm font-mono ${
                rr >= 2
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : rr >= 1.5
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              R:R Ratio: 1:{rr.toFixed(2)}{" "}
              {rr >= 1.5 ? "✓" : "⚠️ Below 1.5:1 minimum"}
            </div>
          )}
        </div>

        {/* Outcome (optional) */}
        <div className="terminal-card p-5">
          <h2 className="font-semibold text-slate-300 mb-4 text-sm">
            Outcome (Optional — fill after trade closes)
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select
                className={selectClass}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Exit Price</label>
              <input
                type="number"
                step="any"
                className={inputClass}
                placeholder="0.00"
                value={form.exitPrice}
                onChange={(e) => set("exitPrice", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>P&L ($)</label>
              <input
                type="number"
                step="any"
                className={inputClass}
                placeholder="e.g. 12.50 or -5.00"
                value={form.pnl}
                onChange={(e) => set("pnl", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="terminal-card p-5">
          <h2 className="font-semibold text-slate-300 mb-3 text-sm">Notes</h2>
          <textarea
            className={`${inputClass} h-24 resize-none`}
            placeholder="Why did you take this trade? What was the setup? How are you feeling?"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging Trade..." : "Log Trade →"}
          </button>
          <Link
            href="/dashboard/journal"
            className="btn-secondary text-sm px-6 py-3"
          >
            Cancel
          </Link>
        </div>

        <div className="disclaimer-banner text-center text-xs">
          ⚠️ Paper trades are simulated. Live trades require manual execution in Robinhood or your broker.
        </div>
      </form>
    </div>
  );
}
