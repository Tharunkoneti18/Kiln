"use client";

import { useEffect, useMemo, useState } from "react";
import { PlaybackController, type PlaybackSnapshot } from "./playback";
import type { LessonManifest } from "./types";

export function useTutorPlayback(lesson: LessonManifest) {
  const controller = useMemo(() => new PlaybackController(lesson), [lesson]);
  const [snapshot, setSnapshot] = useState<PlaybackSnapshot>(() => controller.getSnapshot());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setSnapshot);
    const timer = window.setInterval(() => controller.advance(), 100);
    return () => { unsubscribe(); window.clearInterval(timer); };
  }, [controller]);

  return { controller, snapshot };
}
