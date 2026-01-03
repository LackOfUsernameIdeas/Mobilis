"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ABOUT_TEXT, ANIMATION_VARIANTS } from "../constants";

export default function AboutSection() {
  return (
    <motion.div {...ANIMATION_VARIANTS.slideIn} transition={{ ...ANIMATION_VARIANTS.slideIn.transition, delay: 0.1 }}>
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/50">
        <CardContent className="space-y-3 text-sm leading-relaxed text-blue-800 dark:text-blue-300">
          <p>{ABOUT_TEXT.intro}</p>
          <ul className="ml-2 list-inside list-disc space-y-1">
            {ABOUT_TEXT.goals.map((goal, idx) => (
              <li key={idx}>{goal}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
