"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, User, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Loader } from "../_components/loader";

const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  },
  slideIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export default function ContactFormPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-background @container/main flex min-h-screen flex-col gap-6 p-6 md:gap-8 md:p-10 lg:p-12">
      {/* Header */}
      <motion.div
        initial={ANIMATION_VARIANTS.fadeIn.initial}
        animate={ANIMATION_VARIANTS.fadeIn.animate}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Свържете се с нас</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  Имате въпроси или предложения? Ще се радваме да чуем от вас!
                </p>
              </div>
              <div className="bg-primary/10 flex items-center gap-2 rounded-full px-4 py-2">
                <Mail className="text-primary h-5 w-5" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Info Section */}
      <motion.div
        {...ANIMATION_VARIANTS.slideIn}
        transition={{ ...ANIMATION_VARIANTS.slideIn.transition, delay: 0.1, ease: "easeInOut" }}
      >
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/50">
          <CardContent className="space-y-3 text-sm leading-relaxed text-blue-800 dark:text-blue-300">
            <p>Моля, попълнете формата по-долу и ние ще се свържем с вас възможно най-скоро.</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Form */}
      <motion.div
        {...ANIMATION_VARIANTS.slideIn}
        transition={{ ...ANIMATION_VARIANTS.slideIn.transition, delay: 0.2, ease: "easeInOut" }}
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Изпратете ни съобщение</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <User className="text-primary h-4 w-4" />
                  Име
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-input bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-4 py-2 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  placeholder="Вашето име"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="text-primary h-4 w-4" />
                  Имейл адрес
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-input bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-4 py-2 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  placeholder="example@email.com"
                />
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <label htmlFor="subject" className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="text-primary h-4 w-4" />
                  Тема
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="border-input bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-4 py-2 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  placeholder="Относно какво е вашето запитване?"
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Съобщение
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="border-input bg-background ring-offset-background focus:ring-ring w-full resize-none rounded-md border px-4 py-2 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  placeholder="Напишете вашето съобщение тук..."
                />
              </div>

              {/* Submit Button */}
              <Button onClick={handleSubmit} className="w-full cursor-pointer" disabled={submitted}>
                {submitted ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Изпратено успешно!
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Изпрати съобщение
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Message */}
      {submitted && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Alert className="border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="leading-relaxed">
              Благодарим ви за съобщението! Ще се свържем с вас скоро.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
}
