"use client";

import Link from "next/link";
import { Bell } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notifications } from "@/lib/mock/data";
import { spring } from "@/lib/motion";
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
          className="text-gray-11 hover:bg-gray-3 hover:text-foreground relative grid size-8 place-items-center rounded-[var(--radius-control)] transition-colors"
        >
          <Bell size={17} />
          {unread > 0 && (
            <motion.span
              className="bg-brand ring-background absolute top-1.5 right-1.5 size-2 rounded-full ring-2"
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...spring.snappy, delay: 0.5 }}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] overflow-hidden p-0">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <span className="text-[13.5px] font-semibold">Notifications</span>
          <span className="text-gray-10 text-[12px]">{unread} unread</span>
        </div>
        <ul className="flex flex-col pb-1">
          {notifications.slice(0, 4).map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="hover:bg-gray-2 flex gap-3 px-4 py-2.5 transition-colors">
                <span aria-hidden="true" className={cn("mt-[7px] size-1.5 shrink-0 rounded-full", item.read ? "bg-transparent" : "bg-brand")} />
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[13px]", item.read ? "text-gray-11" : "font-medium text-foreground")}>{item.title}</span>
                  <span className="text-gray-10 mt-0.5 line-clamp-2 block text-[12px] leading-snug">{item.body}</span>
                </span>
                <span className="text-gray-9 shrink-0 text-[11px] tabular">{item.time}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/notifications" className="text-gray-11 hover:text-foreground block border-t border-border px-4 py-2.5 text-center text-[12.5px] font-medium transition-colors">
          View all notifications
        </Link>
      </PopoverContent>
    </Popover>
  );
}
