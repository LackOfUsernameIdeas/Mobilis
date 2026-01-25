import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="border-t py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-primary/20 from-primary/5 via-accent/5 to-background rounded-2xl border-2 bg-gradient-to-br p-8 text-center md:p-12"
        >
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Готови ли сте да подобрите стойката си?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Започнете вашето пътуване към по-здравословна стойка още днес
          </p>
          <Link
            href="/auth/register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-medium transition-colors"
          >
            Създайте безплатен акаунт
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
