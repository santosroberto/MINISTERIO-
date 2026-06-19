"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { MobileSidebar } from "@/components/mobile-sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main className="flex-1 md:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
