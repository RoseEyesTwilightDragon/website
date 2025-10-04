import React, { cloneElement, isValidElement } from 'react'

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
export function Tooltip({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>
}
export function TooltipTrigger({ asChild, children }: { asChild?: boolean, children: any }) {
  return asChild && isValidElement(children) ? cloneElement(children, { 'data-tooltip-trigger': true }) : children
}
export function TooltipContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`pointer-events-none absolute left-1/2 z-50 mt-2 -translate-x-1/2 rounded-md border bg-white px-2 py-1 text-xs shadow ${className}`}>
      {children}
    </div>
  )
}
