"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { translateAuthError } from "@/lib/translate-error";
import { getBrowserClient } from "@/lib/db/clients/browser";
import { termsAndConditions } from "./constants";

const FormSchema = z
  .object({
    email: z.string().email({ message: "Моля, въведете валиден имейл адрес." }),
    password: z.string().min(6, { message: "Паролата трябва да бъде поне 6 символа." }),
    confirmPassword: z.string().min(6, { message: "Потвърждението на паролата трябва да бъде поне 6 символа." }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Трябва да приемете условията за ползване.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролите не съвпадат.",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  const router = useRouter();
  const supabase = getBrowserClient();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const res = await fetch("/api/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });
    const { exists } = await res.json();
    if (exists) {
      toast.error("Профил с този имейл вече съществува!");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    });

    if (error) {
      toast.error("Неуспешна регистрация!", {
        description: translateAuthError(error.message),
      });
    } else {
      toast.success("Регистрацията е успешна! Проверете имейла си за потвърждение.");
      router.push("/auth/login");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имейл адрес</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="Въведете своя имейл адрес"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Парола</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="Въведете парола"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Потвърждаване на паролата</FormLabel>
              <FormControl>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Повторете паролата"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <div className="flex items-start gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5 cursor-pointer"
                      />
                    </FormControl>
                    <FormLabel className="flex-1 cursor-pointer text-sm leading-relaxed font-normal">
                      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-primary hover:text-primary/80 cursor-pointer text-left underline underline-offset-4"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsTermsOpen(true);
                            }}
                          >
                            Потвърждавам, че съм запознат и съгласен с условията за поверителност
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{termsAndConditions.title}</DialogTitle>
                            <DialogDescription>{termsAndConditions.description}</DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="max-h-[60vh] pr-4">
                            <div className="space-y-4 text-sm">
                              {termsAndConditions.sections.map((section) => (
                                <section key={section.id}>
                                  <h3 className="mb-2 text-base font-semibold">
                                    {section.id}. {section.title}
                                  </h3>
                                  <p className="text-muted-foreground">{section.content}</p>
                                </section>
                              ))}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        />
        <Button className="w-full cursor-pointer" type="submit">
          Регистриране
        </Button>
      </form>
    </Form>
  );
}
