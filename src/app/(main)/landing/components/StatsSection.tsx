import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Target, Apple } from "lucide-react";
import { fetchLandingPageStats } from "../helper_functions";

interface Stats {
  usersCount: number;
  recommendedGoal: {
    goal: string;
    goalName?: string;
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

  return (
    <section ref={ref} className="bg-muted/50 dark:bg-muted/15 border-t py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Users Count Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0, duration: 0.7, ease: "easeOut" }}
            className="group border-border bg-card flex flex-col rounded-xl border p-6 shadow-sm transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="bg-primary/10 mb-4 inline-flex w-fit rounded-lg p-3">
              <Users className="text-primary h-6 w-6" />
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <div className="bg-muted h-10 w-24 animate-pulse rounded"></div>
                <div className="bg-muted h-4 w-32 animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-card-foreground mb-2 text-4xl font-bold">
                  {stats?.usersCount.toLocaleString("bg-BG") || "0"}
                </div>
                <p className="text-muted-foreground text-sm font-medium">Активни потребители</p>
              </>
            )}
          </motion.div>

          {/* Most Popular Goal Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
            className="group border-border bg-card flex flex-col rounded-xl border p-6 shadow-sm transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="bg-primary/10 mb-4 inline-flex w-fit rounded-lg p-3">
              <Target className="text-primary h-6 w-6" />
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <div className="bg-muted h-10 w-32 animate-pulse rounded"></div>
                <div className="bg-muted h-4 w-28 animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-card-foreground mb-2 text-2xl font-bold">
                  {stats?.recommendedGoal.goalName || "Неизвестна"}
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                  Най-препоръчвана цел ({stats?.recommendedGoal.count || 0} пъти)
                </p>
              </>
            )}
          </motion.div>

          {/* Average Calories Card - spans 2 columns on larger screens */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
            className="group border-border bg-card flex flex-col rounded-xl border p-6 shadow-sm transition-all hover:scale-105 hover:shadow-lg md:col-span-2"
          >
            <div className="bg-primary/10 mb-4 inline-flex w-fit rounded-lg p-3">
              <Apple className="text-primary h-6 w-6" />
            </div>
            {isLoading ? (
              <div className="space-y-3">
                <div className="bg-muted h-10 w-32 animate-pulse rounded"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted h-16 animate-pulse rounded-lg"></div>
                  <div className="bg-muted h-16 animate-pulse rounded-lg"></div>
                  <div className="bg-muted h-16 animate-pulse rounded-lg"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-card-foreground mb-2 text-4xl font-bold">
                  {Math.round(stats?.nutritionalProfile.data.calories || 0)} kcal
                </div>
                <p className="text-muted-foreground mb-4 text-sm font-medium">Среден хранителен профил</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted dark:bg-muted/50 rounded-lg p-3">
                    <div className="text-muted-foreground text-xs font-medium">Протеини</div>
                    <div className="text-card-foreground mt-1 text-xl font-bold">
                      {Math.round(stats?.nutritionalProfile.data.protein || 0)}g
                    </div>
                  </div>
                  <div className="bg-muted dark:bg-muted/50 rounded-lg p-3">
                    <div className="text-muted-foreground text-xs font-medium">Въглехидрати</div>
                    <div className="text-card-foreground mt-1 text-xl font-bold">
                      {Math.round(stats?.nutritionalProfile.data.carbs || 0)}g
                    </div>
                  </div>
                  <div className="bg-muted dark:bg-muted/50 rounded-lg p-3">
                    <div className="text-muted-foreground text-xs font-medium">Мазнини</div>
                    <div className="text-card-foreground mt-1 text-xl font-bold">
                      {Math.round(stats?.nutritionalProfile.data.fats || 0)}g
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
