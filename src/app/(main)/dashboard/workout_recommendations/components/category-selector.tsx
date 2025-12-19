"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, User, Flower2 } from "lucide-react";

interface CategorySelectorProps {
  onSelectCategory: (category: "gym" | "calisthenics" | "yoga") => void;
}

export default function CategorySelector({ onSelectCategory }: CategorySelectorProps) {
  const categories = [
    {
      id: "gym",
      title: "Фитнес",
      description: "Получете персонализирани планове за тренировки в залата",
      icon: Dumbbell,
      gradient: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
      hoverBorder: "hover:border-primary/50",
      hoverGlow: "hover:shadow-primary/20",
    },
    {
      id: "calisthenics",
      title: "Калистеника",
      description: "Получете персонализирани планове за тренировки с калистеника",
      icon: User,
      gradient: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
      hoverBorder: "hover:border-primary/50",
      hoverGlow: "hover:shadow-primary/20",
    },
    {
      id: "yoga",
      title: "Йога",
      description: "Намерете йога практики, които отговарят на вашите цели",
      icon: Flower2,
      gradient: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
      hoverBorder: "hover:border-primary/50",
      hoverGlow: "hover:shadow-primary/20",
    },
  ];

  return (
    <div className="space-y-6 pt-30 sm:space-y-8">
      <div className="space-y-3 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Изберете желаната категория
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-pretty">
          Намерете тренировъчна програма, съобразена с вашето ниво, нужди и физическо състояние, която да ви помогне да
          се чувствате по-здрави и по-силни
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            >
              <Card
                className={`group relative cursor-pointer overflow-hidden border-2 transition-all duration-300 ${category.hoverBorder} ${category.hoverGlow} h-full hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]`}
                onClick={() => onSelectCategory(category.id as "gym" | "calisthenics" | "yoga")}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />

                <CardContent className="relative flex h-full min-h-[280px] flex-col px-6">
                  <div className="flex-1 space-y-4">
                    {/* Icon Container */}
                    <div className="bg-muted/50 group-hover:bg-muted flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300">
                      <Icon
                        className={`h-8 w-8 ${category.iconColor} transition-transform duration-300 group-hover:scale-110`}
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-foreground text-xl font-semibold tracking-tight">{category.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Indicator - Always at bottom */}
                  <div className="text-muted-foreground group-hover:text-foreground mt-6 flex items-center text-sm font-medium transition-colors duration-300">
                    <span>Изберете</span>
                    <svg
                      className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
