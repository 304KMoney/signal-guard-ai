import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⚡</div>
          <h1 className="text-2xl font-bold text-slate-200">Signal Guard AI</h1>
          <p className="text-slate-500 text-sm mt-1">Start with paper trading — no risk</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[#0f172a] border border-slate-800 shadow-2xl",
              headerTitle: "text-slate-200",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton:
                "bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700",
              dividerLine: "bg-slate-700",
              dividerText: "text-slate-500",
              formFieldInput:
                "bg-[#0a0f1e] border border-slate-700 text-slate-200 focus:border-cyan-500",
              formFieldLabel: "text-slate-400",
              formButtonPrimary:
                "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold",
              footerActionLink: "text-cyan-400 hover:text-cyan-300",
            },
          }}
        />
      </div>
    </div>
  );
}
