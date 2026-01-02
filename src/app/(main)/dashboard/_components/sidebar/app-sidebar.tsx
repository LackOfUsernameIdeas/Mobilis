"use client";

import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

import { NavMain } from "./nav-main";
import Link from "next/link";

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  } | null;
}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-transparent active:bg-transparent data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard/stats" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt={APP_CONFIG.name}
                  width={120}
                  height={120}
                  className="h-8 w-auto transition-transform group-data-[collapsible=icon]:hidden hover:scale-110 active:scale-100"
                  priority
                  quality={100}
                />
                <Image
                  src="/logoSmall.png"
                  alt={APP_CONFIG.name}
                  width={32}
                  height={32}
                  className="hidden h-6 w-6 transition-transform group-data-[collapsible=icon]:block hover:scale-110 active:scale-100"
                  priority
                  quality={100}
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
      </SidebarContent>
    </Sidebar>
  );
}
