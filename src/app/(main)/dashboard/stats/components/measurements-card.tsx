"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Ruler, Weight, Calendar, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface UserMeasurementsCardProps {
  measurements: {
    height: number;
    weight: number;
    gender: string;
    neck: number;
    waist: number;
    hip: number;
    age: number;
    activity_level: string;
  };
}

export function MeasurementsCard({ measurements }: UserMeasurementsCardProps) {
  const imeasurements = [
    { label: "Врат", value: measurements.neck, unit: "см", max: 50 },
    { label: "Талия", value: measurements.waist, unit: "см", max: 120 },
    { label: "Таз", value: measurements.hip, unit: "см", max: 120 },
  ];

  const activityLevelLabels: Record<string, string> = {
    sedentary: "Заседнал",
    light: "Лека",
    moderate: "Умерена",
    active: "Активна",
    very_active: "Много активна",
  };

  const genderLabels: Record<string, string> = {
    male: "Мъж",
    female: "Жена",
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <User className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-base font-medium">Измервания</CardTitle>
        </div>
        <CardDescription>Антропометрични данни</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className="border-border bg-muted/30 flex items-center gap-3 rounded-lg border p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Ruler className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-muted-foreground text-xs">Височина</p>
              <p className="text-sm font-semibold">{measurements.height} см</p>
            </div>
          </motion.div>

          <motion.div
            className="border-border bg-muted/30 flex items-center gap-3 rounded-lg border p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Weight className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-muted-foreground text-xs">Тегло</p>
              <p className="text-sm font-semibold">{measurements.weight} кг</p>
            </div>
          </motion.div>

          <motion.div
            className="border-border bg-muted/30 flex items-center gap-3 rounded-lg border p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Calendar className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-muted-foreground text-xs">Възраст</p>
              <p className="text-sm font-semibold">{measurements.age} год.</p>
            </div>
          </motion.div>

          <motion.div
            className="border-border bg-muted/30 flex items-center gap-3 rounded-lg border p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <User className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-muted-foreground text-xs">Пол</p>
              <p className="text-sm font-semibold">{genderLabels[measurements.gender] || measurements.gender}</p>
            </div>
          </motion.div>
        </div>

        {/* Activity Level */}
        <motion.div
          className="border-border rounded-lg border p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <Activity className="text-muted-foreground h-4 w-4" />
            <div className="flex-1">
              <p className="text-muted-foreground text-xs">Ниво на активност</p>
              <p className="text-sm font-semibold">
                {activityLevelLabels[measurements.activity_level] || measurements.activity_level}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Body Measurements */}
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs font-medium">Обиколки на тялото</p>
          {imeasurements.map((measurement, index) => (
            <div key={measurement.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{measurement.label}</span>
                <span className="font-semibold">
                  {measurement.value} {measurement.unit}
                </span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <motion.div
                  className="bg-primary h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(measurement.value / measurement.max) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.35 + index * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
