import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  const settings = {
    accountSize: user?.accountSize?.toNumber() ?? 150,
    maxDailyLossPct: user?.maxDailyLossPct?.toNumber() ?? 2.0,
    maxPositionSizePct: user?.maxPositionSizePct?.toNumber() ?? 10.0,
    tradingMode: user?.tradingMode ?? "PAPER",
    anthropicApiKey: user?.anthropicApiKey ?? "",
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-200">⚙️ Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure your account, risk preferences, and API keys
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
