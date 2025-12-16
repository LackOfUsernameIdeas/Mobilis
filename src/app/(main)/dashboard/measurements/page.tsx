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
  neck: number;
  waist: number;
  hip: number;
};

const STORAGE_KEY = "user_last_measurements";

// Validation limits
const LIMITS = {
  height: { min: 100, max: 300 }, // cm
  weight: { min: 30, max: 300 }, // kg
  neck: { min: 20, max: 100 }, // cm
  waist: { min: 40, max: 300 }, // cm
  hip: { min: 50, max: 300 }, // cm
};

export default function HomePage() {
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    gender: "",
    neck: "",
    waist: "",
    hip: "",
  });

  // Check if measurements exist for today on mount
  useEffect(() => {
    async function init() {
      try {
        // Check if today's measurements already exist
        const result = await checkTodayMeasurements();
        console.log("Check result:", result);

        if (result.success && result.hasTodayMeasurement) {
          // Measurements already exist for today, skip to dashboard
          console.log("Measurements already recorded today, redirecting to dashboard");
          router.push("/dashboard/default");
          return;
        }

        console.log("No measurements for today, showing modal");

        // No measurements for today, load last saved measurements from localStorage
        try {
          const savedData = localStorage.getItem(STORAGE_KEY);
          if (savedData) {
            console.log("Loading saved measurements from localStorage");
            const parsedData = JSON.parse(savedData) as UserData;
            setFormData({
              height: parsedData.height.toString(),
              weight: parsedData.weight.toString(),
              gender: parsedData.gender,
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
        // Show modal on error to allow user to proceed
        setIsModalOpen(true);
      } finally {
        setPageLoading(false);
      }
    }

    init();
  }, []); // Empty dependency array - only run once on mount

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateValue = (field: keyof typeof LIMITS, value: number): string | null => {
    const limits = LIMITS[field];
    if (value < limits.min) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${limits.min} cm`;
    }
    if (value > limits.max) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at most ${limits.max} ${field === "weight" ? "kg" : "cm"}`;
    }
    return null;
  };

  const isFormValid = () => {
    const { height, weight, gender, neck, waist, hip } = formData;

    if (!height || !weight || !gender || !neck || !waist || !hip) {
      return false;
    }

    // Validate all numeric fields are within limits
    const heightNum = Number.parseFloat(height);
    const weightNum = Number.parseFloat(weight);
    const neckNum = Number.parseFloat(neck);
    const waistNum = Number.parseFloat(waist);
    const hipNum = Number.parseFloat(hip);

    return (
      validateValue("height", heightNum) === null &&
      validateValue("weight", weightNum) === null &&
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
        neck: Number.parseFloat(formData.neck),
        waist: Number.parseFloat(formData.waist),
        hip: Number.parseFloat(formData.hip),
      };

      // Final validation before submission
      const validationErrors: string[] = [];
      Object.keys(LIMITS).forEach((field) => {
        const error = validateValue(field as keyof typeof LIMITS, data[field as keyof UserData] as number);
        if (error) validationErrors.push(error);
      });

      if (validationErrors.length > 0) {
        setError(validationErrors.join(". "));
        setSubmitLoading(false);
        return;
      }

      console.log("Saving measurements:", data);

      // Save to localStorage before submitting
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      // Save measurements to Supabase
      const result = await saveMeasurementsAndCalculateMetrics(data);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to save measurements");
      }

      console.log("Measurements saved successfully");
      setUserData(data);

      // Navigate to dashboard after successful save
      router.push("/dashboard/default");
    } catch (err) {
      console.error("Error saving measurements:", err);
      setError(err instanceof Error ? err.message : "Failed to save measurements. Please try again.");
      setSubmitLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Dialog open={isModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Daily Check-in</DialogTitle>
            <DialogDescription>Enter today's body measurements to continue.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min={LIMITS.height.min}
                max={LIMITS.height.max}
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                placeholder="Пример: 175"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min={LIMITS.weight.min}
                max={LIMITS.weight.max}
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                placeholder="Пример: 70"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neck">Neck (cm)</Label>
              <Input
                id="neck"
                type="number"
                step="0.1"
                min={LIMITS.neck.min}
                max={LIMITS.neck.max}
                value={formData.neck}
                onChange={(e) => handleInputChange("neck", e.target.value)}
                placeholder="Пример: 38"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waist">Waist (cm)</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                min={LIMITS.waist.min}
                max={LIMITS.waist.max}
                value={formData.waist}
                onChange={(e) => handleInputChange("waist", e.target.value)}
                placeholder="Пример: 85"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hip">Hip (cm)</Label>
              <Input
                id="hip"
                type="number"
                step="0.1"
                min={LIMITS.hip.min}
                max={LIMITS.hip.max}
                value={formData.hip}
                onChange={(e) => handleInputChange("hip", e.target.value)}
                placeholder="Пример: 95"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={!isFormValid() || submitLoading}>
              {submitLoading ? "Processing…" : "Continue"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {submitLoading && (
        <div className="bg-background/80 fixed inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="text-muted-foreground">Saving today's data…</p>
          </div>
        </div>
      )}
    </>
  );
}
