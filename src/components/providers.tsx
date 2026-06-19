"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { ReactNode } from "react"
import { AuthProvider } from "@/auth/auth-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
        <Toaster
          richColors
          closeButton
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}
