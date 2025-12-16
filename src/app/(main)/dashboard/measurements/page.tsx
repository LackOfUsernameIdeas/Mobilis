"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveMeasurementsAction } from "@/server/measurements";

type UserData = {
  height: number;
  weight: number;
  gender: "male" | "female";
  neck: number;
  waist: number;
  hip: number;
};

const simulateInitialCheck = () => new Promise<void>((resolve) => setTimeout(resolve, 1000));

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

  useEffect(() => {
    async function init() {
      await simulateInitialCheck();
      setIsModalOpen(true);
      setPageLoading(false);
    }

    init();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const isFormValid = () => {
    const { height, weight, gender, neck, waist, hip } = formData;
    const baseValid = height && weight && gender && neck && waist && hip;

    return !!baseValid;
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

      // Save measurements to Supabase
      await saveMeasurementsAction(data);

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
        <div className="text-center">
          <div className="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground">Checking today's data…</p>
        </div>
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
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                required
              />
            </div>

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
              <Label htmlFor="neck">Neck (cm)</Label>
              <Input
                id="neck"
                type="number"
                step="0.1"
                value={formData.neck}
                onChange={(e) => handleInputChange("neck", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waist">Waist (cm)</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                value={formData.waist}
                onChange={(e) => handleInputChange("waist", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hip">Hip (cm)</Label>
              <Input
                id="hip"
                type="number"
                step="0.1"
                value={formData.hip}
                onChange={(e) => handleInputChange("hip", e.target.value)}
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
