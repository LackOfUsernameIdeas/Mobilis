"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategorySelectorProps {
  onSelectCategory: (category: "gym" | "yoga" | "running") => void;
}

export default function CategorySelector({ onSelectCategory }: CategorySelectorProps) {
  const categories = [
    {
      id: "gym",
      title: "Gym & Calisthenics",
      description: "Get personalized workout plans for gym training and calisthenics exercises",
      icon: "🏋️",
    },
    {
      id: "yoga",
      title: "Yoga",
      description: "Find yoga practices tailored to your goals and experience level",
      icon: "🧘",
    },
    {
      id: "running",
      title: "Running",
      description: "Create a custom running plan based on your goals and fitness level",
      icon: "🏃",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-foreground text-4xl font-bold">Fitness Recommendations</h1>
        <p className="text-muted-foreground text-lg">Choose a fitness category to get personalized recommendations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="hover:border-primary hover:bg-card/80 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95"
            onClick={() => onSelectCategory(category.id as "gym" | "yoga" | "running")}
          >
            <CardHeader>
              <div className="mb-4 text-5xl">{category.icon}</div>
              <CardTitle className="text-foreground text-xl">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
