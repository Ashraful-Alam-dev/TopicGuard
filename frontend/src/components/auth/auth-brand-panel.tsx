import { ShieldCheck, Sparkles } from "lucide-react";

/**
 * Signature visual: three submitted "topic" cards echo the product's core
 * job — spotting overlap before it becomes a problem. Two are linked by a
 * similarity score, one is cleared. Follows the app's light/dark setting,
 * with a deep navy surface in dark mode and a soft tinted surface in light
 * mode, so it never gets stuck looking like the "other" theme.
 */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-[#EEF2FF] lg:flex lg:flex-col lg:justify-between lg:p-12 dark:bg-[#0F172A]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, rgba(59,130,246,0.16), transparent 60%), radial-gradient(50% 40% at 90% 80%, rgba(37,99,235,0.12), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(50% 40% at 90% 80%, rgba(37,99,235,0.18), transparent 60%)",
        }}
      />

      <div className="relative flex items-center gap-2 text-[#0F172A] dark:text-slate-50">
        <ShieldCheck className="size-6 text-[#3B82F6]" strokeWidth={2.25} />
        <span className="text-lg font-semibold tracking-tight">
          TopicGuard
        </span>
      </div>

      <div className="relative flex flex-col gap-10">
        <div className="max-w-md">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight text-[#0F172A] dark:text-slate-50">
            Every idea checked before it's claimed twice.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#475569] dark:text-slate-400">
            Classrooms, submissions, and topic registrations in one place —
            with overlap caught automatically instead of discovered in week
            twelve.
          </p>
        </div>

        {/* Signature element: overlap-detection mockup */}
        <div className="relative h-44 w-full max-w-md select-none">
          <TopicCard
            className="left-0 top-8 w-56 -rotate-3"
            title="Predicting churn with XGBoost"
            tone="warning"
          />
          <TopicCard
            className="left-20 top-0 w-56 rotate-2"
            title="Customer churn prediction using ML"
            tone="warning"
          />
          <TopicCard
            className="left-10 top-24 w-56 -rotate-1"
            title="AR wayfinding for campus buildings"
            tone="success"
          />
          <span className="absolute left-[7.5rem] top-[3.25rem] rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/15 px-2 py-0.5 text-[11px] font-medium text-[#B45309] dark:text-[#FBBF24]">
            82% similar
          </span>
        </div>
      </div>

      <div className="relative flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-500">
        <Sparkles className="size-3.5" />
        AI-assisted similarity detection, on every submission.
      </div>
    </div>
  );
}

function TopicCard({
  title,
  tone,
  className,
}: {
  title: string;
  tone: "warning" | "success";
  className?: string;
}) {
  return (
    <div
      className={`absolute rounded-xl border border-black/[0.06] bg-white/70 p-3.5 shadow-lg shadow-black/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="h-1.5 w-10 rounded-full bg-black/10 dark:bg-white/20" />
        <div
          className={`size-1.5 rounded-full ${
            tone === "success" ? "bg-[#22C55E]" : "bg-[#F59E0B]"
          }`}
        />
      </div>
      <p className="mt-2.5 text-[13px] leading-snug font-medium text-[#0F172A]/80 dark:text-slate-200">
        {title}
      </p>
    </div>
  );
}
