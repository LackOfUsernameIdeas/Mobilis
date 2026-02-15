"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { useAuth } from "@/contexts/auth-context";
import { fetchUserMeasurements } from "@/lib/db/clients/get";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import SidebarMeasurements from "@/app/(main)/dashboard/_components/sidebar/measurements";
import { NavMain } from "./nav-main";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<any>(null);

  useEffect(() => {
    async function loadMeasurements() {
      if (!user) return;

      try {
        const measurements = await fetchUserMeasurements(user.id);
        setMeasurements(measurements);
      } catch (error) {
        console.error("error fetching measurements:", error);
      }
    }

    loadMeasurements();
  }, [user]);

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
      <SidebarContent className="flex flex-col overflow-hidden">
        <NavMain items={sidebarItems} />

        <div className="mt-auto mb-2 max-h-[40vh] overflow-x-hidden overflow-y-auto">
          {measurements && <SidebarMeasurements measurements={measurements} />}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
