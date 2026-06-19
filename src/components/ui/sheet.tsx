"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface SheetContentProps {
  children: React.ReactNode
  side?: "left" | "right"
  className?: string
}

const SheetContext = React.createContext<{ onClose: () => void }>({ onClose: () => {} })

function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null
  return (
    <SheetContext.Provider value={{ onClose: () => onOpenChange(false) }}>
      <div className="fixed inset-0 z-50">
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => onOpenChange(false)}
        />
        {children}
      </div>
    </SheetContext.Provider>
  )
}

function SheetContent({ children, side = "right", className }: SheetContentProps) {
  const { onClose } = React.useContext(SheetContext)
  return (
    <div
      className={cn(
        "fixed top-0 z-50 h-full w-3/4 max-w-sm border bg-background p-6 shadow-lg",
        side === "left" ? "left-0" : "right-0",
        className
      )}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      {children}
    </div>
  )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left mb-6", className)} {...props} />
  )
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />
}

export { Sheet, SheetContent, SheetHeader, SheetTitle }
