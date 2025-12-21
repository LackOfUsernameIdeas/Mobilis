"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

const chartData = [
  { date: "2024-06-01", weight: 82.3, bodyFat: 22.1 },
  { date: "2024-06-08", weight: 81.8, bodyFat: 21.7 },
  { date: "2024-06-15", weight: 81.2, bodyFat: 21.3 },
  { date: "2024-06-22", weight: 80.9, bodyFat: 20.9 },
  { date: "2024-06-29", weight: 80.3, bodyFat: 20.6 },
  { date: "2024-07-06", weight: 79.9, bodyFat: 20.3 },
  { date: "2024-07-13", weight: 79.7, bodyFat: 20.1 },
  { date: "2024-07-20", weight: 79.3, bodyFat: 19.7 },
  { date: "2024-07-27", weight: 79.1, bodyFat: 19.4 },
  { date: "2024-08-03", weight: 78.6, bodyFat: 19.1 },
  { date: "2024-08-10", weight: 78.4, bodyFat: 18.8 },
  { date: "2024-08-17", weight: 78.0, bodyFat: 18.5 },
];

const chartConfig = {
  weight: {
    label: "Тегло (кг)",
    color: "var(--chart-1)",
  },
  bodyFat: {
    label: "Телесни мазнини (%)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function HealthProgressChart() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-08-17");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Проследяване на напредъка</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">Напредък на теглото и телесните мазнини във времето</span>
            <span className="@[540px]/card:hidden">Напредък във времето</span>
          </CardDescription>
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="90d">Последни 3 месеца</ToggleGroupItem>
              <ToggleGroupItem value="30d">Последни 30 дни</ToggleGroupItem>
              <ToggleGroupItem value="7d">Последни 7 дни</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="Изберете период"
              >
                <SelectValue placeholder="Последни 3 месеца" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">
                  Последни 3 месеца
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Последни 30 дни
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Последни 7 дни
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-weight)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-weight)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillBodyFat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-bodyFat)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-bodyFat)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("bg-BG", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis yAxisId="weight" orientation="left" tickLine={false} axisLine={false} />
              <YAxis yAxisId="bodyFat" orientation="right" tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
                defaultIndex={isMobile ? -1 : 5}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("bg-BG", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    indicator="line"
                  />
                }
              />
              <Area
                yAxisId="weight"
                dataKey="weight"
                type="monotone"
                fill="url(#fillWeight)"
                stroke="var(--color-weight)"
                strokeWidth={2.5}
              />
              <Area
                yAxisId="bodyFat"
                dataKey="bodyFat"
                type="monotone"
                fill="url(#fillBodyFat)"
                stroke="var(--color-bodyFat)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
