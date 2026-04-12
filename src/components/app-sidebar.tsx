"use client"

import * as React from "react"
import {
  LayoutPanelLeft,
  LayoutDashboard,
  Mail,
  CheckSquare,
  MessageCircle,
  Calendar,
  Shield,
  AlertTriangle,
  Settings,
  HelpCircle,
  CreditCard,
  LayoutTemplate,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"
import { SidebarNotification } from "@/components/sidebar-notification"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "FAEM Admin",
    email: "admin@faem.studio",
    avatar: "",
  },
  navGroups: [
    {
      label: "Management",
      items: [
        {
          title: "Dashboard",
          url: "dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Inventory",
          url: "products",
          icon: LayoutPanelLeft,
        },
        {
          title: "Collections",
          url: "categories",
          icon: LayoutTemplate,
        },
        {
          title: "Sales",
          url: "orders",
          icon: CreditCard,
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          title: "Customers",
          url: "customers",
          icon: Users,
        },
        {
          title: "Settings",
          url: "settings",
          icon: Settings,
        },
        {
          title: "Help Center",
          url: "help",
          icon: HelpCircle,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-black tracking-tight">FAEM Manager</span>
                  <span className="truncate text-[10px] uppercase font-bold text-zinc-400">Studio Command</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarNotification />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
