import { saveUserPreferences, saveNutritionRecommendations } from "@/server/saveFunctions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, category, answers, userStats } = await req.json();

    if (!category || !userId || !answers) {
      return NextResponse.json({ error: "Category, user id and answers are required" }, { status: 400 });
    }

    saveUserPreferences(userId, category, answers);

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
    saveNutritionRecommendations(userId, nutritionPlanParsed);

    return NextResponse.json(nutritionRecommendations);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}

function generateSystemPrompt(): string {
  return `Ти си професионален диетолог. Задачата ти е да създаваш персонализирани хранителни планове на база предоставените данни за потребителя. 
          Винаги отговаряй САМО с валиден JSON формат, без допълнителен текст или markdown.
          КРИТИЧНО ВАЖНО - Адаптивна структура на хранителния план:
            - Създавай естествена структура на хранения според времето на тренировка
            - Ако тренировката е СУТРИН: Първото хранене може да е предтренировъчно, следвано от следтренировъчно
            - Ако тренировката е по-късно: Започни с нормална закуска и разположи предтренировъчното и следтренировъчното хранене около времето на тренировка
            - Винаги включвай основните хранения: закуска, обяд, вечеря (освен ако не са заменени от тренировъчни хранения)
            - Добави междинни закуски според нуждата за достигане на дневните макроси
        `;
}

function generateUserPrompt(answers: Record<string, any>, userStats?: any): string {
  const trainingTime = answers.trainingTime || "afternoon";

  const trainingPeriodMap: Record<string, string> = {
    morning: "сутрин (06:00-09:00)",
    "before-noon": "преди обед (09:00-12:00)",
    noon: "на обяд (12:00-14:00)",
    afternoon: "следобед (14:00-17:00)",
    evening: "вечер (17:00-21:00)",
  };

  const trainingPeriodBG = trainingPeriodMap[trainingTime] || "следобед";

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
        - Период от деня, в който потребителя тренира: ${trainingPeriodBG}
        - Целево тегло: ${answers.targetWeight === "yes" ? answers.targetWeightValue + " кг" : "не е посочено"}
        - Дневни калории: ${answers.calories || "не е посочено"} kcal
        - Дневни протеини: ${answers.protein || "не е посочено"} g
        - Дневни въглехидрати: ${answers.carbs || "не е посочено"} g
        - Дневни мазнини: ${answers.fats || "не е посочено"} g
        - Здравословни проблеми или алергии: ${answers.healthIssues || "Няма"}
        - Предпочитани кухни: ${answers.cuisinePreference?.join(", ") || "Нямам предпочитания"}

        **СТРУКТУРА НА ХРАНИТЕЛНИЯ ПЛАН:**
        Като имаш предвид, че потребителят тренира ${trainingPeriodBG}, осигури:
        - Закуска (освен ако тренировката е сутрин - тогава закуската е след тренировката)
        - Обяд
        - Вечеря
        - Задължително предтренировъчно хранене
        - Задължително следтренировъчно хранене
        - 1-2 междинни закуски според нуждата за покриване на дневните калории

        Подреди храненията естествено според времето на деня и тренировката. Времената на храненията трябва да са логични и последователни през деня.

        **Важни насоки за хранителния план:**

        **Общи правила:**
        - Разпредели храненията през деня така, че да се покрият дневните нутриенти (${answers.calories} kcal, ${answers.protein}g протеини, ${answers.carbs}g въглехидрати, ${answers.fats}g мазнини)
        - Всяко хранене трябва да има точни порции и грамаж на съставките
        - Адаптирай рецептите според предпочитаните кухни (${answers.cuisinePreference?.join(", ")})
        - Вземи предвид здравословните проблеми/алергии: ${answers.healthIssues}

        **Специфични насоки според целта:**
        - При цел 'cut' (-500 cal дефицит, 40P/25F/35C): Фокусирай се върху високопротеинови храни за запазване на мускулна маса, зеленчуци с ниско съдържание на въглехидрати, умерени здравословни мазнини. Цел: загуба на 0.5 кг седмично.
        - При цел 'aggressive_cut' (-750 cal дефицит, 45P/20F/35C): Максимизирай протеините (45% от калориите) за запазване на мускулите при агресивен дефицит. Минимизирай мазнините (20%), фокус върху сложни въглехидрати. Избягвай прости захари и рафинирани храни. Цел: загуба на 0.75 кг седмично.
        - При цел 'lean_bulk' (+300 cal суфицит, 30P/25F/45C): Контролиран суфицит за постепенно качване на чиста мускулна маса. Акцент върху качествени протеини и сложни въглехидрати (45%). Избягвай прекомерно мазни и преработени храни. Цел: бавно и качествено покачване.
        - При цел 'dirty_bulk' (+500 cal суфицит, 25P/30F/45C): По-висок калориен прием за максимално бързо покачване на маса. Допустими са по-мазни храни (30%) и по-големи порции. Фокус върху достигане на калориите, дори с по-малко "чисти" храни.
        - При цел 'recomposition' (-200 cal леко под поддръжка, 40P/30F/30C): Балансиран подход с висок протеин (40%) за едновременна загуба на мазнини и качване на мускули. Балансирани мазнини (30%) и въглехидрати (30%). Качествени храни с акцент върху хранителна плътност.
        - При цел 'maintenance' (0 cal, 30P/30F/40C): Балансирани макроси за поддържане на текущото тегло и форма. Равномерно разпределение между протеини, мазнини и въглехидрати. Фокус върху дългосрочна устойчивост.
        - При цел 'aesthetic' (-300 cal умерен дефицит, 40P/25F/35C): Висок протеинов прием (40%) за запазване на мускулната маса при дефицит. Умерени мазнини (25%) и въглехидрати (35%). Фокус върху постни протеини, сложни въглехидрати и естетичен външен вид.
        - При цел 'strength' (+200 cal леко над поддръжка, 30P/25F/45C): Достатъчно въглехидрати (45%) за енергия и силови показатели. Умерен протеинов прием (30%) за възстановяване. Калориен суфицит за подкрепа на интензивни тренировки със свободни тежести.

        **Важни правила за предтренировъчни и следтренировъчни храни:**
        - Предтренировъчното хранене (pre_workout_snack):
        * Трябва да е 45-90 минути ПРЕДИ тренировката
        * Съдържа лесно смилаеми въглехидрати (например: банани, овесена каша, ориз)
        * Умерени протеини (например: протеинов шейк, яйца)
        * Ниско съдържание на мазнини и фибри
        * Порции: 200-400 kcal, 15-25g протеини, 30-50g въглехидрати
        
        - Следтренировъчното хранене (post_workout_snack):
        * Трябва да е 30-60 минути СЛЕД тренировката
        * Високо съдържание на протеини за възстановяване (30-40g)
        * Бързо усвоими въглехидрати за попълване на гликогена (40-60g)
        * Примери: пилешко филе с ориз, протеинов шейк с банан, риба с картофи
        * Порции: 400-600 kcal, 30-40g протеини, 40-60g въглехидрати

        **Формат на отговора:**
        - meal_id: Уникален идентификатор за рецептата във формат малки букви с долни черти (например: "oatmeal_protein_blueberries", "chicken_rice_broccoli", "tuna_salad_olive_oil"). ВИНАГИ в единствено число.
        - name: Име на рецептата на БЪЛГАРСКИ (например: "Овесена каша с протеин и боровинки", "Пилешко филе с ориз и броколи")
        - meal_type: Тип на храненето на английски (например: "breakfast", "morning_snack", "lunch", "afternoon_snack", "pre_workout_snack", "post_workout_snack", "dinner")
        - time: Препоръчително време за хранене във формат "HH:MM" (например: "07:00", "09:30")
        - description: Кратко описание на БЪЛГАРСКИ (2-3 изречения)
        - ingredients: Масив от съставки с name (на БЪЛГАРСКИ), quantity (число), unit (на БЪЛГАРСКИ като "г", "мл", "бр")
        - macros: Точни стойности за calories, protein, carbs, fats за цялото хранене
        - instructions: Масив от стъпки за приготвяне на БЪЛГАРСКИ
        - prep_time: Време за приготвяне в минути
        - cooking_time: Време за готвене в минути

        **ХРАНИТЕЛНИ СЪВЕТИ:**
        Предостави 3-5 УНИВЕРСАЛНИ и ПРАКТИЧНИ съвета, които са:
        - Приложими за всеки човек, независимо от целта
        - Фокусирани върху здравословни навици и хидратация
        - Кратки и лесни за запомняне (1-2 изречения максимум)
        - НЕ повтарят информация, която вече е включена в храненията

        ПРИМЕРИ за добри съвети:
        - "Пий поне 2.5-3 литра вода дневно - добра хидратация подобрява метаболизма и възстановяването."
        - "Спи 7-9 часа на нощ - качественият сън е ключов за хормоналния баланс и мускулното възстановяване."
        - "Приготвяй храната предварително - спестява време и те предпазва от нездравословни избори."
        - "Храни се бавно и осъзнато - отнема 15-20 минути на мозъка да регистрира ситост."

        НЕ давай съвети:
        - Повтарящи разпределението на макроси
        - Специфични корекции на калориите
        - Свързани с конкретни хранителни продукти (зеленчуци, месо, риба, плодове и т.н.)
        - Специфични за определена цел (cut, bulk, maintenance, recomposition и т.н.)
        - Технически детайли за предтренировъчни/следтренировъчни хранения
        - Времена на хранене или разпределение на макроси по време на деня
        - Съвети за следене на прогрес, тегло или телесни измервания

        **КРИТИЧНО ВАЖНО:**
        - ВСИЧКИ текстове (name, description, ingredients.name, instructions) трябва да са на БЪЛГАРСКИ
        - Използвай само български единици: "г" (грама), "мл" (милилитри), "бр" (броя), "ч.л." (чаена лъжичка), "с.л." (супена лъжичка)
        - Макросите за всяко хранене трябва да са точни и сумата им да отговаря на дневните цели
        - Предтренировъчното и следтренировъчното хранене са ЗАДЪЛЖИТЕЛНИ и трябва да са позиционирани правилно спрямо периода на тренировка - ${trainingPeriodBG}
        `;
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
                      meal_id: {
                        type: "string",
                        description:
                          "Уникален идентификатор за рецептата (например: 'oatmeal_protein_blueberries', 'chicken_rice_broccoli')",
                      },
                      name: {
                        type: "string",
                        description:
                          "Име на рецептата на български (например: 'Овесена каша с протеин и боровинки', 'Пилешко филе с ориз и броколи')",
                      },
                      meal_type: {
                        type: "string",
                        description: "Тип на храненето",
                        enum: [
                          "breakfast",
                          "morning_snack",
                          "lunch",
                          "afternoon_snack",
                          "pre_workout_snack",
                          "post_workout_snack",
                          "dinner",
                        ],
                      },
                      time: {
                        type: "string",
                        description: "Време във формат HH:MM",
                      },
                      description: {
                        type: "string",
                        description: "Кратко описание на български",
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
                      "meal_id",
                      "name",
                      "meal_type",
                      "time",
                      "description",
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
