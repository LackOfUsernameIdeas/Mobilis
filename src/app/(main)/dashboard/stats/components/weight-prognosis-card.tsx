import { ArrowRight, Clock, Weight } from "lucide-react";
import Link from "next/link";
import { WeightPrognosis } from "@/app/(main)/dashboard/nutrition_plans/types";
import {
  getPrognosisAgeLabel,
  getPrognosisProgressPercent,
  getPrognosisDaysElapsed,
  isMilestoneCurrent,
  isMilestonePast,
  isPrognosisStale,
} from "@/app/(main)/dashboard/stats/helper_functions";

interface Props {
  data?: WeightPrognosis | null;
  onOpenDetails?: () => void;
}

export default function WeightPrognosisCard({ data, onOpenDetails }: Props) {
  if (!data) return <EmptyState />;

  const daysElapsed = getPrognosisDaysElapsed(data.created_at);
  const totalDays = (data.estimated_weeks ?? 0) * 7;
  const stale = isPrognosisStale(data.created_at, data.estimated_weeks ?? 0);
  const progressPercent = getPrognosisProgressPercent(data.created_at, data.estimated_weeks ?? 0);
  const ageLabel = getPrognosisAgeLabel(data.created_at);
  const remainingWeeks = Math.max(0, Math.ceil((totalDays - daysElapsed) / 7));

  return (
    <div
      className={`border-border bg-card flex w-full flex-col gap-6 rounded-xl border p-6 shadow-sm transition-all duration-200 ${stale ? "border-orange-300 dark:border-orange-800" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${stale ? "bg-orange-100 dark:bg-orange-950" : "bg-primary/10"}`}>
            <Weight className={`h-5 w-5 ${stale ? "text-orange-500" : "text-primary"}`} />
          </div>
          <div>
            <h3 className="text-card-foreground text-lg font-semibold">Прогноза за постигане на целево тегло</h3>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Clock className="text-muted-foreground h-3 w-3" />
              <span
                className={`text-xs font-medium ${stale ? "text-orange-500 dark:text-orange-400" : "text-muted-foreground"}`}
              >
                Генерирана {ageLabel}
              </span>
              {stale && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                  Изтекла
                </span>
              )}
            </div>
          </div>
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

      {/* Progress bar */}
      {totalDays > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Прогрес по прогноза</span>
            <span className={stale ? "text-orange-500" : "text-primary"}>{progressPercent}%</span>
          </div>
          <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-500 ${stale ? "bg-orange-400 dark:bg-orange-600" : "bg-primary"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            {stale
              ? "Прогнозираният период е изтекъл — помислете за нова генерация."
              : `${daysElapsed} от ${totalDays} дни изминали`}
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Очаквана дата за постигане" value={data.estimated_date ?? "—"} stale={stale} />
        <StatCard
          label="Оставащи седмици"
          value={stale ? "—" : remainingWeeks > 0 ? `~${remainingWeeks}` : "Достигнато"}
          originalValue={daysElapsed >= 7 && data.estimated_weeks ? `~${data.estimated_weeks}` : undefined}
          stale={stale}
        />
        <StatCard label="Седмична промяна" value={data.weekly_change} stale={false} />
      </div>

      {/* Milestones */}
      {data.milestones && data.milestones.length > 0 && (
        <div className="border-border rounded-xl border p-4 shadow-sm">
          <p className="text-card-foreground mb-4 text-sm font-semibold">Очаквани етапи на развитие</p>
          <div className="relative space-y-0">
            {data.milestones.map((m, idx, arr) => {
              const past = isMilestonePast(data.created_at, m.week);
              const current = isMilestoneCurrent(data.created_at, m.week);

              return (
                <div key={m.week} className={`flex gap-4 ${past ? "opacity-50" : ""}`}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        past
                          ? "bg-muted text-muted-foreground"
                          : current
                            ? "bg-primary/20 text-primary ring-primary ring-2"
                            : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {past ? (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        m.week
                      )}
                    </div>
                    {idx < arr.length - 1 && (
                      <div
                        className={`my-1 w-px flex-1 ${past ? "bg-muted-foreground/30" : "bg-border"}`}
                        style={{ minHeight: "1.5rem" }}
                      />
                    )}
                  </div>

                  <div className={idx === arr.length - 1 ? "pb-0" : "pb-5"}>
                    <div className="mb-0.5 flex items-center gap-2">
                      <p
                        className={`text-xs font-medium tracking-wide uppercase ${past ? "text-muted-foreground/60 line-through" : "text-muted-foreground"}`}
                      >
                        Седмица {m.week}
                      </p>
                      {current && (
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
                          Текуща
                        </span>
                      )}
                      {past && (
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold">
                          Изминала
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${past ? "text-muted-foreground/50 decoration-muted-foreground/30 line-through" : "text-foreground/80"}`}
                    >
                      {m.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.note && (
        <div className="bg-muted/50 text-muted-foreground border-border rounded-lg border p-3 text-xs">{data.note}</div>
      )}

      {stale && (
        <Link
          href="/dashboard/nutrition_plans"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 transition-all hover:bg-orange-100 active:scale-95 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-950/70"
        >
          Генерирайте нова прогноза <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  originalValue,
  stale,
}: {
  label: string;
  value: string | number;
  originalValue?: string;
  stale: boolean;
}) {
  return (
    <div
      className={`border-border rounded-lg border p-4 transition-colors ${stale ? "bg-orange-50/50 dark:bg-orange-950/20" : "bg-secondary/50 hover:bg-secondary/70"}`}
    >
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        {originalValue && originalValue !== String(value) && (
          <p className="text-muted-foreground/50 text-lg line-through">{originalValue}</p>
        )}
        <p
          className={`text-xl font-semibold ${stale ? "text-orange-500 dark:text-orange-400" : "text-card-foreground"}`}
        >
          {value}
        </p>
      </div>
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
