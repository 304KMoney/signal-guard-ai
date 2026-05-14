"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewStrategyForm() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    entryRules: "",
    exitRules: "",
    whenNotToTrade: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const parseLines = (text: string) =>
      text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

    try {
      const res = await fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          rules: {
            entryRules: parseLines(form.entryRules),
            exitRules: parseLines(form.exitRules),
            whenNotToTrade: parseLines(form.whenNotToTrade),
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save strategy");
      }

      setForm({ name: "", description: "", entryRules: "", exitRules: "", whenNotToTrade: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "terminal-input text-sm";
  const labelClass = "block text-xs text-slate-500 mb-1 uppercase tracking-wide";
  const taClass = "terminal-input text-sm h-24 resize-none";

  return (
    <div className="terminal-card p-5">
      <h2 className="font-semibold text-slate-200 mb-4">
        + Create Strategy
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Convert your trading ideas into objective, testable rules. Be specific — vague rules
        lead to inconsistent execution.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Strategy Name *</label>
          <input
            className={inputClass}
            placeholder="e.g. VWAP Reclaim Pullback"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Description *</label>
          <input
            className={inputClass}
            placeholder="Brief description of the setup"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Entry Rules (one per line) *</label>
          <textarea
            className={taClass}
            placeholder={"Price reclaims VWAP on 5min chart\nRSI between 40-60 (not overbought)\nVolume above 1.2x 20-day average"}
            value={form.entryRules}
            onChange={(e) => set("entryRules", e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Exit Rules (one per line)</label>
          <textarea
            className={taClass}
            placeholder={"Exit at TP1 (50% position)\nExit at TP2 (remaining 50%)\nStop loss hit = full exit"}
            value={form.exitRules}
            onChange={(e) => set("exitRules", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>When NOT to Trade (one per line)</label>
          <textarea
            className={taClass}
            placeholder={"Within 30 min of major news event\nVIX above 25\nFirst 15 min of market open"}
            value={form.whenNotToTrade}
            onChange={(e) => set("whenNotToTrade", e.target.value)}
          />
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-2.5 text-sm disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Strategy"}
        </button>
      </form>

      <div className="mt-4 disclaimer-banner text-xs">
        ⚠️ Only use strategies you have paper-tested. Evidence over claims.
      </div>
    </div>
  );
}
