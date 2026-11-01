"use client";

import {
  ArrowCounterClockwise,
  Pause,
  Play,
  SkipForward,
  SpeakerHigh,
  Subtitles,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { PlaybackSnapshot } from "../../lib/tutor/playback";
import { cn } from "@/lib/utils";

/**
 * Transport for the lesson.
 *
 * The speed and volume controls stay native `select` and `range` elements.
 * Styled, but native: they already carry the right semantics and keyboard
 * behaviour, and a custom replacement would only subtract from that.
 */
export function PlayerControls({
  snapshot,
  durationMs,
  onPlay,
  onPause,
  onSeek,
  onNext,
  saveState,
  captionsEnabled,
  onToggleCaptions,
  rate,
  onRateChange,
  volume,
  onVolumeChange,
}: {
  snapshot: PlaybackSnapshot;
  durationMs: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (value: number) => void;
  onNext: () => void;
  saveState: string;
  captionsEnabled: boolean;
  onToggleCaptions: () => void;
  rate: number;
  onRateChange: (rate: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}) {
  const atEnd = snapshot.absolute_position_ms >= snapshot.total_ms;
  const label = snapshot.playing
    ? "Pause lesson"
    : atEnd
      ? "Replay lesson"
      : snapshot.position_ms > 0
        ? "Resume lesson"
        : "Play lesson";
  const played = Math.min(snapshot.total_ms, Math.max(0, snapshot.absolute_position_ms));
  const PlayIcon = snapshot.playing ? Pause : atEnd ? ArrowCounterClockwise : Play;
  const playedPercent = (played / Math.max(1, durationMs)) * 100;
  const saveFailed = saveState === "Unsaved";

  return (
    <div
      aria-label="Lesson playback controls"
      className="bg-card/92 sticky bottom-0 z-20 flex flex-col gap-3 border-t px-4 py-3 backdrop-blur-md sm:px-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
          <Button onClick={snapshot.playing ? onPause : onPlay} aria-label={label} size="sm">
            <PlayIcon size={14} weight="fill" />
            {snapshot.playing
              ? "Pause"
              : atEnd
                ? "Replay"
                : snapshot.position_ms > 0
                  ? "Resume"
                  : "Play"}
          </Button>
        </motion.div>

        <span className="numeric text-muted-foreground shrink-0 text-[12px]">
          <span className="text-foreground font-semibold">{formatTime(played)}</span> /{" "}
          {formatTime(snapshot.total_ms)}
        </span>

        <label className="sr-only" htmlFor="lesson-progress">
          Seek lesson
        </label>
        <input
          id="lesson-progress"
          type="range"
          min={0}
          max={durationMs}
          value={played}
          onChange={(event) => onSeek(Number(event.target.value))}
          // The filled portion is painted with a gradient so the track shows
          // position without a second element layered over the input.
          className="accent-primary h-1.5 min-w-[140px] flex-1 cursor-pointer appearance-none rounded-full"
          style={{
            background:
              "linear-gradient(to right, var(--primary) 0%, var(--primary) " +
              playedPercent +
              "%, var(--border) " +
              playedPercent +
              "%, var(--border) 100%)",
          }}
        />

        <span
          aria-live="polite"
          className={cn(
            "shrink-0 text-[11.5px] font-semibold",
            saveFailed ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {saveState}
        </span>

        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
          <Button variant="secondary" size="sm" onClick={onNext}>
            Next chapter <SkipForward size={13} weight="bold" />
          </Button>
        </motion.div>
      </div>

      <div
        aria-label="Audio and caption settings"
        className="text-muted-foreground flex flex-wrap items-center gap-4 text-[12px]"
      >
        <button
          type="button"
          aria-pressed={captionsEnabled}
          onClick={onToggleCaptions}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold transition-colors",
            captionsEnabled ? "text-primary bg-primary/10" : "hover:text-foreground",
          )}
        >
          <Subtitles size={15} />
          {captionsEnabled ? "Captions on" : "Captions off"}
        </button>

        <label className="flex items-center gap-1.5">
          Speed
          <select
            aria-label="Playback speed"
            value={rate}
            onChange={(event) => onRateChange(Number(event.target.value))}
            className="bg-card border-input text-foreground focus-visible:border-primary rounded-md border px-1.5 py-1 text-[12px] font-semibold focus-visible:outline-none"
          >
            <option value={0.75}>0.75x</option>
            <option value={0.9}>0.9x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
          </select>
        </label>

        <label className="flex items-center gap-1.5">
          <SpeakerHigh size={15} />
          Volume
          <input
            aria-label="Volume"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            className="accent-primary h-1 w-20 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}

function formatTime(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
}
