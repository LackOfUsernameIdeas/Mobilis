"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { motion } from "framer-motion";
import type { BodyFatWeightEntry } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

interface HealthProgressChartProps {
  chartData: BodyFatWeightEntry[];
}

type PresetRange = "7d" | "30d" | "90d" | "custom";

const chartConfig = {
  weight: {
    label: "Тегло (кг)",
    color: "var(--chart-1)",
  },
  bodyFat: {
    label: "Телесни мазнини (%)",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function HealthProgressChart({ chartData }: HealthProgressChartProps) {
  const [range, setRange] = React.useState<PresetRange>("30d");

  type DateStep = "start" | "end";

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dateStep, setDateStep] = React.useState<DateStep>("start");
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();

  const sortedData = React.useMemo(
    () => [...chartData].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [chartData],
  );

  const validDates = React.useMemo(() => {
    return new Set(sortedData.map((d) => new Date(d.createdAt).toDateString()));
  }, [sortedData]);

  const isDisabled = (date: Date) => !validDates.has(date.toDateString());

  const totalDaysAvailable = React.useMemo(() => {
    if (sortedData.length < 2) return 0;
    const first = new Date(sortedData[0].createdAt);
    const last = new Date(sortedData[sortedData.length - 1].createdAt);
    return Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
  }, [sortedData]);

  const filteredData = React.useMemo(() => {
    if (range === "custom" && startDate && endDate) {
      return sortedData.filter((d) => {
        const date = new Date(d.createdAt);
        return date >= startDate && date <= endDate;
      });
    }

    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return sortedData.filter((d) => new Date(d.createdAt) >= cutoff);
  }, [range, startDate, endDate, sortedData]);

  const chartReadyData = filteredData.map((item) => ({
    date: item.createdAt,
    weight: item.weight,
    bodyFat: item.bodyFat,
  }));

  const resetCustomRange = () => {
    setDateStep("start");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Проследяване на напредъка</CardTitle>
          <CardDescription>Напредък на теглото и телесните мазнини във времето</CardDescription>

          <CardAction className="flex items-center gap-2">
            <Select
              value={range}
              onValueChange={(v) => {
                const value = v as PresetRange;
                setRange(value);

                if (value === "custom") {
                  setDialogOpen(true);
                }
              }}
            >
              <SelectTrigger className="w-44" size="sm">
                <SelectValue placeholder="Изберете период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d" disabled={totalDaysAvailable < 7}>
                  Последни 7 дни
                </SelectItem>
                <SelectItem value="30d" disabled={totalDaysAvailable < 30}>
                  Последни 30 дни
                </SelectItem>
                <SelectItem value="90d" disabled={totalDaysAvailable < 90}>
                  Последни 3 месеца
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate && endDate
                      ? `${startDate.toLocaleDateString("bg-BG")} – ${endDate.toLocaleDateString("bg-BG")}`
                      : "Избери период"}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>

          {range === "custom" && (
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetCustomRange();
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{dateStep === "start" ? "Начална дата" : "Крайна дата"}</DialogTitle>
                  <DialogDescription>
                    Моля, изберете желаната <br />
                    {dateStep === "start" ? "начална дата" : "крайна дата"}.
                  </DialogDescription>
                </DialogHeader>

                {dateStep === "start" && (
                  <>
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={isDisabled} />

                    <div className="mt-4 flex justify-end">
                      <Button disabled={!startDate} onClick={() => setDateStep("end")}>
                        Напред
                      </Button>
                    </div>
                  </>
                )}

                {dateStep === "end" && (
                  <>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => isDisabled(date) || (startDate ? date < startDate : true)}
                    />

                    <div className="mt-4 flex justify-between">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEndDate(undefined);
                          setDateStep("start");
                        }}
                      >
                        Назад
                      </Button>

                      <Button disabled={!endDate} onClick={() => setDialogOpen(false)}>
                        Приложи
                      </Button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>

        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={chartReadyData}>
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
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("bg-BG", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis yAxisId="weight" orientation="left" />
              <YAxis yAxisId="bodyFat" orientation="right" />

              <ChartTooltip
                cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString("bg-BG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    }
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
