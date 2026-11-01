"use client";

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeText = "";

export function narrationFromPosition(text: string, positionMs: number, durationMs: number): string {
  if (positionMs <= 0 || durationMs <= 0) return text;
  if (positionMs >= durationMs) return "";
  const target = Math.floor(text.length * Math.max(0, Math.min(positionMs / durationMs, 1)));
  const sentenceStarts = [...text.matchAll(/[^.!?]+[.!?]*/g)].map((match) => match.index ?? 0);
  const nextStart = sentenceStarts.find((start) => start >= target);
  return nextStart === undefined ? "" : text.slice(nextStart).trim();
}

export function narrationAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function speakNarration(text: string, options: { rate?: number; volume?: number } = {}): boolean {
  if (!narrationAvailable()) return false;
  if (window.speechSynthesis.paused && activeText === text) {
    window.speechSynthesis.resume();
    return true;
  }
  window.speechSynthesis.cancel();
  activeText = text;
  activeUtterance = new SpeechSynthesisUtterance(text);
  activeUtterance.rate = options.rate ?? 0.92;
  activeUtterance.volume = options.volume ?? 1;
  activeUtterance.lang = "en-US";
  window.speechSynthesis.speak(activeUtterance);
  return true;
}

export function pauseNarration() {
  if (narrationAvailable()) window.speechSynthesis.pause();
}

export function stopNarration() {
  if (narrationAvailable()) window.speechSynthesis.cancel();
  activeUtterance = null;
  activeText = "";
}
