"use client";

import Link from "next/link";
import { Bell } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notifications } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

/** Bell with an unread count, opening the four most recent alerts. */
export function NotificationsMenu() {
  const reduce = useReducedMotion();
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={"Notifications, " + unread + " unread"}
          className="hover:bg-raised text-foreground/80 relative grid size-10 place-items-center rounded-full transition-colors"
        >
          <Bell size={21} />
          {unread > 0 && (
            <motion.span
              className="bg-destructive text-destructive-foreground absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full px-1 text-[9.5px] font-bold"
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.4 }}
            >
              {unread}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-[13px] font-bold">Notifications</span>
          <span className="text-muted-foreground text-[11.5px]">{unread} unread</span>
        </div>
        <ul className="flex flex-col">
          {notifications.slice(0, 4).map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "hover:bg-raised flex gap-3 border-b px-4 py-3 transition-colors",
                  !item.read && "bg-primary/[0.04]",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", item.read ? "bg-transparent" : "bg-primary")}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-semibold">{item.title}</span>
                  <span className="text-muted-foreground block text-[11.5px] leading-snug">{item.body}</span>
                </span>
                <span className="text-muted-foreground shrink-0 text-[10.5px]">{item.time}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/notifications" className="text-primary block px-4 py-2.5 text-center text-[12px] font-semibold">
          See all notifications
        </Link>
      </PopoverContent>
    </Popover>
  );
}
