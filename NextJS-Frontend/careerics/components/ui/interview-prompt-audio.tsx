"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  buildInterviewAudioCandidates,
  type InterviewAudioKind,
} from "@/lib/interview-media";

interface InterviewPromptAudioProps {
  audioUrl?: string | null;
  fallbackText?: string;
  autoPlayToken?: string;
  label?: string;
  kind?: InterviewAudioKind;
  alwaysShowControls?: boolean;
  debug?: boolean;
}

export interface InterviewPromptAudioHandle {
  replay: () => Promise<void>;
  enableAudio: () => Promise<void>;
}

type PlaybackOutcome = "started" | "blocked" | "failed" | "missing";

const InterviewPromptAudio = forwardRef<InterviewPromptAudioHandle, InterviewPromptAudioProps>(
  function InterviewPromptAudio({
    audioUrl,
    fallbackText,
    autoPlayToken,
    label = "Question audio",
    kind = "questions",
    alwaysShowControls = false,
    debug = false,
  }: InterviewPromptAudioProps, ref) {
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const candidateIndexRef = useRef(0);
  const [activeCandidateIndex, setActiveCandidateIndex] = useState(0);
  const [playbackError, setPlaybackError] = useState("");
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [audioStatus, setAudioStatus] = useState("idle");
  const [audioReadyState, setAudioReadyState] = useState(0);
  const [lastAttemptedSource, setLastAttemptedSource] = useState("");

  const audioCandidates = buildInterviewAudioCandidates(audioUrl, kind);
  const primaryAudioUrl = audioCandidates[activeCandidateIndex] || audioCandidates[0] || "";
  const hasAudio = Boolean(primaryAudioUrl);
  const hasFallbackText = Boolean(fallbackText && fallbackText.trim());

  const getAudioContextConstructor = () => {
    if (typeof window === "undefined") {
      return null;
    }

    const ctor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    return ctor || null;
  };

  const unlockBrowserAudio = useCallback(async () => {
    const AudioContextCtor = getAudioContextConstructor();

    if (!AudioContextCtor) {
      return true;
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextCtor();
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      return audioContextRef.current.state === "running";
    } catch {
      return false;
    }
  }, []);

  const speakFallback = useCallback(() => {
    if (!hasFallbackText || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(fallbackText?.trim());
      utterance.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }, [fallbackText, hasFallbackText]);

  const playPromptAudio = useCallback(async (preferredIndex?: number): Promise<PlaybackOutcome> => {
    if (!playerRef.current || !audioCandidates.length) {
      return "missing";
    }

    const requestedIndex =
      typeof preferredIndex === "number" &&
      Number.isInteger(preferredIndex) &&
      preferredIndex >= 0 &&
      preferredIndex < audioCandidates.length
        ? preferredIndex
        : 0;

    const activeAudioUrl =
      audioCandidates[requestedIndex] || audioCandidates[0];

    candidateIndexRef.current = requestedIndex;
    setActiveCandidateIndex(requestedIndex);
    setLastAttemptedSource(activeAudioUrl);

    playerRef.current.muted = false;
    playerRef.current.volume = 1;
    setAudioStatus("loading");

    if (playerRef.current.src !== activeAudioUrl) {
      playerRef.current.src = activeAudioUrl;
      playerRef.current.load();
    }

    playerRef.current.currentTime = 0;

    try {
      await playerRef.current.play();
      setPlaybackError("");
      setAutoplayBlocked(false);
      setAudioStatus("playing");
      return "started";
    } catch (error) {
      const blocked = error instanceof DOMException && error.name === "NotAllowedError";

      if (blocked) {
        setAutoplayBlocked(true);
        setAudioStatus("paused");
        setPlaybackError("Autoplay was blocked. Click Enable audio, then Replay.");
        return "blocked";
      }

      setAudioStatus("error");
      setPlaybackError("Unable to play this audio right now.");
      return "failed";
    }
  }, [audioCandidates]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {
          // no-op
        });
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    candidateIndexRef.current = 0;

    const playInitialPrompt = async () => {
      await unlockBrowserAudio();

      if (hasAudio && playerRef.current) {
        const outcome = await playPromptAudio(0);

        if (outcome === "failed") {
          speakFallback();
        }
        return;
      }

      if (hasFallbackText) {
        speakFallback();
      }
    };

    void playInitialPrompt();
  }, [
    autoPlayToken,
    hasAudio,
    hasFallbackText,
    playPromptAudio,
    speakFallback,
    unlockBrowserAudio,
  ]);

  const handleAudioError = () => {
    const nextIndex = candidateIndexRef.current + 1;

    if (nextIndex < audioCandidates.length) {
      setPlaybackError("Primary source failed. Trying backup source...");
      void playPromptAudio(nextIndex);
      return;
    }

    setAudioStatus("error");
    if (!speakFallback()) {
      setPlaybackError("Unable to load this audio clip.");
    }
  };

  const handleReplay = async () => {
    setPlaybackError("");

    if (hasAudio && playerRef.current) {
      const outcome = await playPromptAudio(candidateIndexRef.current);
      if (outcome === "failed" && !speakFallback()) {
        setPlaybackError("No playable audio is available for this prompt.");
      }
      return;
    }

    if (!speakFallback()) {
      setPlaybackError("No playable audio is available for this prompt.");
    }
  };

  const handleEnableAudio = async () => {
    const unlocked = await unlockBrowserAudio();
    if (!unlocked) {
      setPlaybackError("Could not unlock browser audio. Check Brave site permissions.");
      return;
    }

    setAutoplayBlocked(false);
    setPlaybackError("");

    if (hasAudio) {
      const outcome = await playPromptAudio(candidateIndexRef.current);
      if (outcome === "failed") {
        speakFallback();
      }
      return;
    }

    if (!speakFallback()) {
      setPlaybackError("Audio was enabled, but no prompt audio is available.");
    }
  };

  useEffect(() => {
    if (!autoplayBlocked || typeof window === "undefined") {
      return;
    }

    let disposed = false;

    const retryAfterInteraction = () => {
      if (disposed) {
        return;
      }

      void (async () => {
        const unlocked = await unlockBrowserAudio();
        if (!unlocked || disposed) {
          return;
        }

        await handleReplay();
      })();
    };

    window.addEventListener("pointerdown", retryAfterInteraction, { once: true });
    window.addEventListener("keydown", retryAfterInteraction, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener("pointerdown", retryAfterInteraction);
      window.removeEventListener("keydown", retryAfterInteraction);
    };
  }, [autoplayBlocked, handleReplay, unlockBrowserAudio]);

  useImperativeHandle(
    ref,
    () => ({
      replay: async () => {
        await handleReplay();
      },
      enableAudio: async () => {
        await handleEnableAudio();
      },
    }),
    [handleEnableAudio, handleReplay],
  );

  const handleTryNextSource = async () => {
    if (!audioCandidates.length) {
      return;
    }

    const nextIndex = (candidateIndexRef.current + 1) % audioCandidates.length;
    setPlaybackError("");
    const outcome = await playPromptAudio(nextIndex);

    if (outcome === "failed" && !speakFallback()) {
      setPlaybackError("Alternate source failed. Open the audio link directly.");
    }
  };

  const handleSpeakerTest = async () => {
    const AudioContextCtor = getAudioContextConstructor();

    if (!AudioContextCtor) {
      setPlaybackError("Speaker test is not supported in this browser.");
      return;
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextCtor();
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.08;

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);
      setPlaybackError("");
    } catch {
      setPlaybackError("Speaker test failed. Check browser audio permissions/settings.");
    }
  };

  if (!hasAudio && !hasFallbackText && !alwaysShowControls) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "440px",
        margin: "0 auto 16px auto",
        padding: "12px 14px",
        borderRadius: "12px",
        backgroundColor: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "14px",
            fontFamily: "var(--font-nova-square)",
            opacity: 0.9,
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {autoplayBlocked ? (
            <button
              type="button"
              onClick={handleEnableAudio}
              style={{
                backgroundColor: "#0f766e",
                color: "#ecfeff",
                border: "1px solid #99f6e4",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "12px",
                fontFamily: "var(--font-nova-square)",
                cursor: "pointer",
              }}
            >
              Enable audio
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleReplay}
            style={{
              backgroundColor: "#d4ff47",
              color: "#1a1a1a",
              border: "none",
              borderRadius: "10px",
              padding: "8px 14px",
              fontSize: "12px",
              fontFamily: "var(--font-nova-square)",
              cursor: "pointer",
            }}
          >
            Replay
          </button>
          <button
            type="button"
            onClick={handleSpeakerTest}
            style={{
              backgroundColor: "#111827",
              color: "#d1fae5",
              border: "1px solid #d1fae5",
              borderRadius: "10px",
              padding: "8px 12px",
              fontSize: "12px",
              fontFamily: "var(--font-nova-square)",
              cursor: "pointer",
            }}
          >
            Speaker test
          </button>
          {hasAudio && audioCandidates.length > 1 ? (
            <button
              type="button"
              onClick={handleTryNextSource}
              style={{
                backgroundColor: "#1f2937",
                color: "#fef3c7",
                border: "1px solid #fef3c7",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "12px",
                fontFamily: "var(--font-nova-square)",
                cursor: "pointer",
              }}
            >
              Try next source
            </button>
          ) : null}
        </div>
      </div>

      {hasAudio ? (
        <>
          <audio
            ref={playerRef}
            src={primaryAudioUrl || undefined}
            preload="auto"
            controls
            onPlay={() => setPlaybackError("")}
            onPlaying={() => {
              setAudioStatus("playing");
              setPlaybackError("");
            }}
            onPause={() => setAudioStatus("paused")}
            onWaiting={() => setAudioStatus("loading")}
            onCanPlay={() => setAudioReadyState(playerRef.current?.readyState || 0)}
            onLoadedMetadata={() => setAudioReadyState(playerRef.current?.readyState || 0)}
            onError={handleAudioError}
            style={{ width: "100%", marginTop: "10px" }}
          />
          <a
            href={primaryAudioUrl || undefined}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              marginTop: "6px",
              color: "#d1fae5",
              fontSize: "12px",
              fontFamily: "var(--font-nova-square)",
            }}
          >
            Open active audio file directly
          </a>
        </>
      ) : hasFallbackText ? (
        <p
          style={{
            marginTop: "10px",
            marginBottom: 0,
            color: "#d1fae5",
            fontSize: "12px",
            fontFamily: "var(--font-nova-square)",
          }}
        >
          Using text-to-speech fallback.
        </p>
      ) : (
        <p
          style={{
            marginTop: "10px",
            marginBottom: 0,
            color: "#d1fae5",
            fontSize: "12px",
            fontFamily: "var(--font-nova-square)",
          }}
        >
          Waiting for prompt audio.
        </p>
      )}

      {playbackError && (
        <p
          style={{
            marginTop: "8px",
            marginBottom: 0,
            fontSize: "12px",
            color: "#fde68a",
            fontFamily: "var(--font-nova-square)",
          }}
        >
          {playbackError}
        </p>
      )}

      {debug ? (
        <div
          style={{
            marginTop: "8px",
            padding: "8px",
            borderRadius: "8px",
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(148, 163, 184, 0.45)",
            color: "#e2e8f0",
            fontSize: "11px",
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          <div>Status: {audioStatus}</div>
          <div>ReadyState: {audioReadyState}</div>
          <div>
            Source: {audioCandidates.length ? `${activeCandidateIndex + 1}/${audioCandidates.length}` : "0/0"}
          </div>
          <div>Active URL: {primaryAudioUrl || "(none)"}</div>
          <div>Last Tried: {lastAttemptedSource || "(none)"}</div>
        </div>
      ) : null}
    </div>
  );
});

export default InterviewPromptAudio;
