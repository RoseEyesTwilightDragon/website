import React from 'react'
import clsx from 'clsx'

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={clsx('inline-flex items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs', className)} {...props}/>
}

