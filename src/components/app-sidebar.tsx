"use client"

import * as React from "react"
import {
  LayoutPanelLeft,
  LayoutDashboard,
  LayoutTemplate,
  CreditCard,
  Settings,
  Users,
  BookOpen,
  Monitor,
  Mail,
  Tag,
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
      label: "Operasyon",
      items: [
        {
          title: "Dashboard",
          url: "dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Envanter",
          url: "products",
          icon: LayoutPanelLeft,
        },
        {
          title: "Siparişler",
          url: "orders",
          icon: CreditCard,
        },
        {
          title: "Koleksiyonlar",
          url: "collections",
          icon: LayoutTemplate,
        },
        {
          title: "Kategoriler",
          url: "categories",
          icon: LayoutPanelLeft,
        },
        {
          title: "Mesajlar",
          url: "messages",
          icon: Mail,
        },
        {
          title: "İndirim Kodları",
          url: "promotions",
          icon: Tag,
        },
      ],
    },
    {
      label: "Editöryal",
      items: [
        {
          title: "Vitrin Yönetimi",
          url: "cms",
          icon: Monitor,
        },
        {
          title: "Stüdyo Günlüğü",
          url: "journal",
          icon: BookOpen,
        },
        {
          title: "Müşteriler",
          url: "customers",
          icon: Users,
        },
      ],
    },
    {
      label: "Sistem",
      items: [
        {
          title: "Ayarlar",
          url: "settings",
          icon: Settings,
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
                  <span className="truncate font-semibold tracking-tight text-zinc-900">FAEM Manager</span>
                  <span className="truncate text-[10px] uppercase font-medium text-zinc-500">Studio Command</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {data.navGroups.map((group, index) => (
          <NavMain key={index} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
