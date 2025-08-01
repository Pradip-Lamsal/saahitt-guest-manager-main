
import * as React from "react"
import { cn } from "@/lib/utils"

interface MockupProps {
  type?: "responsive" | "desktop" | "mobile"
  children: React.ReactNode
  className?: string
}

export function Mockup({ type = "responsive", children, className }: MockupProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-lg", className)}>
      {children}
    </div>
  )
}

interface MockupFrameProps {
  children: React.ReactNode
  className?: string
}

export function MockupFrame({ children, className }: MockupFrameProps) {
  return (
    <div className={cn("relative mx-auto max-w-5xl", className)}>
      <div className="relative z-20 overflow-hidden rounded-xl border border-[#E6DFC7] bg-white shadow-2xl">
        <div className="flex h-6 items-center border-b bg-[#FAF3E0] px-4">
          <div className="flex space-x-2">
            <div className="h-2 w-2 rounded-full bg-[#FF6F00]" />
            <div className="h-2 w-2 rounded-full bg-[#FF9A3C]" />
            <div className="h-2 w-2 rounded-full bg-[#00796B]" />
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
