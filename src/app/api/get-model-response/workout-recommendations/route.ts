import { saveUserPreferences, saveWorkoutRecommendations } from "@/server/saveFunctions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, category, answers, userStats } = await req.json();

    if (!category || !userId || !answers) {
      return NextResponse.json({ error: "Category, user id and answers are required" }, { status: 400 });
    }

    await saveUserPreferences(userId, category, answers);

    const systemPrompt = generateSystemPrompt(category);
    const userPrompt = generateUserPrompt(category, answers, userStats);
    const responseFormat = generateResponseFormat(category);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.2",
        input: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        text: responseFormat,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const workoutRecommendations = data.output[0].content[0].text;

    const workoutProgramParsed = JSON.parse(workoutRecommendations);
    await saveWorkoutRecommendations(userId, category, workoutProgramParsed);

    return NextResponse.json(workoutRecommendations);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}

function generateSystemPrompt(category: string): string | undefined {
  if (category === "gym") {
    return "Ти си професионален фитнес треньор. Задачата ти е да създаваш персонализирани тренировъчни програми на база предоставените данни за потребителя. Винаги отговаряй САМО с валиден JSON формат, без допълнителен текст или markdown.";
  } else if (category === "calisthenics") {
    return "Ти си професионален треньор по калистеника. Задачата ти е да създаваш персонализирани калистенични тренировъчни програми (упражнения, използващи САМО теглото на собственото тяло) на база предоставените данни за потребителя. Винаги отговаряй САМО с валиден JSON формат, без допълнителен текст или markdown.";
  } else if (category === "yoga") {
    return "Ти си професионален йога инструктор. Задачата ти е да създаваш персонализирани йога програми на база предоставените данни за потребителя. Винаги отговаряй САМО с валиден JSON формат, без допълнителен текст или markdown.";
  }
}

function generateUserPrompt(category: string, answers: Record<string, any>, userStats?: any): string {
  if (category === "gym") {
    return `Създай персонализирана седмична фитнес програма за потребител със следните характеристики:

      **Лични данни:**
      - Пол: ${userStats?.gender || "не е посочен"}
      - Височина: ${userStats?.height || "не е посочена"} см
      - Тегло: ${userStats?.weight || "не е посочено"} кг
      - Възраст: ${userStats?.age || "не е посочена"} години
      - BMI: ${userStats?.bmi || "не е изчислен"} (при здравословен диапазон: 18.5-25)
      - Body Fat: ${userStats?.bodyFat || "не е изчислен"}%
      - Маса на телесните мазнини: ${userStats?.bodyFatMass || "не е изчислена"} кг
      - Чиста телесна маса: ${userStats?.leanBodyMass || "не е изчислена"} кг

      **Тренировъчни предпочитания:**
      - Цел: ${answers.mainGoal || "не е посочена"}
      - Ниво на опит: ${answers.experience || "не е посочено"}
      - Честота на тренировки: ${answers.frequency || "не е посочена"} дни седмично
      - Загряване преди и разтягане след тренировка: ${answers.warmupCooldown || "не е посочено"}
      - Фокус върху конкретна мускулна група: ${answers.muscleGroups || "Нямам предпочитания"}
      - Целево тегло: ${answers.targetWeight === "yes" ? answers.targetWeightValue : "не е посочено"} кг 
      - Здравословни проблеми, контузии или ограничения: ${answers.healthIssues || "Няма"}
      - Специфични упражнения за включване: ${answers.specificExercises || "Няма"}

      Важни насоки:
      - Вземи предвид личните данни и целта на потребителя
      - При цел 'cut' се фокусирай върху упражнения за запазване на мускулна маса и сила при калориен дефицит с умерени повторения (8-12)
      - При цел 'aggressive_cut' се фокусирай върху запазване на мускулна маса при значителен калориен дефицит с по-високи повторения (12-15), комбинирай основни съставни упражнения с кардио сесии
      - При цел 'lean_bulk' се фокусирай върху упражнения с прогресивно натоварване и набиране на чиста мускулна маса и умерени повторения (6-12)
      - При цел 'dirty_bulk' препоръчвай тежки съставни упражнения с по-малко повторения (4-8) за максимален мускулен растеж и сила
      - При цел 'recomposition' балансирай между силови и хипертрофични упражнения, комбинирай средни тежести с разнообразен диапазон на повторения (6-15)
      - При цел 'maintenance' препоръчвай упражнения за поддържане на текущата форма с балансиран обем и интензивност, умерени повторения (8-12)
      - При цел 'aesthetic' се фокусирай върху симетрията и пропорциите на тялото, препоръчвай изолационни упражнения с по-високи повторения (10-15)
      - При цел 'strength' приоритизирай тежки съставни упражнения с ниски повторения (1-6) и дълги паузи за почивка
      - Адаптирай програмата с посочената информация за здравословни проблеми, ако има такава (избягвай упражнения, които биха влошили здравословното състояние на потребителя или дай алтернативни упражнения)
      - exercise_name винаги трябва да съдържа само официалното наименование на упражнението (например: "Barbell Bench Press", "Deadlift", "Lat Pulldown")
      - exercise_id ВИНАГИ трябва да следва следния формат: име на упражнението в **единствено число** (например: "barbell_bench_press", а не "barbell_bench_presses"), малки букви, разделени с долна черта. Ако има по-сложна дума, съставена от две или повече думи (например "skullcrusher"), тя също трябва да се раздели на отделни думи с долна черта, например: "skull_crusher", "barbell_bench_press", "deadlift", "lat_pulldown"
      - Относно информацията за повторения, използвай формат като "8-12" за диапазон или "10" за точен брой
      - muscle_activation трябва да отразява точно кои мускули се активират (true/false)
      
      **КРИТИЧНО ВАЖНО - ЗАДЪЛЖИТЕЛНИ ПРАВИЛА ЗА ЕЗИК И ФОРМАТ:**
      - day: ВИНАГИ използвай формат "Ден 1", "Ден 2", "Ден 3", "Ден 4" и т.н. (НИКОГА "Day 1", "Day 2")
      - focus: ВИНАГИ на БЪЛГАРСКИ (например: "Горна част на тялото", "Долна част на тялото + коремни мускули")
      - warmup.exercises: ВСИЧКИ упражнения и обяснения САМО на БЪЛГАРСКИ (например: "5 минути бързо ходене или леко каране на колело", "Кръгови движения с ръцете", "Леки загряващи серии")
      - cooldown.exercises: ВСИЧКИ упражнения и обяснения САМО на БЪЛГАРСКИ (например: "Статично разтягане на гърдите", "Разтягане на трицепс над главата")
      - safety_considerations: ДО 3 съвета и ВСИЧКИ да са на български`;
  } else if (category === "calisthenics") {
    return `Създай персонализирана седмична калистенична програма за потребител със следните характеристики:

      **Лични данни:**
      - Пол: ${userStats?.gender || "не е посочен"}
      - Височина: ${userStats?.height || "не е посочена"} см
      - Тегло: ${userStats?.weight || "не е посочено"} кг
      - Възраст: ${userStats?.age || "не е посочена"} години
      - BMI: ${userStats?.bmi || "не е изчислен"} (при здравословен диапазон: 18.5-25)
      - Body Fat: ${userStats?.bodyFat || "не е изчислен"}%
      - Маса на телесните мазнини: ${userStats?.bodyFatMass || "не е изчислена"} кг
      - Чиста телесна маса: ${userStats?.leanBodyMass || "не е изчислена"} кг

      **Тренировъчни предпочитания:**
      - Цел: ${answers.mainGoal || "не е посочена"}
      - Ниво на опит: ${answers.experience || "не е посочено"}
      - Честота на тренировки: ${answers.frequency || "не е посочена"} дни седмично
      - Загряване преди и разтягане след тренировка: ${answers.warmupCooldown || "не е посочено"}
      - Фокус върху конкретна мускулна група: ${answers.muscleGroups || "Нямам предпочитания"}
      - Целево тегло: ${answers.targetWeight === "yes" ? answers.targetWeightValue : "не е посочено"} кг 
      - Здравословни проблеми, контузии или ограничения: ${answers.healthIssues || "Няма"}
      - Специфични упражнения за включване: ${answers.specificExercises || "Няма"}

      **Важни насоки за калистениката:**
      - Препоръчвай САМО калистенични упражнения (упражнения, използващи теглото на собственото тяло)
      - Забранени са всякакви упражнения с тежести, дъмбели, щанги или машини
      - При цел 'cut' се фокусирай върху калистенични упражнения за запазване на мускулна маса при калориен дефицит с умерени повторения (10-15), използвай умерени вариации
      - При цел 'aggressive_cut' се фокусирай върху запазване на мускулна маса при значителен калориен дефицит с по-високи повторения (12-20), комбинирай с кардио упражнения
      - При цел 'lean_bulk' препоръчвай по-трудни прогресивни вариации на калистеничните упражнения с умерени повторения (8-15)
      - При цел 'dirty_bulk' препоръчвай най-трудните калистенични вариации с по-малко повторения (5-10) и допълнителни сетове
      - При цел 'recomposition' балансирай между различни калистенични вариации с разнообразен диапазон на повторения (8-20)
      - При цел 'maintenance' препоръчвай умерени калистенични вариации за поддържане на текущата форма (10-15 повторения)
      - При цел 'aesthetic' се фокусирай върху изолационни калистенични упражнения с по-високи повторения (12-20)
      - При цел 'strength' приоритизирай най-трудните калистенични вариации с ниски повторения (3-8) и дълги паузи за почивка
      - При начинаещи препоръчвай по-леки вариации (knee push-ups, assisted pull-ups, wall push-ups)
      - При по-напреднали препоръчвай по-трудни вариации (one-arm push-ups, muscle-ups, pistol squats, planche)
      - Адаптирай програмата с посочената информация за здравословни проблеми, ако има такава
      - exercise_name винаги трябва да съдържа само официалното наименование на калистеничното упражнение (например: "Push-Ups", "Pull-Ups", "Dips", "Squats", "Plank")
      - Стреми се да посочваш конкретна вариация на упражненията (например: "Diamond Push-Ups", "Archer Pull-Ups", "Bulgarian Split Squats")
      - exercise_id ВИНАГИ трябва да следва следния формат: име на упражнението в **единствено число** (например: "push_up", а не "push_ups"), малки букви, разделени с долна черта. Ако има по-сложна дума, съставена от две или повече думи (например "handstand"), тя също трябва да се раздели на отделни думи с долна черта, например: "hand_stand", "diamond_push_ups", "archer_pull_ups", "bulgarian_split_squats"
      - Относно информацията за повторения, използвай формат като "12-20" за диапазон или "15" за точен брой
      - muscle_activation трябва да отразява точно кои мускули се активират (true/false)
      
      **КРИТИЧНО ВАЖНО - ЗАДЪЛЖИТЕЛНИ ПРАВИЛА ЗА ЕЗИК И ФОРМАТ:**
      - day: ВИНАГИ използвай формат "Ден 1", "Ден 2", "Ден 3", "Ден 4" и т.н. (НИКОГА "Day 1", "Day 2")
      - focus: ВИНАГИ на БЪЛГАРСКИ (например: "Горна част на тялото", "Долна част на тялото + коремни мускули")
      - warmup.exercises: ВСИЧКИ упражнения и обяснения САМО на БЪЛГАРСКИ (например: "5 минути бързо ходене или леко каране на колело", "Кръгови движения с ръцете", "Леки загряващи серии")
      - cooldown.exercises: ВСИЧКИ упражнения и обяснения САМО на БЪЛГАРСКИ (например: "Статично разтягане на гърдите", "Разтягане на трицепс над главата")
      - safety_considerations: ДО 3 съвета и ВСИЧКИ да са на български`;
  } else if (category === "yoga") {
    return `Създай персонализирана седмична йога програма за потребител със следните предпочитания:

      **Предпочитания за йога практика:**
      - Цел: ${answers.mainGoal || "не е посочена"}
      - Предпочитан стил: ${answers.yogaStyle || "нямам предпочитания"}
      - Ниво на опит: ${answers.experience || "не е посочено"}
      - Честота на практики: ${answers.frequency || "не е посочена"} дни седмично
      - Програмата да включва ли загряване преди и Shavasana (медитация) след йогата: ${answers.warmupSavasana || "не е посочено"}
      - Фокус върху конкретна област: ${answers.focusArea || "Нямам предпочитания"}
      - Здравословни проблеми, контузии или ограничения: ${answers.healthIssues || "Няма"}
      - Специфични пози за включване: ${answers.specificExercises || "Няма"}

      **Важни насоки за йога:**
      - Препоръчвай САМО йога пози (асани) и йога практики

      **Цели и подход:**
      - При цел 'flexibility_and_balance' се фокусирай върху пози за разтягане, гъвкавост и баланс
      - При цел 'stress_relief_and_relaxation' препоръчвай възстановителна yoga, бавни движения и дихателни техники (пранаяма)
      - При цел 'strength_and_endurance' препоръчвай динамични йога стилове (Vinyasa, Power Yoga, Ashtanga) с по-силови пози
      - При цел 'mindfulness_and_meditation' балансирай между медитативни пози, бавни движения и пранаяма
      - При цел 'posture_and_alignment' се фокусирай върху упражнения, коригиращи стойката и гръбначния стълб
      - При цел 'energy_boost' препоръчвай активни последователности от движения, които биха имали ободряващо въздействие

      **Стилове на йога:**
      - При стил 'hatha' препоръчвай по-бавно темпо с фокус върху точна стойка и задържане на позите (30-60 секунди)
      - При стил 'vinyasa' създавай плавни последователности с координация между движение и дишане
      - При стил 'yin' препоръчвай пасивни пози с дълго задържане (3-5 минути) за дълбоко разтягане на съединителната тъкан
      - При стил 'power_yoga' фокусирай се върху динамични силови пози с по-високо темпо и физическо натоварване
      - При стил 'restorative' препоръчвай много леки, възстановителни пози за максимална релаксация
      - При 'нямам предпочитания' комбинирай елементи от различни стилове според целта

      **Ниво на опит:**
      - При 'beginner' ниво препоръчвай по-леки вариации на упражненията с реквизити (блокчета, колани, одеяла)
      - При 'basic' ниво включвай основни пози с правилна техника и леки вариации
      - При 'intermediate' ниво добавяй по-сложни вариации и по-дълго задържане
      - При 'advanced' ниво препоръчвай сложни пози и вариации (инверсии, баланс на ръцете, силни навеждания)
      - При 'expert' ниво включвай най-предизвикателните пози и вариации

      **Структура на практиката:**
      - При 'Да' за пълна структура:
        * warmup трябва да включва: Центриране/медитация (1-2 мин), Пранаяма/дихателни техники (2-3 мин), Sun Salutations (Surya Namaskar)
        * cooldown трябва да включва: Gentle stretches, Shavasana (5-10 минути финална релаксация)
      - При 'Не' за пълна структура:
        * warmup: Само леки подготвителни пози (Cat-Cow, Child's Pose)
        * cooldown: Кратки заключителни разтягания

      **Фокус области:**
      - Адаптирай избора на пози според посочените области на фокус (гръб, тазобедрени стави, рамене, core, крака, дишане)
      - Ако няма специфичен фокус, създавай балансирана практика за цялото тяло

      **Здравословни съображения:**
      - Адаптирай програмата с посочената информация за здравословни проблеми, ако има такава
      - Избягвай или модифицирай пози, които биха могли да влошат състоянието
      - Винаги давай по-леки алтернативи за начинаещи

      **Наименования:**
      - exercise_name винаги трябва да съдържа официалното наименование на йога позата на английски и санскрит в скоби (например: "Downward Facing Dog (Adho Mukha Svanasana)", "Warrior I (Virabhadrasana I)", "Tree Pose (Vrksasana)")
      - exercise_id ВИНАГИ трябва да следва следния формат: име на упражнението в **единствено число** (например: "downward_facing_dog", а не "downward_facing_dogs"), малки букви, разделени с долна черта. Ако има по-сложна дума, съставена от две или повече думи (например "sunbird"), тя също трябва да се раздели на отделни думи с долна черта, например: "sun_bird", "downward_facing_dog", "warrior_i", "tree_pose". НИКОГА НЕ ДОБАВЯЙ думата "pose".
      - При нужда от модификация посочвай конкретната вариация (например: "Modified Chaturanga", "Supported Headstand", "Half Pigeon Pose")

      **Повторения и задържане:**
      - За статични пози използвай формат: "5-8 дишания" или "30-60 секунди" или "1-2 минути"
      - За обозначаване на последователността от движения използвай: "3-5 цикъла" или "5-10 повторения"
      - За Yin пози използвай: "3-5 минути"
      - За Vinyasa движения посочвай броя цикли на Sun Salutations

      **Активация на мускули:**
      - muscle_activation трябва да отразява точно кои мускули се активират в позата (true/false)
      - Бъди прецизен - различните пози активират различни мускулни групи
      
      **КРИТИЧНО ВАЖНО - ЗАДЪЛЖИТЕЛНИ ПРАВИЛА ЗА ЕЗИК И ФОРМАТ:**
      - day: ВИНАГИ използвай формат "Ден 1", "Ден 2", "Ден 3", "Ден 4" и т.н. (НИКОГА "Day 1", "Day 2")
      - focus: ВИНАГИ на БЪЛГАРСКИ (например: "Гъвкавост и баланс - фокус върху тазобедрените стави", "Сила и издръжливост - динамична последователност")
      - warmup.exercises: ВСИЧКИ упражнения и обяснения САМО на БЪЛГАРСКИ (например: "Центриране и медитация (1-2 минути)", "Дихателни техники - дълбоко коремно дишане (2-3 минути)", "Слънчеви поздрави (Сурия Намаскар) - 3-5 цикъла")
      - cooldown.exercises: ВСИЧКИ упражнения и обяснения САМО на БЪЛГАРСКИ (например: "Леки разтягания в седнало положение", "Шавасана - финална релаксация (5-10 минути)")
      - safety_considerations: ДО 3 съвета и ВСИЧКИ да са на български`;
  }

  // Placeholder
  return `Създай персонализирана програма за ${category} въз основа на следните данни: ${JSON.stringify(answers)}`;
}

function generateResponseFormat(category: string) {
  if (category === "gym") {
    return {
      format: {
        type: "json_schema",
        name: "fitness_program",
        strict: true,
        schema: {
          type: "object",
          properties: {
            weekly_schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: {
                    type: "string",
                  },
                  focus: {
                    type: "string",
                  },
                  warmup: {
                    type: "object",
                    properties: {
                      duration_minutes: {
                        type: "number",
                      },
                      exercises: {
                        type: "array",
                        items: {
                          type: "string",
                        },
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
                        exercise_name: {
                          type: "string",
                        },
                        exercise_id: {
                          type: "string",
                        },
                        sets: {
                          type: "number",
                        },
                        reps: {
                          type: "string",
                        },
                        muscle_activation: {
                          type: "object",
                          properties: {
                            chest: {
                              type: "boolean",
                            },
                            front_delts: {
                              type: "boolean",
                            },
                            side_delts: {
                              type: "boolean",
                            },
                            rear_delts: {
                              type: "boolean",
                            },
                            biceps: {
                              type: "boolean",
                            },
                            triceps: {
                              type: "boolean",
                            },
                            forearms: {
                              type: "boolean",
                            },
                            traps: {
                              type: "boolean",
                            },
                            lats: {
                              type: "boolean",
                            },
                            lower_back: {
                              type: "boolean",
                            },
                            abs: {
                              type: "boolean",
                            },
                            obliques: {
                              type: "boolean",
                            },
                            quadriceps: {
                              type: "boolean",
                            },
                            hamstrings: {
                              type: "boolean",
                            },
                            glutes: {
                              type: "boolean",
                            },
                            calves: {
                              type: "boolean",
                            },
                            adductors: {
                              type: "boolean",
                            },
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
                      required: ["exercise_name", "exercise_id", "sets", "reps", "muscle_activation"],
                      additionalProperties: false,
                    },
                  },
                  cooldown: {
                    type: "object",
                    properties: {
                      duration_minutes: {
                        type: "number",
                      },
                      exercises: {
                        type: "array",
                        items: {
                          type: "string",
                        },
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
              items: {
                type: "string",
              },
            },
          },
          required: ["weekly_schedule", "safety_considerations"],
          additionalProperties: false,
        },
      },
    };
  } else if (category === "calisthenics") {
    return {
      format: {
        type: "json_schema",
        name: "calisthenics_program",
        strict: true,
        schema: {
          type: "object",
          properties: {
            weekly_schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: {
                    type: "string",
                  },
                  focus: {
                    type: "string",
                  },
                  warmup: {
                    type: "object",
                    properties: {
                      duration_minutes: {
                        type: "number",
                      },
                      exercises: {
                        type: "array",
                        items: {
                          type: "string",
                        },
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
                        exercise_name: {
                          type: "string",
                        },
                        exercise_id: {
                          type: "string",
                        },
                        sets: {
                          type: "number",
                        },
                        reps: {
                          type: "string",
                        },
                        muscle_activation: {
                          type: "object",
                          properties: {
                            chest: {
                              type: "boolean",
                            },
                            front_delts: {
                              type: "boolean",
                            },
                            side_delts: {
                              type: "boolean",
                            },
                            rear_delts: {
                              type: "boolean",
                            },
                            biceps: {
                              type: "boolean",
                            },
                            triceps: {
                              type: "boolean",
                            },
                            forearms: {
                              type: "boolean",
                            },
                            traps: {
                              type: "boolean",
                            },
                            lats: {
                              type: "boolean",
                            },
                            lower_back: {
                              type: "boolean",
                            },
                            abs: {
                              type: "boolean",
                            },
                            obliques: {
                              type: "boolean",
                            },
                            quadriceps: {
                              type: "boolean",
                            },
                            hamstrings: {
                              type: "boolean",
                            },
                            glutes: {
                              type: "boolean",
                            },
                            calves: {
                              type: "boolean",
                            },
                            adductors: {
                              type: "boolean",
                            },
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
                      required: ["exercise_name", "exercise_id", "sets", "reps", "muscle_activation"],
                      additionalProperties: false,
                    },
                  },
                  cooldown: {
                    type: "object",
                    properties: {
                      duration_minutes: {
                        type: "number",
                      },
                      exercises: {
                        type: "array",
                        items: {
                          type: "string",
                        },
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
              items: {
                type: "string",
              },
            },
          },
          required: ["weekly_schedule", "safety_considerations"],
          additionalProperties: false,
        },
      },
    };
  } else if (category === "yoga") {
    return {
      format: {
        type: "json_schema",
        name: "yoga_program",
        strict: true,
        schema: {
          type: "object",
          properties: {
            weekly_schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: {
                    type: "string",
                  },
                  focus: {
                    type: "string",
                  },
                  warmup: {
                    type: "object",
                    properties: {
                      duration_minutes: {
                        type: "number",
                      },
                      exercises: {
                        type: "array",
                        items: {
                          type: "string",
                        },
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
                        exercise_name: {
                          type: "string",
                        },
                        exercise_id: {
                          type: "string",
                        },
                        sets: {
                          type: "number",
                        },
                        reps: {
                          type: "string",
                        },
                        muscle_activation: {
                          type: "object",
                          properties: {
                            chest: {
                              type: "boolean",
                            },
                            front_delts: {
                              type: "boolean",
                            },
                            side_delts: {
                              type: "boolean",
                            },
                            rear_delts: {
                              type: "boolean",
                            },
                            biceps: {
                              type: "boolean",
                            },
                            triceps: {
                              type: "boolean",
                            },
                            forearms: {
                              type: "boolean",
                            },
                            traps: {
                              type: "boolean",
                            },
                            lats: {
                              type: "boolean",
                            },
                            lower_back: {
                              type: "boolean",
                            },
                            abs: {
                              type: "boolean",
                            },
                            obliques: {
                              type: "boolean",
                            },
                            quadriceps: {
                              type: "boolean",
                            },
                            hamstrings: {
                              type: "boolean",
                            },
                            glutes: {
                              type: "boolean",
                            },
                            calves: {
                              type: "boolean",
                            },
                            adductors: {
                              type: "boolean",
                            },
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
                      required: ["exercise_name", "exercise_id", "sets", "reps", "muscle_activation"],
                      additionalProperties: false,
                    },
                  },
                  cooldown: {
                    type: "object",
                    properties: {
                      duration_minutes: {
                        type: "number",
                      },
                      exercises: {
                        type: "array",
                        items: {
                          type: "string",
                        },
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
              items: {
                type: "string",
              },
            },
          },
          required: ["weekly_schedule", "safety_considerations"],
          additionalProperties: false,
        },
      },
    };
  }
}
