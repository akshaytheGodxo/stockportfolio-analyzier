import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/layout/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-background">
          
          {children}
        </main>
      </div>
    </div>
  )
}