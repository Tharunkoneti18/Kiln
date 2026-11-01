import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "bg-card border-input text-foreground h-9 w-full rounded-md border px-3 text-sm transition-colors",
        "placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/25 focus-visible:ring-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "bg-card border-input text-foreground min-h-24 w-full resize-y rounded-md border px-3 py-2 text-sm leading-relaxed transition-colors",
        "placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/25 focus-visible:ring-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}

/** Helper text sits under the label, above the control. */
export function FieldHint({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-[12px] leading-snug", className)} {...props} />
  );
}

/** Error text sits below the control it describes. */
export function FieldError({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      role="alert"
      className={cn("text-destructive text-[12px] leading-snug font-medium", className)}
      {...props}
    />
  );
}

/** Standard vertical rhythm for a label plus control plus message. */
export function Field({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}
