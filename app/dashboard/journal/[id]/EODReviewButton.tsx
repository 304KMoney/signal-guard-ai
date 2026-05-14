"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EODReviewButton({ tradeId }: { tradeId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trades/${tradeId}/review`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate review");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleReview}
        disabled={loading}
        className="w-full btn-primary py-2.5 text-sm disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            Generating Review...
          </span>
        ) : (
          "Generate AI Trade Review"
        )}
      </button>
      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
