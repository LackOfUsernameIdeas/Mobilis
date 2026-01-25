import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Image
            src="/logo.png"
            alt="Мобилис"
            width={240}
            height={240}
            className="h-12 w-auto transition-transform hover:scale-110 active:scale-100"
            priority
            quality={100}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-foreground hover:text-primary px-4 py-2 text-sm font-medium transition-colors"
          >
            Вход
          </Link>
          <Link
            href="/auth/register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 text-sm font-medium transition-colors"
          >
            Регистрация
          </Link>
        </motion.div>
      </div>
    </header>
  );
}
