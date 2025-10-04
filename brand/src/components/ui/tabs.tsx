import React, { createContext, useContext } from 'react'
import clsx from 'clsx'

type Ctx = { value: string, setValue: (v:string)=>void }
const TabsCtx = createContext<Ctx|null>(null)

export function Tabs({ value, onValueChange, children, className }:{
  value: string, onValueChange: (v:string)=>void, children: React.ReactNode, className?: string
}) {
  return (
    <div className={className} role="tablist" aria-label="Tabs">
      {React.Children.map(children, (c) =>
        React.isValidElement(c) ? React.cloneElement(c as any, { __tabs: { value, onValueChange }}) : c
      )}
    </div>
  )
}

export function TabsList({ children, className, __tabs }: any) {
  return (
    <div className={clsx('inline-grid gap-1 rounded-xl border p-1', className)}>
      <TabsCtx.Provider value={{ value: __tabs.value, setValue: __tabs.onValueChange }}>
        {children}
      </TabsCtx.Provider>
    </div>
  )
}

export function TabsTrigger({ value, children, className }:{
  value:string, children:React.ReactNode, className?:string
}) {
  const ctx = useContext(TabsCtx)!; const active = ctx.value === value
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={()=>ctx.setValue(value)}
      className={clsx('rounded-lg px-3 py-2 text-sm', active ? 'bg-white shadow' : 'hover:bg-white/60', className)}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }:{
  value:string, children:React.ReactNode, className?:string
}) {
  const ctx = useContext(TabsCtx)!; if (ctx.value !== value) return null
  return <div className={className}>{children}</div>
}
