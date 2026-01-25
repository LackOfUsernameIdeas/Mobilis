import React from "react";
import { motion } from "framer-motion";
import { Feature } from "../types";

interface FeaturesSectionProps {
  features: Feature[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section id="features" className="bg-muted/30 border-t py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">Защо да изберете Мобилис?</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Професионално разработена система за коригиране на стойката с най-съвременна технология
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="bg-primary/10 mb-4 inline-flex rounded-lg p-3">
                <feature.icon className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-card-foreground mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
