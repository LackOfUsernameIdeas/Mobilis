import { computeHasTargetWeight } from "@/app/(main)/dashboard/nutrition_plans/helper_functions";
import { saveWeightPrognosis } from "@/server/saveFunctions";
import { NextRequest, NextResponse } from "next/server";

const GOAL_CALORIE_BALANCE: Record<string, number> = {
  cut: -500,
  aggressive_cut: -750,
  lean_bulk: +300,
  dirty_bulk: +500,
  recomposition: -200,
  maintenance: 0,
  aesthetic: -300,
  strength: +200,
};

const KCAL_PER_KG = 7700;

export async function POST(req: NextRequest) {
  try {
    const { userId, answers, userStats } = await req.json();

    if (!userId || !answers) {
      return NextResponse.json({ error: "User id and answers are required" }, { status: 400 });
    }

    const hasTargetWeight = computeHasTargetWeight(answers, userStats);

    const systemPrompt = generatePrognosisSystemPrompt();
    const userPrompt = generatePrognosisUserPrompt(answers, userStats, hasTargetWeight);
    const responseFormat = generatePrognosisResponseFormat();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.2",
        max_output_tokens: 1000,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        text: responseFormat,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);

    const data = await response.json();
    const prognosisText = data.output[0].content[0].text;
    const prognosisParsed = JSON.parse(prognosisText);

    saveWeightPrognosis(userId, prognosisParsed);

    return NextResponse.json(JSON.stringify(prognosisParsed));
  } catch (error) {
    console.error("Error generating weight prognosis:", error);
    return NextResponse.json({ error: "Failed to generate weight prognosis" }, { status: 500 });
  }
}

function generatePrognosisSystemPrompt(): string {
  return `Ти си персонален треньор и диетолог с дълбоки познания в спортната наука и физиологията. 
          Задачата ти е да изготвяш реалистични и научно обосновани прогнози за физическия напредък на потребителя въз основа на предоставените данни.
          Винаги отговаряй САМО с валиден JSON формат, без допълнителен текст или markdown.
          Бъди реалистичен и честен - не обещавай невъзможни резултати.`;
}

function generatePrognosisUserPrompt(answers: Record<string, any>, userStats?: any, hasTargetWeight?: boolean): string {
  const currentDate = new Date();

  const goalLabels: Record<string, string> = {
    cut: "Изгаряне на мазнини",
    aggressive_cut: "Интензивно изгаряне на мазнини",
    lean_bulk: "Чисто покачване на маса",
    dirty_bulk: "Интензивно покачване на маса",
    recomposition: "Телесна рекомпозиция",
    maintenance: "Поддържане на текущата форма",
    aesthetic: "Естетика и пропорции",
    strength: "Максимална сила",
  };

  const dailyBalance = GOAL_CALORIE_BALANCE[answers.mainGoal] ?? 0;
  const weeklyBalanceKcal = dailyBalance * 7;
  const weeklyChangeKg = weeklyBalanceKcal / KCAL_PER_KG;
  const weeklyChangeText =
    weeklyChangeKg === 0
      ? "0 кг/седмица (поддържане)"
      : `${weeklyChangeKg > 0 ? "+" : ""}${weeklyChangeKg.toFixed(2)} кг/седмица`;

  const targetWeightVal = hasTargetWeight ? parseFloat(answers.targetWeightValue) : null;
  const currentWeight = userStats?.weight ?? null;
  const estimatedWeeks =
    targetWeightVal !== null && currentWeight !== null && weeklyChangeKg !== 0
      ? Math.round(Math.abs((targetWeightVal - currentWeight) / weeklyChangeKg))
      : null;

  return `Изготви реалистична прогноза за напредъка на потребител въз основа на НАУЧНО ИЗЧИСЛЕНИТЕ стойности по-долу:

        **Лични данни:**
        - Пол: ${userStats?.gender || "не е посочен"}
        - Тегло: ${userStats?.weight || "не е посочено"} кг
        - Височина: ${userStats?.height || "не е посочена"} см
        - Възраст: ${userStats?.age || "не е посочена"} години
        - Body Fat: ${userStats?.bodyFat || "не е изчислен"}%
        - Чиста телесна маса: ${userStats?.leanBodyMass || "не е изчислена"} кг
        - Активност: ${userStats?.activityLevel || "умерена"}

        **Цел и план:**
        - Основна цел: ${goalLabels[answers.mainGoal] || answers.mainGoal}
        - Калориен баланс: ${dailyBalance > 0 ? "+" : ""}${dailyBalance} kcal/ден спрямо TDEE
        - Целево тегло: ${hasTargetWeight ? answers.targetWeightValue + " кг" : "не е посочено"}
        - Тренировъчни дни: ${(answers.trainingDays || []).length} пъти седмично
        - Дневни калории: ${answers.calories} kcal

        **Научно изчислена прогноза (1 кг мазнина = ${KCAL_PER_KG} kcal — CDC/NHS):**
        - ${dailyBalance > 0 ? "+" : ""}${dailyBalance} kcal/ден × 7 дни = ${weeklyBalanceKcal > 0 ? "+" : ""}${weeklyBalanceKcal} kcal/седмица
        - Очаквана седмична промяна: **${weeklyChangeText}**
        ${estimatedWeeks !== null ? `- Изчислени седмици до целта: **~${estimatedWeeks} седмици**` : ""}

        **Текуща дата:** ${currentDate.toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric" })}

        ВАЖНО: Използвай ТОЧНО горните изчислени стойности. НЕ измисляй различна седмична промяна.
        Изготви прогноза като вземеш предвид:
        - За cut/aggressive_cut/aesthetic: използвай изчислената седмична загуба (${weeklyChangeText}) и седмиците до целта
        - За lean_bulk/dirty_bulk/strength: използвай изчисленото седмично покачване (${weeklyChangeText}) и седмиците до целта
        - За recomposition: очаквана промяна в body fat % и lean mass за 8, 12 и 16 седмици
        - За maintenance: кратка бележка, без estimated_weeks и milestones
        - Включи 3-4 реалистични етапа (milestones) с конкретни тегла по седмици, базирани на ${weeklyChangeText}
        - Посочи очакваната дата на постигане на целта като конкретен период от месеца — използвай "началото на", "средата на" или "края на" + месец + година (напр. "началото на Юли 2026"). Правило: ден 1–10 = "началото на", ден 11–20 = "средата на", ден 21–31 = "края на". null ако не е приложимо.
        - Седмичната промяна в JSON трябва да е точно: "${weeklyChangeText}"
        - Добави кратка бележка с условията за постигане на прогнозата`;
}

function generatePrognosisResponseFormat() {
  return {
    format: {
      type: "json_schema",
      name: "weight_prognosis",
      strict: true,
      schema: {
        type: "object",
        properties: {
          estimated_weeks: {
            type: ["number", "null"],
            description: "Очакван брой седмици до целта. null за maintenance или recomposition.",
          },
          estimated_date: {
            type: ["string", "null"],
            description:
              "Очаквана дата за постигане на целта на български като период от месеца (напр. 'началото на Юли 2026', 'средата на Октомври 2026', 'края на Март 2027'). null ако не е приложимо.",
          },
          weekly_change: {
            type: "string",
            description: "Очаквана седмична промяна като текст (напр. '-0.5 кг/седмица').",
          },
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                week: { type: "number", description: "Номер на седмицата" },
                note: { type: "string", description: "Описание на очаквания резултат на български" },
              },
              required: ["week", "note"],
              additionalProperties: false,
            },
            minItems: 0,
            maxItems: 4,
          },
          note: {
            type: "string",
            description: "Кратка бележка с условията и предположенията за прогнозата на български",
          },
        },
        required: ["estimated_weeks", "estimated_date", "weekly_change", "milestones", "note"],
        additionalProperties: false,
      },
    },
  };
}
