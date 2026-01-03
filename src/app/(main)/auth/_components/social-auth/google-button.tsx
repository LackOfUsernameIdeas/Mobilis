import { siGoogle } from "simple-icons";
import { toast } from "sonner";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { translateAuthError } from "@/lib/translate-error";
import { getBrowserClient } from "@/lib/db/clients/browser";

export function GoogleButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const supabase = getBrowserClient();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    if (error) {
      toast.error("Неуспешно влизане с Google!", {
        description: translateAuthError(error.message),
      });
    } else {
      toast.success("Пренасочване към Google вход...");
    }
  };

  return (
    <Button variant="secondary" className={cn("hover:text-current", className)} onClick={handleGoogleLogin} {...props}>
      <SimpleIcon icon={siGoogle} className="size-4" />
      Влезте с Google профил
    </Button>
  );
}
