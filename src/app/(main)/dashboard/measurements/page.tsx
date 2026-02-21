"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { checkTodayMeasurements } from "@/server/measurements";
import { Loader } from "../_components/loader";
import { MeasurementModal } from "./components/MeasurementModal";
import { LoadingOverlay } from "./components/LoadingOverlay";
import type { FormData } from "./types";
import {
  isFormValid,
  loadSavedMeasurements,
  saveMeasurementsLocally,
  convertFormDataToUserData,
  validateAllFields,
} from "./helper_functions";
import { saveUserMeasurements } from "@/lib/db/clients/post";

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

  const [loading, setLoading] = useState(true);
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
        setLoading(false);
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
      const data = convertFormDataToUserData(formData);

      const validationErrors = validateAllFields(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(". "));
        return;
      }

      saveMeasurementsLocally(data);
      await saveUserMeasurements(data);

      setIsModalOpen(false);

      // Force a hard navigation if soft navigation fails
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard/stats";
      } else {
        router.push("/dashboard/stats");
      }
    } catch (err) {
      console.error("Error saving measurements:", err);
      setError(err instanceof Error ? err.message : "Failed to save measurements");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
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
