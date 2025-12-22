"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveMeasurementsAndCalculateMetrics, checkTodayMeasurements } from "@/server/measurements";
import { Loader } from "../_components/loader";

type UserData = {
  height: number;
  weight: number;
  gender: "male" | "female";
  age: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  neck: number;
  waist: number;
  hip: number;
};

const STORAGE_KEY = "user_last_measurements";

// Validation limits
const LIMITS = {
  height: { min: 100, max: 300 }, // cm
  weight: { min: 30, max: 300 }, // kg
  age: { min: 10, max: 100 }, // years
  neck: { min: 20, max: 100 }, // cm
  waist: { min: 40, max: 300 }, // cm
  hip: { min: 50, max: 300 }, // cm
};

// Activity level definitions
const ACTIVITY_LEVELS = [
  {
    value: "sedentary",
    label: "Заседнал начин на живот",
    description:
      "Малко или никаква физическа активност. Предимно седяща работа, при която свободното време минава основно на закрито",
  },
  {
    value: "light",
    label: "Лека физическа активност",
    description:
      "Леки упражнения 1-3 пъти седмично или работа, свързана с движение и/или стоене прав през по-голямата част от деня",
  },
  {
    value: "moderate",
    label: "Умерена физическа активност",
    description:
      "Редовни тренировки със средна интензивност 3-5 пъти седмично, например бягане, колоездене или плуване",
  },
  {
    value: "active",
    label: "Висока физическа активност",
    description: "Интензивни тренировки или спорт с умерена до висока натовареност 6-7 пъти седмично",
  },
  {
    value: "very_active",
    label: "Много висока физическа активност",
    description: "Много интензивни тренировки, по две тренировки дневно или работа, изискваща тежък физически труд",
  },
];

export default function HomePage() {
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    gender: "",
    age: "",
    activityLevel: "",
    neck: "",
    waist: "",
    hip: "",
  });

  useEffect(() => {
    async function init() {
      try {
        const result = await checkTodayMeasurements();
        console.log("Check result:", result);

        if (result.success && result.hasTodayMeasurement) {
          console.log("Measurements already recorded today, redirecting to dashboard");
          router.push("/dashboard/stats");
          return;
        }

        console.log("No measurements for today, showing modal");

        try {
          const savedData = localStorage.getItem(STORAGE_KEY);
          if (savedData) {
            console.log("Loading saved measurements from localStorage");
            const parsedData = JSON.parse(savedData) as UserData;
            setFormData({
              height: parsedData.height.toString(),
              weight: parsedData.weight.toString(),
              gender: parsedData.gender,
              age: parsedData.age.toString(),
              activityLevel: parsedData.activityLevel,
              neck: parsedData.neck.toString(),
              waist: parsedData.waist.toString(),
              hip: parsedData.hip.toString(),
            });
          }
        } catch (err) {
          console.error("Error loading saved measurements:", err);
        }

        setIsModalOpen(true);
      } catch (err) {
        console.error("Error during initialization:", err);
        setIsModalOpen(true);
      } finally {
        setPageLoading(false);
      }
    }

    init();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const validateValue = (field: keyof typeof LIMITS, value: number): string | null => {
    const limits = LIMITS[field];
    const fieldNames = {
      height: "Височината",
      weight: "Теглото",
      age: "Възрастта",
      neck: "Врата",
      waist: "Талията",
      hip: "Таза",
    };

    if (value < limits.min) {
      return `${fieldNames[field]} трябва да бъде поне ${limits.min} ${field === "weight" ? "кг" : field === "age" ? "години" : "см"}`;
    }
    if (value > limits.max) {
      return `${fieldNames[field]} трябва да бъде максимум ${limits.max} ${field === "weight" ? "кг" : field === "age" ? "години" : "см"}`;
    }
    return null;
  };

  const isFormValid = () => {
    const { height, weight, gender, age, activityLevel, neck, waist, hip } = formData;

    if (!height || !weight || !gender || !age || !activityLevel || !neck || !waist || !hip) {
      return false;
    }

    const heightNum = Number.parseFloat(height);
    const weightNum = Number.parseFloat(weight);
    const ageNum = Number.parseFloat(age);
    const neckNum = Number.parseFloat(neck);
    const waistNum = Number.parseFloat(waist);
    const hipNum = Number.parseFloat(hip);

    return (
      validateValue("height", heightNum) === null &&
      validateValue("weight", weightNum) === null &&
      validateValue("age", ageNum) === null &&
      validateValue("neck", neckNum) === null &&
      validateValue("waist", waistNum) === null &&
      validateValue("hip", hipNum) === null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setSubmitLoading(true);
    setError(null);

    try {
      const data: UserData = {
        height: Number.parseFloat(formData.height),
        weight: Number.parseFloat(formData.weight),
        gender: formData.gender as "male" | "female",
        age: Number.parseFloat(formData.age),
        activityLevel: formData.activityLevel as "sedentary" | "light" | "moderate" | "active" | "very_active",
        neck: Number.parseFloat(formData.neck),
        waist: Number.parseFloat(formData.waist),
        hip: Number.parseFloat(formData.hip),
      };

      const validationErrors: string[] = [];
      (["height", "weight", "age", "neck", "waist", "hip"] as const).forEach((field) => {
        const error = validateValue(field, data[field] as number);
        if (error) validationErrors.push(error);
      });

      if (validationErrors.length > 0) {
        setError(validationErrors.join(". "));
        setSubmitLoading(false);
        return;
      }

      console.log("Saving measurements:", data);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      const result = await saveMeasurementsAndCalculateMetrics(data);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to save measurements");
      }

      router.push("/dashboard/stats");
    } catch (err) {
      console.error("Error saving measurements:", err);
      setError(err instanceof Error ? err.message : "Failed to save measurements. Please try again.");
      setSubmitLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="bg-background flex min-h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Dialog open={isModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Напишете вашите данни</DialogTitle>
            <DialogDescription>Въведете текущите си телесни измервания, за да продължите</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-foreground text-xs">
                Пол
              </Label>
              <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Изберете пол" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Мъж</SelectItem>
                  <SelectItem value="female">Жена</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-foreground text-xs">
                Възраст
              </Label>
              <div className="relative">
                <Input
                  id="age"
                  type="number"
                  step="1"
                  min={LIMITS.age.min}
                  max={LIMITS.age.max}
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder="напр. 25"
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-16 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">години</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel" className="text-foreground text-xs">
                Ниво на активност
              </Label>
              <Select value={formData.activityLevel} onValueChange={(v) => handleInputChange("activityLevel", v)}>
                <SelectTrigger id="activityLevel" className="px-3 py-1">
                  <SelectValue placeholder="Изберете ниво на активност">
                    {ACTIVITY_LEVELS.find((l) => l.value === formData.activityLevel)?.label}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {ACTIVITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{level.label}</span>
                        <span className="text-muted-foreground text-xs">{level.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-foreground text-xs">
                Височина
              </Label>
              <div className="relative">
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  min={LIMITS.height.min}
                  max={LIMITS.height.max}
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="напр. 185"
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">см</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="text-foreground text-xs">
                Тегло
              </Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min={LIMITS.weight.min}
                  max={LIMITS.weight.max}
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="напр. 95"
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">кг</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="neck" className="text-foreground text-xs">
                Обиколка на врат
              </Label>
              <div className="relative">
                <Input
                  id="neck"
                  type="number"
                  step="0.1"
                  min={LIMITS.neck.min}
                  max={LIMITS.neck.max}
                  value={formData.neck}
                  onChange={(e) => handleInputChange("neck", e.target.value)}
                  placeholder="напр. 38"
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">см</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="waist" className="text-foreground text-xs">
                Обиколка на талия
              </Label>
              <div className="relative">
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  min={LIMITS.waist.min}
                  max={LIMITS.waist.max}
                  value={formData.waist}
                  onChange={(e) => handleInputChange("waist", e.target.value)}
                  placeholder="напр. 92"
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">см</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hip" className="text-foreground text-xs">
                Обиколка на таз
              </Label>
              <div className="relative">
                <Input
                  id="hip"
                  type="number"
                  step="0.1"
                  min={LIMITS.hip.min}
                  max={LIMITS.hip.max}
                  value={formData.hip}
                  onChange={(e) => handleInputChange("hip", e.target.value)}
                  placeholder="напр. 102"
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">см</span>
              </div>
            </div>

            <Button type="submit" className="w-full cursor-pointer" disabled={!isFormValid() || submitLoading}>
              {submitLoading ? "Зареждане..." : "Напред"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {submitLoading && (
        <div className="bg-background/80 fixed inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="text-muted-foreground">Запазване на днешните данни...</p>
          </div>
        </div>
      )}
    </>
  );
}
