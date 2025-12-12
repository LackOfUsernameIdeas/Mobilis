"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

const chartData = [
  { date: "2024-06-01", weight: 82, bodyFat: 22 },
  { date: "2024-06-08", weight: 81.5, bodyFat: 21.5 },
  { date: "2024-06-15", weight: 81, bodyFat: 21.2 },
  { date: "2024-06-22", weight: 80.5, bodyFat: 20.8 },
  { date: "2024-06-29", weight: 80, bodyFat: 20.5 },
  { date: "2024-07-06", weight: 79.8, bodyFat: 20.2 },
  { date: "2024-07-13", weight: 79.5, bodyFat: 20 },
  { date: "2024-07-20", weight: 79.2, bodyFat: 19.8 },
  { date: "2024-07-27", weight: 79, bodyFat: 19.5 },
  { date: "2024-08-03", weight: 78.8, bodyFat: 19.3 },
  { date: "2024-08-10", weight: 78.5, bodyFat: 19 },
  { date: "2024-08-17", weight: 78.3, bodyFat: 18.8 },
];

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "var(--chart-1)",
  },
  bodyFat: {
    label: "Body Fat (%)",
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
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Progress Tracking</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">Weight and body fat progress over time</span>
          <span className="@[540px]/card:hidden">Progress over time</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
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
                <stop offset="5%" stopColor="var(--color-weight)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-weight)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillBodyFat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-bodyFat)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-bodyFat)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis yAxisId="weight" orientation="left" tickLine={false} axisLine={false} />
            <YAxis yAxisId="bodyFat" orientation="right" tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 5}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              yAxisId="weight"
              dataKey="weight"
              type="natural"
              fill="url(#fillWeight)"
              stroke="var(--color-weight)"
            />
            <Area
              yAxisId="bodyFat"
              dataKey="bodyFat"
              type="natural"
              fill="url(#fillBodyFat)"
              stroke="var(--color-bodyFat)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
