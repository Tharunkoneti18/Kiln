import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Text inputs. The focus treatment is a 3px soft brand ring plus a border
 * colour change, which reads clearly without the jump of a thicker border.
 */
const control = [
  "bg-card text-foreground w-full rounded-[var(--radius-control)] border border-input shadow-xs",
  "transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)]",
  "placeholder:text-gray-9 hover:border-border-strong",
  "focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand)_18%,transparent)] focus-visible:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:border-danger aria-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--danger)_18%,transparent)]",
].join(" ");

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return <input type={type} className={cn(control, "h-9 px-3 text-[13.5px]", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 resize-y px-3 py-2.5 text-[13.5px] leading-relaxed", className)} {...props} />;
}

/** Helper text sits under the label, above the control. */
export function FieldHint({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-muted-foreground text-[12px] leading-snug", className)} {...props} />;
}

/** Error text sits below the control it describes. */
export function FieldError({ className, ...props }: ComponentProps<"p">) {
  return <p role="alert" className={cn("text-danger text-[12px] leading-snug font-medium", className)} {...props} />;
}

/** Standard vertical rhythm for a label plus control plus message. */
export function Field({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}
