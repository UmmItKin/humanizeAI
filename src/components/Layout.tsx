import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Footer } from "@/components/FooterReact"
import { Toaster } from "sonner"

interface LayoutProps {
  children: ReactNode
  title: string
}

export function Layout({ children, title }: LayoutProps) {
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
      <AppSidebar />
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
