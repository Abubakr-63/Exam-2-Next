import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      default:
        "bg-blue-600 text-white shadow-xs hover:bg-blue-500 active:bg-blue-700",
      destructive:
        "bg-red-600/90 text-white shadow-xs hover:bg-red-500",
      outline:
        "border border-zinc-800 bg-[#18181c] text-zinc-200 shadow-xs hover:bg-zinc-800/80 hover:text-white",
      secondary:
        "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
      ghost:
        "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100",
      link: "text-blue-400 underline-offset-4 hover:underline",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      default: "h-9 px-4 py-2 text-xs font-medium",
      sm: "h-7 rounded-md px-2.5 text-xs",
      lg: "h-10 rounded-md px-6 text-sm",
      icon: "h-8 w-8",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
