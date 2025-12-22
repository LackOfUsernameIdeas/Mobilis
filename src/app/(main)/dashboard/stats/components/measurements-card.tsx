"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler } from "lucide-react";
import { motion } from "framer-motion";

interface MeasurementsCardProps {
  neck: number;
  waist: number;
  hip: number;
}

export function MeasurementsCard({ neck, waist, hip }: MeasurementsCardProps) {
  const measurements = [
    { label: "Врат", value: neck, color: "bg-purple-500" },
    { label: "Талия", value: waist, color: "bg-blue-500" },
    { label: "Таз", value: hip, color: "bg-green-500" },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Ruler className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-base font-medium">Измервания</CardTitle>
        </div>
        <CardDescription>Обиколки на тялото в см</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {measurements.map((measurement, index) => (
            <div key={measurement.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{measurement.label}</span>
                <span className="font-semibold">{measurement.value} см</span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <motion.div
                  className={`h-full rounded-full ${measurement.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(measurement.value / 120) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
