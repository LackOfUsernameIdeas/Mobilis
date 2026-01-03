"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { checkTodayMeasurements } from "@/server/measurements";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { translateAuthError } from "@/lib/translate-error";
import { getBrowserClient } from "@/lib/db/clients/browser";

const FormSchema = z.object({
  email: z.string().email({ message: "Моля, въведете валиден имейл адрес." }),
  password: z.string().min(6, { message: "Паролата трябва да бъде поне 6 символа." }),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const router = useRouter();
  const supabase = getBrowserClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error("Неуспешно влизане!", {
          description: translateAuthError(error.message),
        });
        setIsLoading(false);
        return;
      }

      // Check if measurements exist for today BEFORE navigating
      const measurementCheck = await checkTodayMeasurements();

      if (measurementCheck.success && measurementCheck.hasTodayMeasurement) {
        // Has measurements, go directly to stats
        toast.success("Успешно влизане!");
        router.push("/dashboard/stats");
      } else {
        // No measurements, go to measurements page
        toast.success("Успешно влизане!");
        router.push("/dashboard/measurements");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Възникна неочаквана грешка");
      setIsLoading(false);
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
                  placeholder="Въведете своята парола"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center">
              <FormControl>
                <Checkbox
                  id="login-remember"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="size-4 cursor-pointer"
                />
              </FormControl>
              <FormLabel
                htmlFor="login-remember"
                className="text-muted-foreground ml-1 cursor-pointer text-sm font-medium"
              >
                Запомни паролата ми
              </FormLabel>
            </FormItem>
          )}
        />
        <Button className="w-full cursor-pointer" type="submit" disabled={isLoading}>
          {isLoading ? "Влизане..." : "Влезте"}
        </Button>
      </form>
    </Form>
  );
}
