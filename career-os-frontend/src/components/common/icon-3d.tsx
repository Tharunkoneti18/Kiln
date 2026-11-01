"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Rendered 3D illustrations for category tiles and featured cards.
 *
 * Source: Microsoft Fluent Emoji (MIT licence), served from jsDelivr and
 * pinned to one commit so the artwork cannot change underneath the app. If an
 * image fails (offline, blocked CDN) the tile shows the supplied fallback
 * icon instead of a broken image.
 */
const COMMIT = "1ffb34c752ecf5d402f04cfb4b392c77f57c54bc";
const BASE = "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@" + COMMIT + "/assets/";

export const icon3d = {
  tutor: "Teacher/Default/3D/teacher_3d_default.png",
  plan: "Spiral%20calendar/3D/spiral_calendar_3d.png",
  gaps: "Magnifying%20glass%20tilted%20left/3D/magnifying_glass_tilted_left_3d.png",
  lab: "Trophy/3D/trophy_3d.png",
  interview: "Microphone/3D/microphone_3d.png",
  projects: "Hammer%20and%20wrench/3D/hammer_and_wrench_3d.png",
  shadow: "Man%20technologist/Default/3D/man_technologist_3d_default.png",
  jobs: "Briefcase/3D/briefcase_3d.png",
  twin: "Brain/3D/brain_3d.png",
  market: "Chart%20increasing/3D/chart_increasing_3d.png",
  roles: "Compass/3D/compass_3d.png",
  optimizer: "Rocket/3D/rocket_3d.png",
  library: "Books/3D/books_3d.png",
  readiness: "Bullseye/3D/bullseye_3d.png",
  applications: "Clipboard/3D/clipboard_3d.png",
  assistant: "Robot/3D/robot_3d.png",
  profile: "Woman%20technologist/Default/3D/woman_technologist_3d_default.png",
  notes: "Memo/3D/memo_3d.png",
  idea: "Light%20bulb/3D/light_bulb_3d.png",
  laptop: "Laptop/3D/laptop_3d.png",
  graduation: "Graduation%20cap/3D/graduation_cap_3d.png",
  fire: "Fire/3D/fire_3d.png",
  star: "Star/3D/star_3d.png",
  sparkles: "Sparkles/3D/sparkles_3d.png",
  chart: "Bar%20chart/3D/bar_chart_3d.png",
  company: "Office%20building/3D/office_building_3d.png",
  handshake: "Handshake/3D/handshake_3d.png",
  puzzle: "Puzzle%20piece/3D/puzzle_piece_3d.png",
  bell: "Bell/3D/bell_3d.png",
  chat: "Speech%20balloon/3D/speech_balloon_3d.png",
} as const;

export type Icon3DName = keyof typeof icon3d;

export function Icon3D({
  name,
  size = 64,
  className,
  fallback,
}: {
  name: Icon3DName;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={cn("grid place-items-center", className)} style={{ width: size, height: size }}>{fallback}</span>;
  return (
    // A plain img: these are fixed-size decorative illustrations with no
    // layout shift, so next/image's optimisation pipeline adds nothing.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BASE + icon3d[name]}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={cn("pointer-events-none select-none object-contain drop-shadow-[0_6px_10px_rgb(30_60_140/0.18)]", className)}
      style={{ width: size, height: size }}
    />
  );
}
