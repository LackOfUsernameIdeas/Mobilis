import { Ruler, Weight, Calendar, User, Activity } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

// Custom ruler dimension icon component
const RulerDimension = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 15v-3" />
    <path d="M14 15v-3" />
    <path d="M18 15v-3" />
    <path d="M2 8V4" />
    <path d="M22 6H2" />
    <path d="M22 8V4" />
    <path d="M6 15v-3" />
    <rect x="2" y="12" width="20" height="8" rx="2" />
  </svg>
);

export default function SidebarMeasurements({
  measurements,
}: {
  measurements: {
    height: number;
    weight: number;
    age: number;
    gender: string;
    neck: number;
    waist: number;
    hip: number;
    activity_level: string;
  };
}) {
  const genderLabels: Record<string, string> = {
    male: "Мъж",
    female: "Жена",
  };

  const activityLevelLabels: Record<string, string> = {
    sedentary: "Заседнал",
    light: "Лека",
    moderate: "Умерена",
    active: "Активна",
    very_active: "Много активна",
  };

  const rows: { icon: React.ElementType; value: string; label: string }[] = [
    { icon: Ruler, value: `${measurements.height} см`, label: "Височина" },
    { icon: Weight, value: `${measurements.weight} кг`, label: "Тегло" },
    { icon: Calendar, value: `${measurements.age} г.`, label: "Възраст" },
    { icon: User, value: genderLabels[measurements.gender] ?? measurements.gender, label: "Пол" },
    {
      icon: Activity,
      value: activityLevelLabels[measurements.activity_level] ?? measurements.activity_level,
      label: "Ниво на активност",
    },
    { icon: RulerDimension, value: `${measurements.neck} см`, label: "Врат" },
    { icon: RulerDimension, value: `${measurements.waist} см`, label: "Талия" },
    { icon: RulerDimension, value: `${measurements.hip} см`, label: "Таз" },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <div className="px-2 text-sm">
        <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase group-data-[collapsible=icon]:hidden">
          Измервания
        </p>

        <div className="space-y-1 space-y-2 md:space-y-2">
          {rows.map((row) => (
            <MeasurementRow key={row.label} icon={row.icon} value={row.value} label={row.label} />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

function MeasurementRow({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => {
            if (isCollapsed) {
              toggleSidebar();
            }
          }}
          className={[
            "flex w-full items-center gap-2 rounded-md",
            "group-data-[collapsible=icon]:justify-center",
            isCollapsed ? "cursor-pointer" : "cursor-default",
          ].join(" ")}
        >
          <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">{value}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={isCollapsed ? 0 : -130} align="center">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
