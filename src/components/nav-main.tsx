import { ChevronRight, type LucideIcon } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  label,
  items,
}: {
  label: string
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
  key?: string | number
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'dashboard'

  return (
    <SidebarGroup className="mb-2">
      <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400/70 mb-1 px-3">{label}</SidebarGroupLabel>
      <SidebarMenu className="gap-1 px-2">
        {items.map((item) => {
          const isActive = currentTab === item.url
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} className="cursor-pointer font-medium text-[13px]">
                        {item.icon && <item.icon className="w-4 h-4 opacity-70" />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              className="cursor-pointer font-medium text-[13px]" 
                              isActive={currentTab === subItem.url}
                              onClick={() => setSearchParams({ tab: subItem.url })}
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    className={`cursor-pointer transition-all duration-200 rounded-xl h-9 ${isActive ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10 hover:bg-zinc-800 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`} 
                    isActive={isActive}
                    onClick={() => setSearchParams({ tab: item.url })}
                  >
                    {item.icon && <item.icon className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-70'}`} />}
                    <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
