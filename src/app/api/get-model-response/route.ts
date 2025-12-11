import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { category, answers, userStats } = await req.json();

    if (!category || !answers) {
      return NextResponse.json({ error: "Category and answers are required" }, { status: 400 });
    }

    // Generate the prompt based on category
    const prompt = generatePrompt(category, answers, userStats);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.1",
        input: [
          {
            role: "system",
            content:
              "Ти си професионален фитнес треньор с много години опит. Задачата ти е да създаваш персонализирани тренировъчни програми на база предоставените данни за потребителя. Винаги отговаряй САМО с валиден JSON формат, без допълнителен текст или markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "fitness_program",
            strict: true,
            schema: {
              type: "object",
              properties: {
                program_overview: {
                  type: "object",
                  properties: {
                    goal: { type: "string" },
                    estimated_time_per_session: { type: "string" },
                  },
                  required: ["goal", "estimated_time_per_session"],
                  additionalProperties: false,
                },
                weekly_schedule: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "string" },
                      focus: { type: "string" },
                      warmup: {
                        type: "object",
                        properties: {
                          duration_minutes: { type: "number" },
                          exercises: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                        required: ["duration_minutes", "exercises"],
                        additionalProperties: false,
                      },
                      workout: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            exercise_name: { type: "string" },
                            sets: { type: "number" },
                            reps: { type: "string" },
                            muscle_activation: {
                              type: "object",
                              properties: {
                                chest: { type: "boolean" },
                                front_delts: { type: "boolean" },
                                side_delts: { type: "boolean" },
                                rear_delts: { type: "boolean" },
                                biceps: { type: "boolean" },
                                triceps: { type: "boolean" },
                                forearms: { type: "boolean" },
                                traps: { type: "boolean" },
                                lats: { type: "boolean" },
                                rhomboids: { type: "boolean" },
                                lower_back: { type: "boolean" },
                                abs: { type: "boolean" },
                                obliques: { type: "boolean" },
                                quadriceps: { type: "boolean" },
                                hamstrings: { type: "boolean" },
                                glutes: { type: "boolean" },
                                calves: { type: "boolean" },
                                adductors: { type: "boolean" },
                              },
                              required: [
                                "chest",
                                "front_delts",
                                "side_delts",
                                "rear_delts",
                                "biceps",
                                "triceps",
                                "forearms",
                                "traps",
                                "lats",
                                "rhomboids",
                                "lower_back",
                                "abs",
                                "obliques",
                                "quadriceps",
                                "hamstrings",
                                "glutes",
                                "calves",
                                "adductors",
                              ],
                              additionalProperties: false,
                            },
                          },
                          required: ["exercise_name", "sets", "reps", "muscle_activation"],
                          additionalProperties: false,
                        },
                      },
                      cooldown: {
                        type: "object",
                        properties: {
                          duration_minutes: { type: "number" },
                          exercises: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                        required: ["duration_minutes", "exercises"],
                        additionalProperties: false,
                      },
                    },
                    required: ["day", "focus", "warmup", "workout", "cooldown"],
                    additionalProperties: false,
                  },
                },
                safety_considerations: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["program_overview", "weekly_schedule", "safety_considerations"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data.output[0].content[0].text);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}

function generatePrompt(category: string, answers: Record<string, any>, userStats?: any): string {
  if (category === "gym") {
    return `Създай персонализирана седмична фитнес програма за потребител със следните характеристики:

**Лични данни:**
- Пол: ${userStats?.gender || "не е посочен"}
- Височина: ${userStats?.height || "не е посочена"} см
- Тегло: ${userStats?.weight || "не е посочено"} кг
- BMI: ${userStats?.bmi || "не е изчислен"} (при здравословен диапазон: 18.5-25)
- Body Fat: ${userStats?.bodyFat || "не е изчислен"}%
- Маса на телесните мазнини: ${userStats?.fatMass || "не е изчислена"} кг
- Чиста телесна маса: ${userStats?.leanMass || "не е изчислена"} кг

**Тренировъчни предпочитания:**
- Цел: ${answers.goal || "не е посочена"}
- Ниво на опит: ${answers.experience || "не е посочено"}
- Честота на тренировки: ${answers.frequency || "не е посочена"} дни седмично
- Загряване преди и разтягане след тренировка: ${answers.warmupCooldown || "не е посочено"}
- Фокус върху конкретна мускулна група: ${answers.muscleGroupFocus || "Нямам предпочитания"}
- Целево тегло: ${answers.targetWeight || "не е посочено"} кг 
- Здравословни проблеми, контузии или ограничения: ${answers.healthIssues || "Няма"}
- Специфични упражнения за включване: ${answers.specificExercises || "Нямам предпочитания"}

Важни насоки:
- Вземи предвид личните данни и целта на потребителя
- При цел 'cut' се фокусирай върху упражнения за запазване на мускулна маса при калориен дефицит с умерени до високи повторения (10-15)
- При цел 'lean_bulk' се фокусирай върху упражнения с прогресивно натоварване и набиране на чиста мускулна маса и умерени повторения (6-12)
- При цел 'dirty_bulk' препоръчвай тежки съставни упражнения с по-малко повторения (4-8) за максимален мускулен растеж и сила
- При цел 'recomposition' балансирай между силови и хипертрофични упражнения, комбинирай средни тежести с разнообразен диапазон на повторения (6-15)
- При цел 'maintenance' препоръчвай упражнения за поддържане на текущата форма с балансиран обем и интензивност, умерени повторения (8-12)
- При цел 'aesthetic' се фокусирай върху симетрията и пропорциите на тялото, препоръчвай изолационни упражнения с по-високи повторения (10-15)
- При цел 'strength' приоритизирай тежки съставни упражнения с ниски повторения (1-6) и дълги паузи за почивка
- Адаптирай програмата с посочената информация за здравословни проблеми, ако има такава (избягвай упражнения, които биха влошили здравословното състояние на потребителя или дай алтернативни упражнения)
- exercise_name винаги трябва да съдържа само официалното наименование на упражнението (например: "Barbell Bench Press", "Deadlift", "Lat Pulldown")
- Относно информацията за повторения, използвай формат като "8-12" за диапазон или "10" за точен брой
- muscle_activation трябва да отразява точно кои мускули се активират (true/false)`;
  }

  // Placeholder for other categories
  return `Създай персонализирана програма за ${category} въз основа на следните данни: ${JSON.stringify(answers)}`;
}
