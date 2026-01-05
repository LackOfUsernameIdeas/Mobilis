"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { checkTodayMeasurements } from "@/server/measurements";
import { Loader } from "../_components/loader";
import { MeasurementModal } from "./components/MeasurementModal";
import { LoadingOverlay } from "./components/LoadingOverlay";
import type { FormData, UserData } from "./types";
import {
  isFormValid,
  loadSavedMeasurements,
  saveMeasurements,
  convertFormDataToUserData,
  validateAllFields,
} from "./helper_functions";

const initialFormData: FormData = {
  height: "",
  weight: "",
  gender: "",
  age: "",
  activityLevel: "",
  neck: "",
  waist: "",
  hip: "",
};

export default function MeasurementsPage() {
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

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

        const savedData = loadSavedMeasurements();
        if (savedData) {
          setFormData({
            height: savedData.height.toString(),
            weight: savedData.weight.toString(),
            gender: savedData.gender,
            age: savedData.age.toString(),
            activityLevel: savedData.activityLevel,
            neck: savedData.neck.toString(),
            waist: savedData.waist.toString(),
            hip: savedData.hip.toString(),
          });
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
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid(formData)) return;

    setSubmitLoading(true);
    setError(null);

    try {
      const data: UserData = convertFormDataToUserData(formData);

      const validationErrors = validateAllFields(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(". "));
        setSubmitLoading(false);
        return;
      }

      console.log("Saving measurements:", data);

      saveMeasurements(data);

      const response = await fetch("/api/user-measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

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
      <MeasurementModal
        isOpen={isModalOpen}
        formData={formData}
        error={error}
        isLoading={submitLoading}
        isValid={isFormValid(formData)}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />

      {submitLoading && <LoadingOverlay />}
    </>
  );
}
