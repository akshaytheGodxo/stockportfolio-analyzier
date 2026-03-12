import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { ChevronDown, Plus, User2, TrendingUp, BriefcaseBusiness, Calculator, BrainCog } from "lucide-react"

const sidebar_menu = [
  { id: "1", name: "Your Portfolio", href: "/dashboard/portfolio", icon: BriefcaseBusiness },
  { id: "2", name: "Market Trends", href: "/dashboard/trends", icon: TrendingUp },
  { id: "3", name: "Stock Calculator", href: "/calculate", icon: Calculator },
  { id: "4", name: "Dlorious", href: "/dlorious", icon: BrainCog },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="cursor-pointer">
        Pookie Wallet
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebar_menu.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <a href={project.href}>
                      <project.icon />
                      <span>{project.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User2 /> Username
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}