import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Target, Apple } from "lucide-react";
import { fetchLandingPageStats } from "../helper_functions";

interface Stats {
  usersCount: number;
  recommendedGoal: {
    goal: string;
    count: number;
  };
  nutritionalProfile: {
    data: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
  };
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: "0px 0px -200px 0px" });

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchLandingPageStats();
        console.log("Fetched stats data:", data);
        setStats(data);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  const statCards = stats
    ? [
        {
          icon: Users,
          value: stats.usersCount.toLocaleString("bg-BG"),
          label: "Активни потребители",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-600/10",
        },
        {
          icon: Target,
          value: stats.recommendedGoal.goal,
          label: `Най-популярна цел (${stats.recommendedGoal.count} потребители)`,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-600/10",
        },
        {
          icon: Apple,
          value: `${Math.round(stats.nutritionalProfile.data.calories)} kcal`,
          label: `Средни калории (P: ${Math.round(stats.nutritionalProfile.data.protein)}g, C: ${Math.round(stats.nutritionalProfile.data.carbs)}g, F: ${Math.round(stats.nutritionalProfile.data.fats)}g)`,
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-600/10",
        },
      ]
    : [];

  return (
    <section ref={ref} className="bg-muted/50 dark:bg-muted/5 border-t py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">Нашата общност</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            Присъединете се към хиляди потребители, които вече постигат своите фитнес цели с Мобилис
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {isLoading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="bg-card animate-pulse rounded-xl border p-6">
                  <div className="bg-muted h-12 w-12 rounded-lg"></div>
                  <div className="bg-muted mt-4 h-8 w-20 rounded"></div>
                  <div className="bg-muted mt-2 h-4 w-32 rounded"></div>
                </div>
              ))
            : statCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: index * 0.15, duration: 0.7, ease: "easeOut" }}
                  className="bg-card group rounded-xl border p-6 shadow-sm transition-all hover:scale-105 hover:shadow-lg"
                >
                  <div className={`${stat.bgColor} mb-4 inline-flex w-fit rounded-lg p-3`}>
                    <stat.icon className={`${stat.color} h-6 w-6`} />
                  </div>
                  <div className="text-foreground mb-2 text-3xl font-bold">{stat.value}</div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
