import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import NewStrategyForm from "./NewStrategyForm";

export default async function StrategiesPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const strategies = await prisma.strategy.findMany({
    where: { userId: user?.id ?? "" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-200">🧠 Strategy Library</h1>
        <p className="text-sm text-slate-500 mt-1">
          Convert raw trading ideas into objective, testable rules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New strategy form */}
        <div>
          <NewStrategyForm />
        </div>

        {/* Strategy list */}
        <div className="space-y-4">
          {strategies.length === 0 ? (
            <div className="terminal-card p-8 text-center">
              <div className="text-3xl mb-3">📋</div>
              <p className="text-sm text-slate-500">
                No strategies yet. Create your first rule-based strategy.
              </p>
            </div>
          ) : (
            strategies.map((strategy) => {
              const rules = strategy.rules as {
                entryRules?: string[];
                exitRules?: string[];
                whenNotToTrade?: string[];
              };

              return (
                <div key={strategy.id} className="terminal-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-200">
                        {strategy.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Created {formatDate(strategy.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${
                        strategy.isActive
                          ? "text-green-400 border-green-400/30 bg-green-400/5"
                          : "text-slate-500 border-slate-700"
                      }`}
                    >
                      {strategy.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mb-3 leading-relaxed">
                    {strategy.description}
                  </p>

                  {rules.entryRules && rules.entryRules.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">
                        Entry Rules
                      </p>
                      <ul className="space-y-1">
                        {rules.entryRules.slice(0, 3).map((rule, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                            <span className="text-cyan-400 shrink-0">→</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rules.whenNotToTrade && rules.whenNotToTrade.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">
                        When NOT to Trade
                      </p>
                      <ul className="space-y-1">
                        {rules.whenNotToTrade.slice(0, 2).map((rule, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                            <span className="text-red-400 shrink-0">✗</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
