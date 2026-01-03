"use client";

import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { WARNING_TEXT, ANIMATION_VARIANTS } from "../constants";

export default function WarningAlert() {
  return (
    <motion.div
      {...ANIMATION_VARIANTS.slideInLeft}
      transition={{ ...ANIMATION_VARIANTS.slideInLeft.transition, delay: 0.35 }}
    >
      <Alert
        variant="destructive"
        className="border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/50 dark:text-orange-200"
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="leading-relaxed text-pretty">{WARNING_TEXT}</AlertDescription>
      </Alert>
    </motion.div>
  );
}
