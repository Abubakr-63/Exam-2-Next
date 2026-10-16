import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "border-transparent bg-blue-600/20 text-blue-400 border-blue-500/30",
    secondary: "border-zinc-700/80 bg-zinc-800/90 text-zinc-300",
    destructive: "border-red-500/30 bg-red-500/15 text-red-400",
    outline: "text-zinc-300 border-zinc-700 bg-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
