"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveSkipButtons({
  signalId,
  ticker,
}: {
  signalId: string;
  ticker: string;
}) {
  const [loading, setLoading] = useState<"approve" | "skip" | null>(null);
  const [done, setDone] = useState<"approved" | "skipped" | null>(null);
  const router = useRouter();

  const handleAction = async (action: "approve" | "skip") => {
    setLoading(action);
    try {
      const res = await fetch(`/api/signals/${signalId}/${action}`, {
        method: "POST",
      });
      if (res.ok) {
        setDone(action === "approve" ? "approved" : "skipped");
        if (action === "approve") {
          setTimeout(() => router.push("/dashboard/journal"), 1000);
        }
      }
    } catch {
      // Handle silently
    } finally {
      setLoading(null);
    }
  };

  if (done) {
    return (
      <div
        className={`p-4 rounded-lg border text-center ${
          done === "approved"
            ? "bg-green-500/10 border-green-500/30 text-green-400"
            : "bg-slate-800 border-slate-700 text-slate-400"
        }`}
      >
        {done === "approved"
          ? `✅ Trade approved for ${ticker}. Redirecting to journal...`
          : `⏭️ Signal skipped. Staying disciplined.`}
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={() => handleAction("approve")}
        disabled={loading !== null}
        className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading === "approve" ? (
          <span className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          "✅"
        )}
        Approve Trade (Paper)
      </button>
      <button
        onClick={() => handleAction("skip")}
        disabled={loading !== null}
        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading === "skip" ? (
          <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          "⏭️"
        )}
        Skip This Trade
      </button>
    </div>
  );
}
