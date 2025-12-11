import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { category, answers, userStats } = await req.json();

    if (!category || !answers) {
      return NextResponse.json({ error: "Category and answers are required" }, { status: 400 });
    }

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
        model: "gpt-5.1",
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

    return NextResponse.json(data.output[0].content[0].text);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}

function generateSystemPrompt(category: string): string | undefined {
  console.log("Generating system prompt for category:", category);

  if (category === "gym") {
    return "Ти си професионален фитнес треньор с много години опит. Задачата ти е да създаваш персонализирани тренировъчни програми на база предоставените данни за потребителя. Винаги отговаряй САМО с валиден JSON формат, без допълнителен текст или markdown.";
  } else if (category === "calisthenics") {
    return "Ти си професионален калистеника треньор с много години опит. Задачата ти е да създаваш персонализирани калистенични тренировъчни програми (упражнения САМО с тегло на собственото тяло) на база предоставените данни за потребителя. Винаги отговаряй САМО с валиден JSON формат, без допълнителен текст или markdown.";
  } else if (category === "yoga") {
    return "Ти си професионален йога инструктор с много години опит. Задачата ти е да създаваш персонализирани йога програми на база предоставените данни за потребителя. Винаги отговаряй САМО с валиден JSON формат, без допълнителен текст или markdown.";
  } else if (category === "running") {
    return "Ти си професионален треньор по бягане. Задачата ти е да създаваш персонализирани тренировъчни програми за бягане на база предоставените данни за потребителя. Винаги отговаряй САМО с валиден JSON формат, без допълнителен текст или markdown.";
  }
}

function generateUserPrompt(category: string, answers: Record<string, any>, userStats?: any): string {
  console.log("Generating user prompt for category:", category);

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
  } else if (category === "calisthenics") {
    return ``;
  } else if (category === "yoga") {
    return ``;
  } else if (category === "running") {
    return ``;
  }

  // Placeholder
  return `Създай персонализирана програма за ${category} въз основа на следните данни: ${JSON.stringify(answers)}`;
}

function generateResponseFormat(category: string) {
  console.log("Generating response format for category:", category);

  if (category === "gym") {
    return {};
  } else if (category === "calisthenics") {
    return {};
  } else if (category === "yoga") {
    return {};
  } else if (category === "running") {
    return {};
  }
}
