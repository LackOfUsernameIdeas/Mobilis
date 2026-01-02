import { siGoogle } from "simple-icons";
import { createClient } from "@/app/utils/supabase/client";
import { toast } from "sonner";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GoogleButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    if (error) {
      toast.error("Google login failed", {
        description: error.message,
      });
    } else {
      toast.success("Redirecting to Google login...");
    }
  };

  return (
    <Button variant="secondary" className={cn(className)} onClick={handleGoogleLogin} {...props}>
      <SimpleIcon icon={siGoogle} className="size-4" />
      Влезте с Google профил
    </Button>
  );
}
