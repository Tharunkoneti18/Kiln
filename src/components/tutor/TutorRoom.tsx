"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ArrowSquareOut,
  BookmarkSimple,
  Books,
  ChalkboardTeacher,
  CheckCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Sparkle,
  Target,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioOption } from "@/components/ui/radio-group";
import { InlineError } from "@/components/common/states";
import { useResolvedTheme } from "@/components/shell/theme-provider";
import { scenePalette } from "@/components/three/palette";
import type { LessonManifest } from "../../lib/tutor/types";
import { useTutorPlayback } from "../../lib/tutor/useTutorPlayback";
import {
  ApiProgressStore,
  LocalProgressStore,
  type ProgressStore,
} from "../../lib/tutor/progress-store";
import {
  narrationFromPosition,
  pauseNarration,
  speakNarration,
  stopNarration,
} from "../../lib/tutor/narration";
import { createLearningEvent, LearningEventOutbox, type LearningEvent } from "../../lib/tutor/events";
import { Instructor } from "./Instructor";
import { LessonOutline } from "./LessonOutline";
import { PlayerControls } from "./PlayerControls";
import { Whiteboard } from "./Whiteboard";
import { TutorCompanion } from "./TutorCompanion";
import { cn } from "@/lib/utils";

/**
 * The lesson room.
 *
 * One playback controller owns the clock; narration, the board and the
 * progress checkpoints all subscribe to it. Everything below the presentation
 * layer is unchanged from the original implementation, including the save
 * semantics: "Saved" is only ever shown once persistence has actually
 * confirmed, and a failure keeps the local state and offers a retry.
 */
export function TutorRoom({
  lesson,
  progressStore,
  userId: authenticatedUserId = "local-demo",
  context = "Week 01 of your plan",
  pathLabel = "Your career path",
}: {
  lesson: LessonManifest;
  progressStore?: ProgressStore;
  userId?: string;
  /** Where this lesson sits in the learning plan, supplied by the planner. */
  context?: string;
  pathLabel?: string;
}) {
  const { controller, snapshot } = useTutorPlayback(lesson);
  const [store, setStore] = useState<ProgressStore | null>(progressStore ?? null);
  const [saveState, setSaveState] = useState("Progress ready");
  const [voiceMessage, setVoiceMessage] = useState("");
  const [answerMessage, setAnswerMessage] = useState("");
  const [eventPending, setEventPending] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [rate, setRate] = useState(0.92);
  const [volume, setVolume] = useState(1);
  const [zoom, setZoom] = useState(1);
  const previousSegment = useRef(snapshot.segment_id);
  const completionEmitted = useRef(false);
  const userId = authenticatedUserId;
  const apiBaseUrl = process.env.NEXT_PUBLIC_TUTOR_API_BASE_URL ?? "";
  const palette = scenePalette(useResolvedTheme());
  const eventOutbox = useMemo(
    () => new LearningEventOutbox(apiBaseUrl, fetch, undefined, userId),
    [apiBaseUrl, userId],
  );
  const currentSegment =
    lesson.segments.find((segment) => segment.segment_id === snapshot.segment_id) ??
    lesson.segments[0];
  const durationMs = useMemo(
    () => lesson.segments.reduce((sum, segment) => sum + segment.duration_ms, 0),
    [lesson],
  );

  useEffect(() => {
    if (progressStore) return;
    const baseUrl = process.env.NEXT_PUBLIC_TUTOR_API_BASE_URL;
    setStore(baseUrl ? new ApiProgressStore(baseUrl) : new LocalProgressStore(window.localStorage));
  }, [progressStore]);

  const saveProgress = useCallback(async () => {
    if (!store) return;
    setSaveState("Saving…");
    try {
      await store.save(userId, {
        ...controller.getSnapshot(),
        preferences: { captions_enabled: captionsEnabled, playback_rate: rate, volume },
      });
      setSaveState(
        process.env.NEXT_PUBLIC_TUTOR_API_BASE_URL ? "Saved" : "Saved on this device",
      );
    } catch {
      setSaveState("Unsaved");
    }
  }, [captionsEnabled, controller, rate, store, userId, volume]);

  const emitEvent = useCallback(
    async (
      eventType: LearningEvent["event_type"],
      payload: Record<string, unknown>,
      idempotencyKey: string,
    ) => {
      if (!process.env.NEXT_PUBLIC_TUTOR_API_BASE_URL || userId === "local-demo") return;
      const event = createLearningEvent({
        event_id: crypto.randomUUID(),
        event_type: eventType,
        user_id: userId,
        aggregate_id: lesson.lesson_id,
        occurred_at: new Date().toISOString(),
        idempotency_key: idempotencyKey,
        payload,
      });
      try {
        await eventOutbox.emit(event);
        setEventPending(eventOutbox.pendingCount() > 0);
      } catch {
        setEventPending(true);
      }
    },
    [eventOutbox, lesson.lesson_id, userId],
  );

  const retryLearningEvents = useCallback(async () => {
    try {
      await eventOutbox.retryPending();
      setEventPending(eventOutbox.pendingCount() > 0);
    } catch {
      setEventPending(true);
    }
  }, [eventOutbox]);

  useEffect(() => {
    if (!apiBaseUrl || userId === "local-demo") return;
    void retryLearningEvents();
    const timer = window.setInterval(() => void retryLearningEvents(), 15000);
    const onOnline = () => void retryLearningEvents();
    window.addEventListener("online", onOnline);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", onOnline);
    };
  }, [apiBaseUrl, retryLearningEvents, userId]);

  useEffect(() => {
    if (!store) return;
    void store
      .load(userId, lesson.lesson_id)
      .then((saved) => {
        if (saved) {
          try {
            controller.restore(saved);
            if (saved.preferences) {
              setCaptionsEnabled(saved.preferences.captions_enabled);
              setRate(saved.preferences.playback_rate);
              setVolume(saved.preferences.volume);
            }
            setSaveState(
              process.env.NEXT_PUBLIC_TUTOR_API_BASE_URL ? "Saved" : "Saved on this device",
            );
          } catch {
            setSaveState("Progress from an older lesson version");
          }
        }
      })
      .catch(() => setSaveState("Progress could not be loaded"));
  }, [controller, lesson.lesson_id, store, userId]);

  useEffect(() => {
    if (!snapshot.playing) return;
    const timer = window.setInterval(() => void saveProgress(), 15000);
    return () => window.clearInterval(timer);
  }, [saveProgress, snapshot.playing]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") void saveProgress();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [saveProgress]);

  useEffect(() => {
    if (snapshot.segment_id !== previousSegment.current) {
      if (snapshot.playing) speakNarration(currentSegment.narration_text, { rate, volume });
      void saveProgress();
    }
    previousSegment.current = snapshot.segment_id;
  }, [
    currentSegment.narration_text,
    rate,
    saveProgress,
    snapshot.playing,
    snapshot.segment_id,
    volume,
  ]);

  useEffect(() => {
    const atEnd =
      snapshot.segment_id === lesson.segments.at(-1)?.segment_id &&
      snapshot.position_ms >= currentSegment.duration_ms &&
      !snapshot.playing;
    if (atEnd && !completionEmitted.current) {
      completionEmitted.current = true;
      void saveProgress();
      void emitEvent(
        "lesson.completed",
        { lesson_id: lesson.lesson_id, lesson_version: lesson.version },
        lesson.lesson_id + ":v" + lesson.version + ":completed",
      );
    }
  }, [
    currentSegment.duration_ms,
    emitEvent,
    lesson.lesson_id,
    lesson.segments,
    lesson.version,
    saveProgress,
    snapshot.playing,
    snapshot.position_ms,
    snapshot.segment_id,
  ]);

  const onPlay = () => {
    const atEnd = snapshot.absolute_position_ms >= snapshot.total_ms;
    const eventType = snapshot.position_ms > 0 && !atEnd ? "lesson.resumed" : "lesson.started";
    if (atEnd) {
      completionEmitted.current = false;
      controller.restart();
    } else controller.play();
    const narration = narrationFromPosition(
      currentSegment.narration_text,
      snapshot.position_ms,
      currentSegment.duration_ms,
    );
    if (narration && !speakNarration(narration, { rate, volume }))
      setVoiceMessage(
        "Voice narration is unavailable here. The transcript and board controls still work.",
      );
    else setVoiceMessage("");
    void emitEvent(
      eventType,
      {
        lesson_id: lesson.lesson_id,
        lesson_version: lesson.version,
        segment_id: snapshot.segment_id,
      },
      lesson.lesson_id + ":v" + lesson.version + ":" + eventType + ":" + Date.now(),
    );
  };

  const onPause = () => {
    controller.pause();
    pauseNarration();
    void saveProgress();
    void emitEvent(
      "lesson.paused",
      {
        lesson_id: lesson.lesson_id,
        lesson_version: lesson.version,
        segment_id: snapshot.segment_id,
      },
      lesson.lesson_id + ":v" + lesson.version + ":paused:" + Date.now(),
    );
  };

  const onSeek = (absoluteMs: number) => {
    stopNarration();
    let offset = absoluteMs;
    let segment = lesson.segments[0];
    for (const part of lesson.segments) {
      if (offset <= part.duration_ms) {
        segment = part;
        break;
      }
      offset -= part.duration_ms;
      segment = part;
    }
    if (segment.segment_id !== snapshot.segment_id) {
      controller.restore({
        lesson_id: lesson.lesson_id,
        lesson_version: lesson.version,
        segment_id: segment.segment_id,
        position_ms: Math.min(offset, segment.duration_ms),
        quiz_state: snapshot.quiz_state,
      });
    } else controller.seek(offset);
    void saveProgress();
  };

  const onSelectSegment = (segmentId: string) => {
    stopNarration();
    controller.restore({
      lesson_id: lesson.lesson_id,
      lesson_version: lesson.version,
      segment_id: segmentId,
      position_ms: 0,
      quiz_state: snapshot.quiz_state,
    });
    void saveProgress();
  };

  const segmentIndex = lesson.segments.findIndex(
    (segment) => segment.segment_id === currentSegment.segment_id,
  );
  const progressPercent = Math.round(
    (snapshot.absolute_position_ms / Math.max(1, durationMs)) * 100,
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
        <div className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6">
          {/* Lesson header. */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-2.5">
              <p className="text-brand-text text-[12.5px] font-medium">{context}</p>
              <h1 className="type-title text-foreground">{lesson.title}</h1>
              <p className="text-gray-11 max-w-[64ch] text-[14.5px] leading-relaxed">{lesson.objective}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Badge variant="brand">
                <Sparkle weight="fill" /> {pathLabel}
              </Badge>
              <Badge variant="neutral" className="tabular">
                <Clock /> {Math.round(durationMs / 60000)} min
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[228px_minmax(0,1fr)_280px]">
            {/* Outline rail. */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <Card>
                <CardContent className="p-4">
                  <LessonOutline
                    lesson={lesson}
                    currentSegment={snapshot.segment_id}
                    progressPercent={progressPercent}
                    onSelect={onSelectSegment}
                  />
                </CardContent>
              </Card>
            </aside>

            {/* Board, transcript and checks. */}
            <section aria-label="Lesson workspace" className="flex min-w-0 flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ChalkboardTeacher size={16} className="text-gray-10" />
                  <span className="text-[14px] font-medium text-foreground">{currentSegment.title}</span>
                  <span className="text-gray-10 text-[12.5px] tabular">
                    {segmentIndex + 1} of {lesson.segments.length}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => void saveProgress()}>
                  <BookmarkSimple size={14} /> Save place
                </Button>
              </div>

              {/* Zoom and pan: the board scales inside a clipped frame and can
                  be dragged once enlarged. */}
              <div className="relative">
                <div className="overflow-hidden rounded-[var(--radius-surface)] border border-border shadow-xs">
                  <motion.div
                    animate={{ scale: zoom }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    drag={zoom > 1}
                    dragConstraints={{ left: -240 * (zoom - 1), right: 240 * (zoom - 1), top: -160 * (zoom - 1), bottom: 160 * (zoom - 1) }}
                    dragElastic={0.08}
                    className={zoom > 1 ? "cursor-grab active:cursor-grabbing" : undefined}
                  >
                    <Whiteboard board={controller.getBoard()} title={currentSegment.title} />
                  </motion.div>
                </div>
                <div className="bg-card/90 absolute right-3 bottom-3 flex items-center gap-0.5 rounded-[9px] border border-border p-0.5 shadow-md backdrop-blur">
                  <Button variant="ghost" size="icon-xs" aria-label="Zoom out of the board" onClick={() => setZoom((value) => Math.max(1, +(value - 0.25).toFixed(2)))}><MagnifyingGlassMinus /></Button>
                  <span className="w-10 text-center text-[11.5px] font-medium tabular">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="icon-xs" aria-label="Zoom into the board" onClick={() => setZoom((value) => Math.min(2, +(value + 0.25).toFixed(2)))}><MagnifyingGlassPlus /></Button>
                </div>
              </div>

              <TutorCompanion
                chapter={currentSegment.title}
                boardEvents={controller.getBoard().events}
                isPlaying={snapshot.playing}
                onInterrupt={() => {
                  if (snapshot.playing) onPause();
                }}
              />

              {captionsEnabled && (
                <Card>
                  <CardContent className="flex flex-col gap-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-11 text-[12.5px] font-medium">Lesson transcript</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!speakNarration(currentSegment.narration_text, { rate, volume }))
                            setVoiceMessage("Voice narration is unavailable in this browser.");
                        }}
                      >
                        Listen
                      </Button>
                    </div>
                    <p
                      aria-label="Lesson transcript"
                      className="text-[14px] leading-[1.65] text-foreground"
                    >
                      {currentSegment.narration_text}
                    </p>
                  </CardContent>
                </Card>
              )}

              {voiceMessage && (
                <p
                  role="status"
                  className="text-gray-11 bg-gray-3 rounded-[8px] px-3 py-2 text-[13px]"
                >
                  {voiceMessage}
                </p>
              )}

              {lesson.quiz.map((question, questionIndex) => (
                <Card key={question.id}>
                  <CardContent className="flex flex-col gap-3.5 p-5">
                    <span className="text-brand-text text-[12.5px] font-medium tabular">
                      Check {questionIndex + 1} of {lesson.quiz.length}
                    </span>
                    <fieldset className="flex flex-col gap-3">
                      <legend className="mb-2 text-[15px] leading-snug font-medium text-foreground">
                        {question.prompt}
                      </legend>
                      <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
                        {question.options.map((option, index) => (
                          <RadioOption
                            key={option}
                            checked={snapshot.quiz_state[question.id] === index}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              aria-label={option}
                              className="mt-0.5 accent-[var(--gray-12)]"
                              checked={snapshot.quiz_state[question.id] === index}
                              onChange={() => {
                                controller.setQuizAnswer(question.id, index);
                                setAnswerMessage("Answer saved");
                                void saveProgress();
                                void emitEvent(
                                  "check.submitted",
                                  {
                                    lesson_id: lesson.lesson_id,
                                    lesson_version: lesson.version,
                                    check_id: question.id,
                                    selected_option_index: index,
                                    correct: index === question.answer_index,
                                  },
                                  lesson.lesson_id +
                                    ":v" +
                                    lesson.version +
                                    ":" +
                                    question.id +
                                    ":" +
                                    index,
                                );
                              }}
                            />
                            <span>{option}</span>
                          </RadioOption>
                        ))}
                      </div>
                    </fieldset>
                    {answerMessage && (
                      <span role="status" className="text-success flex items-center gap-1.5 text-[13px] font-medium">
                        <CheckCircle size={15} weight="fill" aria-hidden="true" />
                        <span>{answerMessage}</span>
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* What this lesson is for. Keeps the loop visible from inside it. */}
              <Link
                href="/assessments"
                className="group bg-card hover:border-border-strong flex items-center gap-3.5 rounded-[var(--radius-surface)] border border-border p-4 shadow-xs transition-colors"
              >
                <span className="bg-brand-soft text-brand-text grid size-9 shrink-0 place-items-center rounded-[9px]">
                  <Target size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium text-foreground">This builds toward proof in the Proof Lab</span>
                  <span className="text-gray-10 block text-[12.5px]">Finishing the lesson and its checks sends evidence to your digital twin</span>
                </span>
                <ArrowSquareOut size={14} className="text-gray-9 group-hover:text-gray-11 shrink-0 transition-colors" />
              </Link>
            </section>

            {/* Instructor and materials. */}
            <aside
              aria-label="Your instructor and lesson materials"
              className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start"
            >
              <Card>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-[13.5px] font-medium text-foreground">Your instructor</h2>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={snapshot.playing ? "speaking" : "ready"}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.18 }}
                        className={cn(
                          "rounded-full px-2 py-[3px] text-[11.5px] leading-none font-medium",
                          snapshot.playing ? "bg-brand-soft text-brand-text" : "bg-gray-3 text-gray-11",
                        )}
                      >
                        {snapshot.playing ? "Teaching" : "Ready"}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <Instructor speaking={snapshot.playing} palette={palette} />
                  <div className="bg-gray-2 flex flex-col gap-1 rounded-[10px] border border-border p-3">
                    <span className="text-gray-11 text-[12px] font-medium">Watch for</span>
                    <p className="text-[13px] leading-relaxed text-foreground">
                      Retrieval latency grows with top-k, and chunk size trades recall against precision.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col gap-2.5 p-4">
                  <h3 className="flex items-center gap-1.5 text-[13.5px] font-medium text-foreground">
                    <Books size={15} className="text-gray-10" /> Lesson materials
                  </h3>
                  {currentSegment.materials.map((material) => (
                    <a
                      key={material.label}
                      href={material.uri ?? "#"}
                      aria-label={material.label + ": " + material.description}
                      className="hover:bg-gray-3 group -mx-2 flex items-start gap-2.5 rounded-[8px] p-2 transition-colors"
                    >
                      <span className="bg-gray-3 text-gray-10 group-hover:bg-gray-4 group-hover:text-foreground mt-0.5 grid size-7 shrink-0 place-items-center rounded-[7px] transition-colors">
                        {material.kind === "diagram" ? (
                          <ImageIcon size={14} />
                        ) : (
                          <FileText size={14} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-semibold">{material.label}</span>
                        <span className="text-muted-foreground block text-[11.5px] leading-snug">
                          {material.description}
                        </span>
                      </span>
                    </a>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col gap-2 p-4">
                  <h3 className="text-[13.5px] font-medium text-foreground">Sources</h3>
                  {lesson.sources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-11 hover:text-foreground flex items-center gap-1.5 text-[13px] underline-offset-4 transition-colors hover:underline"
                    >
                      {source.label}
                      <ArrowSquareOut size={12} className="shrink-0" />
                    </a>
                  ))}
                </CardContent>
              </Card>

              {saveState === "Unsaved" && (
                <InlineError
                  title="Progress wasn’t saved"
                  description="Your place is still here. Try again."
                  action={
                    <Button size="sm" variant="secondary" onClick={() => void saveProgress()}>
                      Retry save
                    </Button>
                  }
                />
              )}

              {eventPending && (
                <div
                  role="status"
                  className="bg-warning-soft border-warning/30 flex flex-col gap-2 rounded-[var(--radius-surface)] border p-3.5"
                >
                  <strong className="text-[12.5px] font-semibold">Learning update pending</strong>
                  <span className="text-muted-foreground text-[12px] leading-snug">
                    It will retry when the connection returns. You can also retry now.
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void retryLearningEvents()}
                    className="self-start"
                  >
                    Retry learning updates
                  </Button>
                </div>
              )}
            </aside>
          </div>
        </div>

        <PlayerControls
          snapshot={snapshot}
          durationMs={durationMs}
          onPlay={onPlay}
          onPause={onPause}
          onSeek={onSeek}
          onNext={() => {
            controller.nextSegment();
            void saveProgress();
          }}
          saveState={saveState}
          captionsEnabled={captionsEnabled}
          onToggleCaptions={() => setCaptionsEnabled((enabled) => !enabled)}
          rate={rate}
          onRateChange={setRate}
          volume={volume}
          onVolumeChange={setVolume}
        />
      </div>
    </MotionConfig>
  );
}
