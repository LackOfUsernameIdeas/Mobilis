"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Activity } from "lucide-react";
import ExerciseDetailsModal from "./components/exercise-details-modal";
import ExerciseCard from "./components/exercise-card";
import AboutSection from "./components/about-section";
import InstallationSteps from "./components/installation-steps";
import WarningAlert from "./components/warning-alert";
import { Loader } from "../../_components/loader";
import { EXERCISES, ANIMATION_VARIANTS } from "./constants";
import type { Exercise } from "./types";

export default function SpecializedProgramsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Всички");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const filteredExercises =
    selectedCategory === "Всички" ? EXERCISES : EXERCISES.filter((ex) => ex.categories.includes(selectedCategory));

  const handleOpenModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-background @container/main flex min-h-screen flex-col gap-6 p-6 md:gap-8 md:p-10 lg:p-12">
      {/* Header with Stats */}
      <motion.div {...ANIMATION_VARIANTS.fadeIn}>
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Специализирана програма за коригиране на стойката</CardTitle>
              </div>
              <div className="bg-primary/10 flex items-center gap-2 rounded-full px-4 py-2">
                <Activity className="text-primary h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">{EXERCISES.length}</div>
                  <div className="text-muted-foreground text-xs">упражнения</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* About Section */}
      <AboutSection />

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 gap-6 @3xl/main:grid-cols-2">
        {filteredExercises.map((exercise, index) => (
          <ExerciseCard key={exercise.id} exercise={exercise} index={index} onOpenModal={handleOpenModal} />
        ))}
      </div>

      {/* Installation Steps Section */}
      <InstallationSteps />

      {/* Warning Alert */}
      <WarningAlert />

      {/* Exercise Modal */}
      {selectedExercise && (
        <ExerciseDetailsModal open={modalOpen} onOpenChange={setModalOpen} exercise={selectedExercise} />
      )}
    </div>
  );
}
