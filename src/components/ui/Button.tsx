"use client";

import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base =
      "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold shadow-sm disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      primary: "bg-brand-orange text-white hover:bg-brand-orange/90",
      secondary:
        "border border-black/10 bg-white text-brand-purple hover:border-brand-purple/30",
    } as const;

    return (
      <button
        ref={ref}
        className={[base, variants[variant], className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
