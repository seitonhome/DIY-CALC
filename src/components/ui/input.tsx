import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, prefix, suffix, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-stone-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-sm text-stone-400 pointer-events-none">{prefix}</span>
          )}
          <input
            id={inputId}
            type={type ?? "text"}
            className={cn(
              "flex h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400",
              "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-stone-50",
              "transition-all",
              error && "border-red-400 focus:ring-red-400",
              prefix && "pl-8",
              suffix && "pr-8",
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-sm text-stone-400 pointer-events-none">{suffix}</span>
          )}
        </div>
        {hint && !error && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
