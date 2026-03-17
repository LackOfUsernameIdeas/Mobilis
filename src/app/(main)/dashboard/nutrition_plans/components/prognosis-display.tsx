import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { RESULTS_TEXT } from "../constants";
import type { WeightPrognosis } from "../types";

interface PrognosisDisplayProps {
  prognosis: WeightPrognosis;
}

export default function PrognosisDisplay({ prognosis }: PrognosisDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.32, ease: [0.21, 0.47, 0.32, 0.98] as any }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="text-primary h-5 w-5" />
        <h2 className="text-foreground text-xl font-semibold">{RESULTS_TEXT.prognosisTitle}</h2>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prognosis.estimated_date && (
          <div className="bg-muted/50 border-border flex flex-col justify-center rounded-xl border p-4 shadow-sm">
            <p className="text-muted-foreground mb-1 text-xs tracking-wide uppercase">
              {RESULTS_TEXT.prognosisEstimatedDate}
            </p>
            <p className="text-foreground text-xl font-bold">{prognosis.estimated_date}</p>
            {prognosis.estimated_weeks && (
              <p className="text-muted-foreground mt-0.5 text-xs">~{prognosis.estimated_weeks} седмици</p>
            )}
          </div>
        )}
        <div className="bg-muted/50 border-border flex flex-col justify-center rounded-xl border p-4 shadow-sm">
          <p className="text-muted-foreground mb-1 text-xs tracking-wide uppercase">
            {RESULTS_TEXT.prognosisWeeklyChange}
          </p>
          <p className="text-foreground text-xl font-bold">{prognosis.weekly_change}</p>
        </div>
      </div>

      {/* Milestones timeline */}
      {prognosis.milestones && prognosis.milestones.length > 0 && (
        <div className="border-border rounded-xl border p-4 shadow-sm">
          <p className="text-foreground mb-4 text-sm font-semibold">{RESULTS_TEXT.prognosisMilestones}</p>
          <div className="relative space-y-0">
            {prognosis.milestones.map(
              (milestone: { week: number; note: string }, idx: number, arr: { week: number; note: string }[]) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                      {milestone.week}
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="bg-border my-1 w-px flex-1" style={{ minHeight: "1.5rem" }} />
                    )}
                  </div>
                  <div className={`pb-5 ${idx === arr.length - 1 ? "pb-0" : ""}`}>
                    <p className="text-muted-foreground mb-0.5 text-xs font-medium tracking-wide uppercase">
                      Седмица {milestone.week}
                    </p>
                    <p className="text-foreground/80 text-sm leading-relaxed">{milestone.note}</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Note */}
      {prognosis.note && (
        <div className="border-primary/20 bg-primary/5 rounded-xl border p-4 shadow-sm">
          <p className="text-foreground/70 text-sm leading-relaxed italic">{prognosis.note}</p>
        </div>
      )}
    </motion.div>
  );
}
