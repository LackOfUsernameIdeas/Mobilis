"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export function Unauthorized() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/login");
  }, [router]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="text-destructive h-12 w-12 animate-pulse" strokeWidth={2} />
          </div>

          <div className="border-destructive/30 absolute inset-0 animate-ping rounded-full border-2 opacity-75" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-foreground text-sm font-medium">Влезте в профила си първо!</p>
          <p className="text-muted-foreground animate-pulse text-xs">Пренасочване към вход...</p>
        </div>
      </div>
    </div>
  );
}
