"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategorySelectorProps {
  onSelectCategory: (category: "gym" | "calisthenics" | "yoga" | "running") => void;
}

export default function CategorySelector({ onSelectCategory }: CategorySelectorProps) {
  const categories = [
    {
      id: "gym",
      title: "Gym",
      description: "Get personalized workout plans for gym training and exercises",
      icon: "🏋️",
    },
    {
      id: "calisthenics",
      title: "Calisthenics",
      description: "Get personalized workout plans for calisthenics training and exercises",
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
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="hover:border-primary hover:bg-card/80 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95"
            onClick={() => onSelectCategory(category.id as "gym" | "yoga" | "running")}
          >
            <CardHeader>
              <div className="mb-3 text-4xl sm:mb-4 sm:text-5xl">{category.icon}</div>
              <CardTitle className="text-foreground text-lg sm:text-xl">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
