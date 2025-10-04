import React from 'react'
import clsx from 'clsx'

export function Progress({ value=0, className }:{ value?: number, className?: string }) {
  return (
    <div className={clsx('h-2 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}
