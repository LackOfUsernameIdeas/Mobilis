import { ArrowRight, Weight } from "lucide-react";
import Link from "next/link";
import { WeightPrognosis } from "@/app/(main)/dashboard/nutrition_plans/types";

interface Props {
  data?: WeightPrognosis | null;
  onOpenDetails?: () => void;
  emptyStateLink?: string;
  emptyStateText?: string;
}

export default function WeightPrognosisCard({ data, onOpenDetails }: Props) {
  if (!data) {
    return <EmptyState />;
  }

  return (
    <div className="border-border bg-card flex w-full flex-col gap-6 rounded-xl border p-6 shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <Weight className="text-primary h-5 w-5" />
          </div>
          <h3 className="text-card-foreground text-lg font-semibold">Прогноза за постигане на целево тегло</h3>
        </div>

        {onOpenDetails && (
          <button
            onClick={onOpenDetails}
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium transition-colors"
          >
            Детайли <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Очаквано време за постигане на целта" value={data.estimated_date ?? "—"} />
        <StatCard label="Оставащи седмици" value={data.estimated_weeks ? `~${data.estimated_weeks}` : "—"} />
        <StatCard label="Седмична промяна" value={data.weekly_change} />
      </div>

      {data.milestones && data.milestones.length > 0 && (
        <div className="border-border rounded-xl border p-4 shadow-sm">
          <p className="text-card-foreground mb-4 text-sm font-semibold">Очаквани етапи на развитие</p>
          <div className="relative space-y-0">
            {data.milestones.map((m, idx, arr) => (
              <div key={m.week} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {m.week}
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="bg-border my-1 w-px flex-1" style={{ minHeight: "1.5rem" }} />
                  )}
                </div>
                <div className={idx === arr.length - 1 ? "pb-0" : "pb-5"}>
                  <p className="text-muted-foreground mb-0.5 text-xs font-medium tracking-wide uppercase">
                    Седмица {m.week}
                  </p>
                  <p className="text-foreground/80 text-sm leading-relaxed">{m.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.note && (
        <div className="bg-muted/50 text-muted-foreground border-border rounded-lg border p-3 text-xs">{data.note}</div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-border bg-secondary/50 hover:bg-secondary/70 rounded-lg border p-4 transition-colors">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p className="text-card-foreground mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-muted-foreground/40 bg-card flex w-full items-center justify-center rounded-lg border-2 border-dashed p-12">
      <div className="flex flex-col items-center text-center">
        <div className="bg-muted mb-4 rounded-full p-4">
          <Weight className="text-muted-foreground h-6 w-6" />
        </div>

        <h3 className="text-card-foreground mb-2 text-lg font-semibold">Задайте целево тегло</h3>

        <p className="text-muted-foreground mb-6 max-w-sm text-sm">
          Персонализираната прогноза ви показва реалистичен път до целевото ви тегло - конкретни етапи и очаквани
          резултати.
        </p>

        <Link
          href="/dashboard/nutrition_plans"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all active:scale-95"
        >
          Създайте хранителен план и получете прогноза <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
