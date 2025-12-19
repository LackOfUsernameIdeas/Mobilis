"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Target, Activity } from "lucide-react";
import ExerciseDetailModal from "./components/exercise-modal";
import DownloadButton from "./components/download-button";

// Exercise data
const exercises = [
  {
    id: 1,
    name: "Shoulder Blade Squeezes",
    difficulty: "Лесно",
    categories: ["Стойка", "Мобилност"],
    targetArea: "Рамене",
    benefits: ["Отстранява заоблянето на раменете", "Увеличава мобилността", "Намалява болката"],
    youtubeId: "ouRhQE2iOI8",
    instructions: "Правете бавни кръгови движения с раменете напред и назад, по 10 повторения във всяка посока.",
  },
  {
    id: 2,
    name: "Врат - Странични наклони",
    description: "Подобрява гъвкавостта на врата и намалява напрежението",
    difficulty: "Лесно",
    categories: ["Стойка", "Мобилност"],
    targetArea: "Врат",
    benefits: ["Намалява напрежението", "Подобрява подвижността"],
    youtubeId: "dQw4w9WgXcQ",
    instructions:
      "Седнете изправени, полека наведете главата си към едното рамо, задръжте за 15-20 секунди, после към другото рамо.",
  },
  {
    id: 3,
    name: "Гръб - Торакално разтягане",
    description: "Отваря гръдния кош и подобрява стойката в горната част на гърба",
    difficulty: "Средно",
    categories: ["Стойка", "Мобилност"],
    targetArea: "Горна част на гърба",
    benefits: ["Отваря гръдния кош", "Подобрява дишането"],
    youtubeId: "dQw4w9WgXcQ",
    instructions: "Легнете на ролка за пяна в областта на горната част на гърба, бавно навеждайте се назад.",
  },
  {
    id: 4,
    name: "Таз - Мобилизация",
    description: "Повишава гъвкавостта на тазобедрените стави",
    difficulty: "Средно",
    categories: ["Мобилност", "Баланс"],
    targetArea: "Таз",
    benefits: ["Увеличава гъвкавостта", "Намалява болката в долната част на гърба"],
    youtubeId: "dQw4w9WgXcQ",
    instructions: "Правете кръгови движения с таза, после наклони напред и назад.",
  },
  {
    id: 5,
    name: "Баланс - Едноракo застаналe",
    description: "Развива баланс и стабилност на цялото тяло",
    difficulty: "Средно",
    categories: ["Баланс"],
    targetArea: "Цяло тяло",
    benefits: ["Подобрява баланса", "Предпазва от травми"],
    youtubeId: "dQw4w9WgXcQ",
    instructions: "Застанете на един крак, задръжте позицията 30 секунди, сменете крака.",
  },
  {
    id: 6,
    name: "Корем - Активация на кор",
    description: "Укрепва коремната мускулатура и подобрява стойката",
    difficulty: "Средно",
    categories: ["Стойка", "Баланс"],
    targetArea: "Корем",
    benefits: ["Укрепва корa", "Стабилизира гръбначния стълб"],
    youtubeId: "dQw4w9WgXcQ",
    instructions: "Изпълнете планк позиция, задръжте 30-60 секунди, повторете 3 пъти.",
  },
  {
    id: 7,
    name: "Врат - Дълбоки флексори",
    description: "Укрепва дълбоките мускули на врата",
    difficulty: "Лесно",
    categories: ["Стойка"],
    targetArea: "Врат",
    benefits: ["Коригира предна стойка на главата", "Намалява главоболието"],
    youtubeId: "dQw4w9WgXcQ",
    instructions: "Легнете по гръб, леко прибирайте брадичката си към гърдите, задръжте 5-10 секунди.",
  },
  {
    id: 8,
    name: "Гръб - Растягане на latissimus",
    description: "Разтяга широчайшите мускули на гърба",
    difficulty: "Лесно",
    categories: ["Мобилност"],
    targetArea: "Гръб",
    benefits: ["Подобрява подвижността на раменете", "Намалява сковаността"],
    youtubeId: "dQw4w9WgXcQ",
    instructions: "Хванете се за стабилна опора, седнете назад и усетете разтягането в гърба.",
  },
];

type Difficulty = "Лесно" | "Средно" | "Трудно";

const difficultyMap: Record<Difficulty, string> = {
  Лесно: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  Средно: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  Трудно: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

export default function SpecializedProgramsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Всички");
  const [selectedExercise, setSelectedExercise] = useState<(typeof exercises)[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredExercises =
    selectedCategory === "Всички" ? exercises : exercises.filter((ex) => ex.categories.includes(selectedCategory));

  const handleOpenModal = (exercise: (typeof exercises)[0]) => {
    setSelectedExercise(exercise);
    setModalOpen(true);
  };

  return (
    <div className="bg-background @container/main flex min-h-screen flex-col gap-6 p-6 md:gap-8 md:p-10 lg:p-12">
      {/* Header with Stats */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Специализирана програма</CardTitle>
            </div>
            <div className="bg-primary/10 flex items-center gap-2 rounded-full px-4 py-2">
              <Activity className="text-primary h-5 w-5" />
              <div>
                <div className="text-2xl font-bold">{exercises.length}</div>
                <div className="text-muted-foreground text-xs">упражнения</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* About Section */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/50">
        <CardContent className="space-y-3 text-sm leading-relaxed text-blue-800 dark:text-blue-300">
          <p>
            Упражненията са резултат от анализ и консултации с физиотерапевти, с цел изграждане на логично структурирана
            тренировъчна програма. Подходът цели да се справи с натоварванията и ограниченията на тялото, като
            програмата е насочена към конкретни нужди и цели, а именно:
          </p>
          <ul className="ml-2 list-inside list-disc space-y-1">
            <li>Коригиране на стойката</li>
            <li>Повишаване на гъвкавостта и подвижността на врата, раменете, горната част на гърба и таза</li>
            <li>Намаляване на напрежението и болката, причинени от продължително седене или неправилна стойка</li>
            <li>Развитие на баланс и контрол, което предпазва тялото от претоварвания и травми</li>
          </ul>
        </CardContent>
      </Card>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 gap-6 @3xl/main:grid-cols-2">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="flex h-full flex-col transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-xl">{exercise.name}</CardTitle>
                </div>
                <Badge className={difficultyMap[exercise.difficulty as keyof typeof difficultyMap]}>
                  {exercise.difficulty}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col space-y-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Target className="h-4 w-4" />
                <span>{exercise.targetArea}</span>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Категории:</div>
                <div className="flex flex-wrap gap-2">
                  {exercise.categories.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Ползи:</div>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  {exercise.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-0.5 text-green-600 dark:text-green-400">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="mt-auto w-full" onClick={() => handleOpenModal(exercise)}>
                Виж упражнението
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Download Section */}
      <Card className="border-primary/20 from-primary/5 to-primary/10 border-2 bg-gradient-to-br">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-semibold">Изтеглете програмата</h3>
            <p className="text-muted-foreground text-sm">
              Свалете обособената програма с всички упражнения и стъпки за изпълнение, за да я имате винаги под ръка
            </p>
          </div>
          <DownloadButton fileName="mobilis_pose_correction.zip" />
        </CardContent>
      </Card>

      {/* Warning Alert */}
      <Alert
        variant="destructive"
        className="border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/50 dark:text-orange-200"
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="leading-relaxed text-pretty">
          Подбирането на тези упражнения е осъществено съвместно с физиотерапевти, в следствие на достатъчно
          консултации, но може да е необходима преоценка от специалист, за да се адаптират към индивидуалните ви нужди.
          В никакъв случай не поощряваме прескачането на лекарска препоръка.
        </AlertDescription>
      </Alert>

      {/* Exercise Modal */}
      {selectedExercise && (
        <ExerciseDetailModal open={modalOpen} onOpenChange={setModalOpen} exercise={selectedExercise} />
      )}
    </div>
  );
}
