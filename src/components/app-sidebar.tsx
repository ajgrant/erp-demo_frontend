"use client";

import * as React from "react";
import {
  IconBrandSketch,
  IconCalendar,
  IconCamera,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconListDetails,
  IconPackage,
  IconReport,
  IconSettings,
  IconShoppingCart,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: IconListDetails,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: IconPackage,
    },
    {
      title: "Sales",
      url: "/dashboard/sales",
      icon: IconShoppingCart,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],
  documents: [
    {
      name: "Today's Sales",
      url: "/dashboard/reports/today",
      icon: IconCalendar,
    },
    {
      name: "Weekly Sales",
      url: "/dashboard/reports/weekly",
      icon: IconReport,
    },
    {
      name: "Monthly Sales",
      url: "/dashboard/reports/monthly",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const userData = {
    name: session?.user?.name ?? "none",
    email: session?.user?.email ?? "none",
    avatar: session?.user?.image ?? "none",
    firstName: session?.user?.firstName ?? "none",
    lastName: session?.user?.lastName ?? "none",
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconBrandSketch className="!size-5" />
                <span className="text-base font-semibold">
                  Smart Inventory & POS
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {session?.user && <NavUser user={userData} />}
      </SidebarFooter>
    </Sidebar>
  );
}
