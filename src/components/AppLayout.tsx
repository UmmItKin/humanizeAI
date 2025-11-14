import type { ReactNode } from "react"
import { Home, Settings, History, BookOpen } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Footer } from "@/components/FooterReact"
import { Toaster } from "sonner"
import { useState } from "react"

interface AppLayoutProps {
  children: ReactNode
  title: string
  currentSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  {
    id: "home",
    title: "Home",
    icon: Home,
  },
  {
    id: "word-finder",
    title: "Word Finder",
    icon: BookOpen,
  },
  {
    id: "history",
    title: "History",
    icon: History,
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
  },
]

function SidebarContentWrapper({ 
  currentSection, 
  onSectionChange 
}: { 
  currentSection: string
  onSectionChange: (section: string) => void 
}) {
  const { state } = useSidebar()
  
  return (
    <SidebarContent>
      <SidebarGroup>
        {state === "expanded" && (
          <div className="px-4 py-4">
            <h2 className="text-lg font-bold">Humanizer AI</h2>
          </div>
        )}
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => onSectionChange(item.id)}
                  isActive={currentSection === item.id}
                  tooltip={item.title}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}

export function AppLayout({ children, title, currentSection, onSectionChange }: AppLayoutProps) {
  const [open, setOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebar:state")
      return savedState ? savedState === "true" : true
    }
    return true
  })

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar:state", String(newOpen))
    }
  }

  return (
    <SidebarProvider 
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Sidebar collapsible="icon">
        <SidebarContentWrapper 
          currentSection={currentSection} 
          onSectionChange={onSectionChange} 
        />
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">{title}</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
        <Footer />
      </SidebarInset>
      <Toaster position="bottom-right" richColors theme="dark" />
    </SidebarProvider>
  )
}
