"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
}

function Avatar({ className, src, alt, fallback, ...props }: AvatarProps) {
  const [error, setError] = React.useState(false)
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {src && !error ? (
        <Image
          src={src}
          alt={alt || ""}
          className="aspect-square h-full w-full object-cover"
          onError={() => setError(true)}
          width={40}
          height={40}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-medium" aria-hidden="true">
          {fallback || alt?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}
    </div>
  )
}
Avatar.displayName = "Avatar"

export { Avatar }
