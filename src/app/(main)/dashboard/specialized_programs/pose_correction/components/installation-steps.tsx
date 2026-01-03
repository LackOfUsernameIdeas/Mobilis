"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import DownloadButton from "./download-button";
import { APP_INFO, ANIMATION_VARIANTS } from "../constants";
import DiVi from "../../../../../../../public/3DiVi.png";
import nuitrackRuntime from "../../../../../../../public/nuitrack_runtime.png";

const INSTALLATION_STEPS = [
  {
    number: 1,
    title: "Инсталиране на приложението - То включва всички упражнения и стъпки за изпълнение",
    hasDownload: true,
  },
  {
    number: 2,
    title: "Инсталиране на Nuitrack Runtime - Изберете правилната версия, според вашата операционна система",
    link: {
      url: "https://github.com/3DiVi/nuitrack-sdk/releases",
      text: "github.com/3DiVi/nuitrack-sdk/releases →",
    },
  },
  {
    number: 3,
    title: "Взимане на ключ за достъп - Регистрирайте се и получете безплатен лиценз и ключ за достъп от 3DiVi",
    link: {
      url: "https://cognitive.3divi.com/app/nuitrack/dashboard",
      text: "cognitive.3divi.com/app/nuitrack/dashboard →",
    },
    image: {
      src: DiVi.src,
      text: "🖼️ Вижте снимка",
    },
  },
  {
    number: 4,
    title: "Отваряне на activation tool - Намерете и стартирайте",
    code: "Nuitrack.exe",
    codeBlock: "Nuitrack\\nuitrack\\nuitrack\\activation_tool",
    suffix: "от папката:",
  },
  {
    number: 5,
    title:
      "Активиране на устройството - Въведете получения ключ за достъп в activation tool за активиране на вашата камера",
    image: {
      src: nuitrackRuntime.src,
      text: "🖼️ Вижте снимка",
    },
  },
  {
    number: 6,
    title: "Инсталиране на Mobilis приложението - След активиране на камерата, инсталирайте",
    code: "mobilis_pose_correction.exe",
    suffix: "от изтегления zip файл",
  },
];

export default function InstallationSteps() {
  return (
    <motion.div {...ANIMATION_VARIANTS.slideIn} transition={{ ...ANIMATION_VARIANTS.slideIn.transition, delay: 0.3 }}>
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Стъпки за конфигурация на приложение за следене на изпълнението на упражненията за коригиране на стойката
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-blue-800 dark:text-blue-300">
          <p className="mb-4">{APP_INFO.description}</p>

          <div className="space-y-3">
            {INSTALLATION_STEPS.map((step) => (
              <div key={step.number} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white dark:bg-blue-400 dark:text-blue-950">
                  {step.number}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-medium">
                    {step.title}{" "}
                    {step.code && (
                      <code className="rounded bg-blue-200 px-1.5 py-0.5 text-xs dark:bg-blue-900">{step.code}</code>
                    )}{" "}
                    {step.suffix}
                  </p>

                  {step.hasDownload && <DownloadButton fileName="mobilis_pose_correction.zip" />}

                  {step.link && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 underline hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      {step.link.text}
                    </a>
                  )}

                  {step.codeBlock && (
                    <code className="block rounded bg-blue-200 p-2 text-xs dark:bg-blue-900">{step.codeBlock}</code>
                  )}

                  {step.image && (
                    <button
                      onClick={() => window.open(step.image!.src, "_blank")}
                      className="mt-1 inline-flex cursor-pointer items-center gap-1 text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      {step.image.text}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
