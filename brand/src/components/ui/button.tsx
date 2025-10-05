import React from 'react'
import clsx from 'clsx'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
}

export function Button({ className, variant='default', size='md', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl transition border select-none'
  const variants: Record<string,string> = {
    default: 'bg-primary text-white border-transparent hover:opacity-90',
    outline: 'bg-transparent border-border text-foreground hover:bg-muted/40',
    secondary: 'bg-muted text-foreground border-border hover:bg-muted/60',
    ghost: 'bg-transparent border-transparent hover:bg-muted/40'
  }
  const sizes: Record<string,string> = { sm: 'h-8 px-2 text-sm', md: 'h-10 px-4 text-sm' }
  return <button className={clsx(base, variants[variant], sizes[size], className)} {...props} />
}
export default Button

