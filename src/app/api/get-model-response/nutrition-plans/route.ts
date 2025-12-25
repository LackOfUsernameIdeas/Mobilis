// import { saveUserPreferences, saveNutritionRecommendations } from "@/server/saveFunctions";
import { saveUserPreferences } from "@/server/saveFunctions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, category, answers, userStats } = await req.json();

    if (!category || !userId || !answers) {
      return NextResponse.json({ error: "Category, user id and answers are required" }, { status: 400 });
    }

    console.log("userPreferences: ", userId, category, answers);
    // await saveUserPreferences(userId, category, answers);

    const systemPrompt = generateSystemPrompt();
    const userPrompt = generateUserPrompt(answers, userStats);
    const responseFormat = generateResponseFormat();

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
    const nutritionRecommendations = data.output[0].content[0].text;

    const nutritionPlanParsed = JSON.parse(nutritionRecommendations);
    // await saveNutritionRecommendations(userId, category, nutritionPlanParsed);

    return NextResponse.json(nutritionRecommendations);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}

function generateSystemPrompt(): string {
  return `Ти си професионален диетолог и нутриционист. Задачата ти е да създаваш персонализирани хранителни планове на база предоставените данни за потребителя. Винаги отговаряй САМО с валиден JSON формат, без допълнителен текст или markdown.

КРИТИЧНО ВАЖНО - Структура на хранителния план според времето на тренировка:
- Ако тренировката е СУТРИН (05:00-10:00): План трябва да включва -> Закуска → Предтренировъчна закуска → Тренировка → Следтренировъчна закуска → Обяд → Следобедна закуска → Вечеря
- Ако тренировката е ОБЕД (11:00-14:00): План трябва да включва -> Закуска → Предобедна закуска → Предтренировъчна закуска → Тренировка → Следтренировъчна закуска (Обяд) → Следобедна закуска → Вечеря
- Ако тренировката е СЛЕДОБЕД (15:00-18:00): План трябва да включва -> Закуска → Предобедна закуска → Обяд → Предтренировъчна закуска → Тренировка → Следтренировъчна закуска → Вечеря
- Ако тренировката е ВЕЧЕР (19:00-23:00): План трябва да включва -> Закуска → Предобедна закуска → Обяд → Следобедна закуска → Предтренировъчна закуска → Тренировка → Следтренировъчна закуска/Вечеря

ВАЖНО за предтренировъчни и следтренировъчни храни:
- Предтренировъчната закуска трябва да е 45-90 минути ПРЕДИ посоченото време на тренировка
- Следтренировъчната закуска трябва да е в рамките на 30-60 минути СЛЕД тренировката
- Предтренировъчната закуска: Фокус върху лесно смилаеми въглехидрати и умерени протеини (например: банан с фъстъчено масло, овесена каша, протеинов шейк)
- Следтренировъчната закуска: Фокус върху протеини и въглехидрати за възстановяване (например: пилешко филе с ориз, риба с картофи, протеинов шейк с плодове)`;
}

function generateUserPrompt(answers: Record<string, any>, userStats?: any): string {
  // Determine meal timing based on training time
  const trainingTime = answers.trainingTime || "12:00";
  const [hours] = trainingTime.split(":").map(Number);

  let mealStructure = "";
  let trainingPeriod = "";

  if (hours >= 5 && hours < 11) {
    trainingPeriod = "СУТРИН";
    mealStructure =
      "Закуска → Предтренировъчна закуска → Следтренировъчна закуска → Обяд → Следобедна закуска → Вечеря";
  } else if (hours >= 11 && hours < 15) {
    trainingPeriod = "ОБЕД";
    mealStructure =
      "Закуска → Предобедна закуска → Предтренировъчна закуска → Следтренировъчна закуска (Обяд) → Следобедна закуска → Вечеря";
  } else if (hours >= 15 && hours < 19) {
    trainingPeriod = "СЛЕДОБЕД";
    mealStructure =
      "Закуска → Предобедна закуска → Обяд → Предтренировъчна закуска → Следтренировъчна закуска → Вечеря";
  } else {
    trainingPeriod = "ВЕЧЕР";
    mealStructure =
      "Закуска → Предобедна закуска → Обяд → Следобедна закуска → Предтренировъчна закуска → Следтренировъчна закуска/Вечеря";
  }

  return `Създай персонализиран седмичен хранителен план за потребител със следните характеристики:

**Лични данни:**
- Пол: ${userStats?.gender || "не е посочен"}
- Височина: ${userStats?.height || "не е посочена"} см
- Тегло: ${userStats?.weight || "не е посочено"} кг
- Възраст: ${userStats?.age || "не е посочена"} години
- BMI: ${userStats?.bmi || "не е изчислен"}
- Body Fat: ${userStats?.bodyFat || "не е изчислен"}%
- Маса на телесните мазнини: ${userStats?.bodyFatMass || "не е изчислена"} кг
- Чиста телесна маса: ${userStats?.leanBodyMass || "не е изчислена"} кг

**Хранителни предпочитания и цели:**
- Основна цел: ${answers.mainGoal || "не е посочена"}
- Време на тренировка: ${trainingTime} (${trainingPeriod})
- Целево тегло: ${answers.targetWeight === "yes" ? answers.targetWeightValue + " кг" : "не е посочено"}
- Дневни калории: ${answers.calories || "не е посочено"} kcal
- Дневни протеини: ${answers.protein || "не е посочено"} g
- Дневни въглехидрати: ${answers.carbs || "не е посочено"} g
- Дневни мазнини: ${answers.fats || "не е посочено"} g
- Здравословни проблеми или алергии: ${answers.healthIssues || "Няма"}
- Предпочитани кухни: ${answers.cuisinePreference?.join(", ") || "Нямам предпочитания"}

**СТРУКТУРА НА ХРАНЕНИЯТА:**
Тренировката е в ${trainingPeriod} (${trainingTime}), следователно структурата трябва да е:
${mealStructure}

**Важни насоки за хранителния план:**

**Общи правила:**
- Разпредели храненията през деня така, че да се покрият дневните нутриенти (${answers.calories} kcal, ${answers.protein}g протеини, ${answers.carbs}g въглехидрати, ${answers.fats}g мазнини)
- Всяко хранене трябва да има точни порции и грамаж на съставките
- meal_id ВИНАГИ трябва да следва формата: "meal_" + тип на храненето на английски с малки букви и долни черти (например: "meal_breakfast", "meal_pre_workout_snack", "meal_post_workout_snack", "meal_lunch", "meal_afternoon_snack", "meal_dinner")
- Адаптирай рецептите според предпочитаните кухни (${answers.cuisinePreference?.join(", ")})
- Вземи предвид здравословните проблеми/алергии: ${answers.healthIssues}

**Специфични насоки според целта:**
- При цел 'cut': Фокусирай се върху високопротеинови храни, зеленчуци с ниско съдържание на въглехидрати, избягвай прекомерни мазнини
- При цел 'aggressive_cut': Още по-строг контрол на калориите, максимизирай протеините, минимизирай простите въглехидрати
- При цел 'lean_bulk': Балансирани макроси с акцент върху качествени протеини и сложни въглехидрати
- При цел 'dirty_bulk': По-високо калорийно съдържание, допустими са по-мазни храни
- При цел 'recomposition': Балансиран подход с циклиране на въглехидратите (повече в дните на тренировка)
- При цел 'maintenance': Балансирани макроси за поддържане на теглото
- При цел 'aesthetic': Фокус върху постни протеини и сложни въглехидрати
- При цел 'strength': Високопротеинов план с достатъчно въглехидрати за енергия

**Важни правила за предтренировъчни и следтренировъчни храни:**
- Предтренировъчната закуска (pre_workout_snack):
  * Трябва да е 45-90 минути ПРЕДИ ${trainingTime}
  * Съдържа лесно смилаеми въглехидрати (например: банани, овесена каша, ориз)
  * Умерени протеини (например: протеинов шейк, яйца)
  * Ниско съдържание на мазнини и фибри
  * Порции: 200-400 kcal, 15-25g протеини, 30-50g въглехидрати
  
- Следтренировъчната закуска (post_workout_snack):
  * Трябва да е 30-60 минути СЛЕД тренировката
  * Високо съдържание на протеини за възстановяване (30-40g)
  * Бързо усвоими въглехидрати за попълване на гликогена (40-60g)
  * Примери: пилешко филе с ориз, протеинов шейк с банан, риба с картофи
  * Порции: 400-600 kcal, 30-40g протеини, 40-60g въглехидрати

**Формат на отговора:**
- name: Наименование на храненето на БЪЛГАРСКИ (например: "Закуска", "Предтренировъчна закуска", "Следтренировъчна закуска", "Обяд", "Вечеря")
- meal_id: Формат "meal_" + тип на английски (например: "meal_breakfast", "meal_pre_workout_snack", "meal_post_workout_snack")
- time: Препоръчително време за хранене във формат "HH:MM" (например: "07:00", "09:30")
- description: Кратко описание на БЪЛГАРСКИ (2-3 изречения)
- recipe_name: Име на рецептата на БЪЛГАРСКИ
- ingredients: Масив от съставки с name (на БЪЛГАРСКИ), quantity (число), unit (на БЪЛГАРСКИ като "г", "мл", "бр")
- macros: Точни стойности за calories, protein, carbs, fats за цялото хранене
- instructions: Масив от стъпки за приготвяне на БЪЛГАРСКИ
- prep_time: Време за приготвяне в минути
- cooking_time: Време за готвене в минути

**КРИТИЧНО ВАЖНО:**
- ВСИЧКИ текстове (name, description, recipe_name, ingredients.name, instructions) трябва да са на БЪЛГАРСКИ
- Използвай само български единици: "г" (грама), "мл" (милилитри), "бр" (броя), "ч.л." (чаена лъжичка), "с.л." (супена лъжичка)
- Макросите за всяко хранене трябва да са точни и сумата им да отговаря на дневните цели
- Предтренировъчната и следтренировъчната закуска са ЗАДЪЛЖИТЕЛНИ и трябва да са позиционирани правилно спрямо ${trainingTime}`;
}

function generateResponseFormat() {
  return {
    format: {
      type: "json_schema",
      name: "nutrition_plan",
      strict: true,
      schema: {
        type: "object",
        properties: {
          weekly_plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: {
                  type: "string",
                  description: "Ден във формат 'Ден 1', 'Ден 2', etc.",
                },
                total_macros: {
                  type: "object",
                  properties: {
                    calories: {
                      type: "number",
                    },
                    protein: {
                      type: "number",
                    },
                    carbs: {
                      type: "number",
                    },
                    fats: {
                      type: "number",
                    },
                  },
                  required: ["calories", "protein", "carbs", "fats"],
                  additionalProperties: false,
                },
                meals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Име на храненето на български",
                      },
                      meal_id: {
                        type: "string",
                        description: "Уникален идентификатор във формат meal_type",
                      },
                      time: {
                        type: "string",
                        description: "Време във формат HH:MM",
                      },
                      description: {
                        type: "string",
                        description: "Кратко описание на български",
                      },
                      recipe_name: {
                        type: "string",
                        description: "Име на рецептата на български",
                      },
                      ingredients: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: {
                              type: "string",
                              description: "Име на съставката на български",
                            },
                            quantity: {
                              type: "number",
                              description: "Количество",
                            },
                            unit: {
                              type: "string",
                              description: "Мерна единица на български (г, мл, бр, ч.л., с.л.)",
                            },
                          },
                          required: ["name", "quantity", "unit"],
                          additionalProperties: false,
                        },
                      },
                      macros: {
                        type: "object",
                        properties: {
                          calories: {
                            type: "number",
                          },
                          protein: {
                            type: "number",
                          },
                          carbs: {
                            type: "number",
                          },
                          fats: {
                            type: "number",
                          },
                        },
                        required: ["calories", "protein", "carbs", "fats"],
                        additionalProperties: false,
                      },
                      instructions: {
                        type: "array",
                        items: {
                          type: "string",
                          description: "Стъпка от инструкциите на български",
                        },
                      },
                      prep_time: {
                        type: "number",
                        description: "Време за подготовка в минути",
                      },
                      cooking_time: {
                        type: "number",
                        description: "Време за готвене в минути",
                      },
                    },
                    required: [
                      "name",
                      "meal_id",
                      "time",
                      "description",
                      "recipe_name",
                      "ingredients",
                      "macros",
                      "instructions",
                      "prep_time",
                      "cooking_time",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["day", "total_macros", "meals"],
              additionalProperties: false,
            },
          },
          nutrition_tips: {
            type: "array",
            items: {
              type: "string",
              description: "Хранителни съвети на български",
            },
            description: "3-5 съвета за хранене",
          },
        },
        required: ["weekly_plan", "nutrition_tips"],
        additionalProperties: false,
      },
    },
  };
}
