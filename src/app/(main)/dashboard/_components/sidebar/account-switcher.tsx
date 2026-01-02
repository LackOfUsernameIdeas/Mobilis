"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";
import { toast } from "sonner";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";

export function AccountSwitcher({
  user,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  } | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Неуспешно излизане от профила!", {
        description: error.message,
      });
    } else {
      toast.success("Излязохте успешно от профила си!");
      router.push("/auth/login");
    }
  };

  if (!user) {
    return (
      <a href="/auth/login" className="text-muted-foreground hover:text-primary text-sm font-medium">
        Влезте
      </a>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 cursor-pointer rounded-lg">
          <AvatarImage src={user.avatar || undefined} alt={user.name} />
          <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <div className="flex w-full items-center gap-2 px-2 py-2">
          <Avatar className="size-9 rounded-lg">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut />
          Изход
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
