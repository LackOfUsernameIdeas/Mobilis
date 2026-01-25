import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ChevronRight, Check } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col justify-center space-y-6"
        >
          <div className="space-y-4">
            <h2 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Постигнете оптимално <span className="text-primary">физическо здраве</span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl">
              Персонализирана платформа за съставяне на тренировки, хранителни режими и следване на специализирани
              програми с 3D проследяване в реално време.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="group bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-medium transition-colors"
            >
              Започнете сега
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative"
        >
          <div className="border-border bg-card relative overflow-hidden rounded-2xl border-2 shadow-2xl">
            <div className="from-primary/10 via-accent/5 to-background aspect-video bg-gradient-to-br p-8">
              <div className="flex h-full flex-col items-center justify-center gap-6">
                <Activity className="text-primary h-20 w-20" />
                <div className="text-center">
                  <div className="text-foreground text-5xl font-bold">4</div>
                  <div className="text-muted-foreground">Основни модула</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
