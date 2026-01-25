"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RegisterForm } from "../_components/register-form";
import { GoogleButton } from "../_components/social-auth/google-button";

import Image from "next/image";
import logoSmall from "../../../../../public/logoSmall.png";

export default function RegisterPage() {
  return (
    <div className="flex h-dvh">
      <div className="bg-background flex w-full items-center justify-center p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-7 py-24 lg:py-32">
          <Link
            href="/"
            className="text-foreground hover:text-primary mb-6 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Обратно към главната страница</span>
          </Link>

          <div className="space-y-2 text-center">
            <div className="font-medium tracking-tight">Създаване на профил</div>
            <div className="text-muted-foreground mx-auto max-w-xl">
              Попълнете вашите имейл и парола, за да се регистрирате!
            </div>
          </div>
          <div className="space-y-4">
            <RegisterForm />
            <GoogleButton className="w-full cursor-pointer" variant="outline" />
            <p className="text-muted-foreground text-center text-xs">
              Вече имате профил?{" "}
              <Link href="login" className="text-primary">
                Влезте в профила си!
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-primary/90 hidden lg:block lg:w-1/3">
        <div className="flex h-full flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <div className="mb-8">
              <Image src={logoSmall} alt="Logo" width={360} height={360} className="mx-auto" />
            </div>
            <div className="space-y-2">
              <h1 className="text-primary-foreground text-5xl font-light">Добре дошли!</h1>
              <p className="text-primary-foreground/80 text-xl">Създайте профил, за да продължите</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
