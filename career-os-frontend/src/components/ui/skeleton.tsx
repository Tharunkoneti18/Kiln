import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Shaped loaders, not spinners: the skeleton should occupy the same box the
 * real content will, so nothing shifts when data arrives.
 */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("bg-raised animate-pulse rounded-md", className)} {...props} />;
}
