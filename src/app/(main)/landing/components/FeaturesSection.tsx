import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Feature } from "../types";

interface FeaturesSectionProps {
  features: Feature[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: "0px 0px -200px 0px" });
  return (
    <section ref={ref} id="features" className="bg-muted/30 dark:bg-muted/10 border-t py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">Защо да ползвате Мобилис?</h2>
          <p className="text-muted-foreground max-w-8xl mx-auto text-base leading-relaxed md:text-lg md:leading-relaxed">
            Мобилис дава възможност за съставяне на персонализирани тренировъчни препоръки, чрез анализ и изчисляване на
            различни оптимални дневни показатели, които да се използват при съставянето на хранителен режим, съобразен с
            целите и нуждите на потребителите. Чрез използването на изкуствен интелект за генериране на съдържание и
            алгоритми, базирани на научни изследвания и препоръки, Мобилис цели да предостави на потребителите
            инструменти за цялостно управление на физическото им благосъстояние – от оптимизиране на телесната
            композиция до подобряване на постуралното здраве.
          </p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.a
              key={index}
              href="/auth/register"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: index * 0.15, duration: 0.7, ease: "easeOut" }}
              className="group border-border bg-card flex cursor-pointer flex-col rounded-xl border p-6 shadow-sm transition-all hover:scale-105 hover:shadow-lg"
            >
              <div className="bg-primary/10 mb-4 inline-flex w-fit rounded-lg p-3">
                <feature.icon className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-card-foreground mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mb-4 flex-grow text-sm">{feature.description}</p>
              <div className="text-primary mt-auto flex items-center gap-1 text-sm font-medium">
                Разгледайте
                <ChevronRight className="mt-0.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
