"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategorySelectorProps {
  onSelectCategory: (category: "gym" | "calisthenics" | "yoga") => void;
}

export default function CategorySelector({ onSelectCategory }: CategorySelectorProps) {
  const categories = [
    {
      id: "gym",
      title: "Фитнес",
      description: "Получете персонализирани планове за тренировки в залата",
      icon: "🏋️",
    },
    {
      id: "calisthenics",
      title: "Калистеника",
      description: "Получете персонализирани планове за тренировки с калистеника",
      icon: "🏃",
    },
    {
      id: "yoga",
      title: "Йога",
      description: "Намерете йога практики, които отговарят на вашите цели",
      icon: "🧘",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="hover:border-primary hover:bg-card/80 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95"
            onClick={() => onSelectCategory(category.id as "gym" | "calisthenics" | "yoga")}
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
