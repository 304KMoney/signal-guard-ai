"use client";

import { useState } from "react";

interface Settings {
  accountSize: number;
  maxDailyLossPct: number;
  maxPositionSizePct: number;
  tradingMode: string;
  anthropicApiKey: string;
}

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [form, setForm] = useState(settings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const set = (k: string, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "terminal-input text-sm";
  const labelClass = "block text-xs text-slate-500 mb-1 uppercase tracking-wide";
  const selectClass =
    "bg-[#0a0f1e] border border-slate-700 text-slate-200 focus:border-cyan-500 rounded-md px-3 py-2 w-full outline-none text-sm";

  const maxRiskDollars = (form.accountSize * (form.maxDailyLossPct / 100)).toFixed(2);
  const maxPositionDollars = (form.accountSize * (form.maxPositionSizePct / 100)).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Trading Mode — most prominent */}
      <div className="terminal-card p-5">
        <h2 className="font-semibold text-slate-200 mb-4">Trading Mode</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              value: "PAPER",
              label: "Paper Trading",
              desc: "Simulated — no real money",
              color: "border-blue-500/50 bg-blue-500/10 text-blue-400",
            },
            {
              value: "LIVE",
              label: "Live (Tiny)",
              desc: "Real money — be careful",
              color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
            },
          ].map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => set("tradingMode", mode.value)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                form.tradingMode === mode.value
                  ? mode.color
                  : "border-slate-700 bg-[#0a0f1e] text-slate-400 hover:border-slate-600"
              }`}
            >
              <p className="font-semibold text-sm">{mode.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{mode.desc}</p>
            </button>
          ))}
        </div>
        {form.tradingMode === "LIVE" && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded">
            ⚠️ Live mode: real money is at risk. Signal Guard AI never places trades automatically.
            All executions are manual.
          </div>
        )}
      </div>

      {/* Account & Risk */}
      <div className="terminal-card p-5">
        <h2 className="font-semibold text-slate-200 mb-4">
          Account & Risk Preferences
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Account Size ($) *</label>
            <input
              type="number"
              step="0.01"
              min="10"
              className={inputClass}
              value={form.accountSize}
              onChange={(e) => set("accountSize", parseFloat(e.target.value))}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Max Daily Loss (% of account)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="10"
              className={inputClass}
              value={form.maxDailyLossPct}
              onChange={(e) => set("maxDailyLossPct", parseFloat(e.target.value))}
            />
            <p className="text-xs text-slate-600 mt-1">
              = ${maxRiskDollars} max daily loss with current account size
            </p>
          </div>

          <div>
            <label className={labelClass}>
              Max Position Size (% of account)
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="50"
              className={inputClass}
              value={form.maxPositionSizePct}
              onChange={(e) =>
                set("maxPositionSizePct", parseFloat(e.target.value))
              }
            />
            <p className="text-xs text-slate-600 mt-1">
              = ${maxPositionDollars} max per position with current account size
            </p>
          </div>
        </div>
      </div>

      {/* AI API Key */}
      <div className="terminal-card p-5">
        <h2 className="font-semibold text-slate-200 mb-2">
          Anthropic API Key
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Required for AI morning briefs, signal analysis, and EOD reviews.
          Get a key at{" "}
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            console.anthropic.com
          </a>
        </p>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            className={inputClass}
            placeholder="sk-ant-..."
            value={form.anthropicApiKey}
            onChange={(e) => set("anthropicApiKey", e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Stored encrypted in your account. Falls back to server key if empty.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-md">
          ✅ Settings saved successfully
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 text-sm disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>

      <div className="disclaimer-banner text-center text-xs">
        ⚠️ Signal Guard AI does not place trades. All executions are manual. Adjust risk settings
        carefully.
      </div>
    </form>
  );
}
