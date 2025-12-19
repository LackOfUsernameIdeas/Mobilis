"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Target, Activity } from "lucide-react";
import ExerciseDetailModal from "./components/exercise-modal";
import DownloadButton from "./components/download-button";

const exercises = [
  {
    id: 1,
    name: "Chin Tucks",
    bgName: "Прибиране на брадичката",
    difficulty: "Лесно",
    categories: ["Стойка", "Сила"],
    targetArea: "Врат",
    repetitions: 3,
    benefits: [
      "Коригира изнесената напред стойка на главата",
      "Укрепва дълбоките екстензорни мускули на врата",
      "Намалява напрежението в шията",
    ],
    youtubeId: "7rnlAVhAK-8",
    steps: [
      "Неутрална стойка - 2 секунди",
      "Прибиране на брадичката - задържане по 5 секунди (3 повторения)",
      "Освобождаване - 3 секунди (между повторенията)",
    ],
  },
  {
    id: 2,
    name: "Neck Side Tilts",
    bgName: "Странични накланяния на врата",
    difficulty: "Лесно",
    categories: ["Мобилност", "Гъвкавост"],
    targetArea: "Врат",
    repetitions: 3,
    benefits: [
      "Увеличава гъвкавостта на врата",
      "Намалява напрежението в страничните шийни мускули",
      "Подобрява обхвата на движение",
    ],
    youtubeId: "Qmcvzz3PDh4",
    steps: [
      "Неутрална стойка - 2 секунди",
      "Наклон наляво - задържане по 5 секунди (3 повторения)",
      "Наклон надясно - задържане по 5 секунди (3 повторения)",
      "Връщане в неутрална позиция - 3 секунди (между движенията)",
    ],
  },
  {
    id: 3,
    name: "Shoulder Blade Squeezes",
    bgName: "Стискане на лопатките",
    difficulty: "Лесно",
    categories: ["Стойка", "Сила"],
    targetArea: "Лопатки и рамене",
    repetitions: 3,
    benefits: [
      "Коригира заоблянето на раменете",
      "Укрепва мускулите между лопатките",
      "Подобрява стойката на горната част на тялото",
    ],
    youtubeId: "ouRhQE2iOI8",
    steps: [
      "Неутрална стойка - 2 секунди",
      "Стискане на лопатките - задържане по 5 секунди (3 повторения)",
      "Освобождаване - 3 секунди (между повторенията)",
    ],
  },
  {
    id: 4,
    name: "Wall Angels",
    bgName: "Стенни ангели",
    difficulty: "Средно",
    categories: ["Мобилност", "Стойка"],
    targetArea: "Рамене и гръден кош",
    repetitions: 3,
    benefits: [
      "Отваря гръдния кош",
      "Увеличава подвижността на раменете",
      "Подобрява стойката при горната част на гърба",
    ],
    youtubeId: "cvx06snMQ3A",
    steps: [
      "Неутрална стойка - 2 секунди",
      "W форма (лакти свити) - задържане по 5 секунди (3 повторения)",
      "Y форма (ръце изпънати) - задържане по 5 секунди (3 повторения)",
    ],
  },
  {
    id: 5,
    name: "Standing T Stretch",
    bgName: "Разтягане тип T поза в изправено положение",
    difficulty: "Средно",
    categories: ["Мобилност", "Стойка"],
    targetArea: "Рамене и гръден кош",
    repetitions: 3,
    benefits: ["Отваря гръдния кош", "Подобрява стойката на раменете", "Увеличава подвижността на гръдната област"],
    youtubeId: "ta0OUynqEfw",
    steps: [
      "Неутрална стойка - 2 секунди",
      "Ръце напред - 1 секунда",
      "T позиция (ръце настрани) - задържане по 4 секунди (3 повторения)",
      "Връщане в стойка с ръце напред - задържане по 3 секунди (между повторенията)",
    ],
  },
  {
    id: 6,
    name: "Standing Pelvic Tilts",
    bgName: "Накланяне на таза в изправено положение",
    difficulty: "Средно",
    categories: ["Мобилност", "Контрол"],
    targetArea: "Таз и долна част на гърба",
    repetitions: 3,
    benefits: [
      "Увеличава подвижността на таза",
      "Подобрява контрола над долната част на гърба",
      "Намалява болката в областта на кръста",
    ],
    youtubeId: "eT2qo-Ut4vI",
    steps: [
      "Неутрална стойка - 2 секунди",
      "Преден наклон на таза - задържане по 5 секунди (3 повторения)",
      "Заден наклон на таза - задържане по 5 секунди (3 повторения)",
    ],
  },
  {
    id: 7,
    name: "Standing Lumbar Extensions",
    bgName: "Разтягане на кръста в изправено положение",
    difficulty: "Средно",
    categories: ["Сила", "Мобилност"],
    targetArea: "Долна част на гърба",
    repetitions: 3,
    benefits: [
      "Укрепва екстензорните мускули при долната част на гърба",
      "Подобрява подвижността в областта на кръста",
      "Намалява сковаността в долната част на гърба",
    ],
    youtubeId: "BeVqpwxfAdY",
    steps: [
      "Неутрална стойка - 2 секунди",
      "Навеждане назад с ръце на кръста - задържане по 4 секунди (3 повторения)",
      "Връщане в неутрална позиция - 3 секунди (между повторенията)",
    ],
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
              <CardTitle className="text-2xl">Специализирана програма за коригиране на стойката</CardTitle>
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
            <li>Повишаване на гъвкавостта и подвижността на врата, раменете, горната и долната част на гърба</li>
            <li>Намаляване на напрежението и болката, причинени от продължително стоене с неправилна стойка</li>
            <li>Развитие на баланс и контрол, което предпазва тялото от травми и претоварвания</li>
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
                  <p className="text-muted-foreground text-sm">{exercise.bgName}</p>
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
                      <span className="text-green-600 dark:text-green-400">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Стъпки:</div>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  {exercise.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary font-medium">{idx + 1}.</span>
                      <span>{step}</span>
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
            <h3 className="text-xl font-semibold">Приложение с камера за следене на изпълнението на упражненията</h3>
            <p className="text-muted-foreground text-sm">
              Свалете разработеното от нас приложение, което включва всички упражнения и стъпки за изпълнение. То работи
              с камерата <strong>Orbbec Astra+</strong> и целта му е да следи за правилното изпълнение на стъпките в
              реално време, като сравнява движенията на потребителя с правилната техника за всяко от тях
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
