"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronsRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeToSubmitProps {
  onSubmit: () => void;
  isLoading?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function SwipeToSubmit({
  onSubmit,
  isLoading = false,
  label = "Swipe to confirm",
  disabled = false,
  className,
}: SwipeToSubmitProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(320);
  const [triggered, setTriggered] = useState(false);

  const THUMB_W = 48;
  const PAD = 4;
  const dragMax = Math.max(0, trackWidth - THUMB_W - PAD * 2);
  const THRESHOLD = dragMax * 0.68;
  const centerX = Math.max(0, trackWidth / 2 - THUMB_W / 2 - PAD);

  const x = useMotionValue(0);
  const textOpacity = useTransform(x, [0, dragMax * 0.4], [1, 0]);
  const fillWidth = useTransform(x, [0, dragMax], [THUMB_W + PAD, trackWidth - PAD]);

  // Measure track width on mount and resize
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setTrackWidth(el.offsetWidth));
    obs.observe(el);
    setTrackWidth(el.offsetWidth);
    return () => obs.disconnect();
  }, []);

  // Reset after action completes (or if validation failed and loading never started)
  useEffect(() => {
    if (!triggered) return;
    const timer = setTimeout(() => {
      if (!isLoading) {
        setTriggered(false);
        animate(x, 0, { type: "spring", stiffness: 400, damping: 32 });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [triggered, isLoading, x]);

  function handleDragEnd() {
    const cur = x.get();
    if (cur >= THRESHOLD && !triggered && !disabled && !isLoading) {
      setTriggered(true);
      animate(x, centerX, { type: "spring", stiffness: 500, damping: 36 });
      onSubmit();
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 32 });
    }
  }

  const isDragDisabled = disabled || isLoading || triggered;

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-14 rounded-full overflow-hidden select-none",
        "bg-white/5 border border-white/10",
        className,
      )}
    >
      {/* Progress fill */}
      <motion.div
        className="absolute top-0 left-0 h-full bg-primary/20 rounded-full pointer-events-none"
        style={{ width: fillWidth }}
      />

      {/* Center label */}
      <motion.span
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center text-sm font-medium text-muted-foreground pointer-events-none"
      >
        {label}
      </motion.span>

      {/* Draggable thumb */}
      <motion.div
        drag={isDragDisabled ? false : "x"}
        dragConstraints={{ left: 0, right: dragMax }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x, width: THUMB_W, height: THUMB_W }}
        className={cn(
          "absolute top-[4px] left-[4px] rounded-full flex items-center justify-center",
          "bg-primary shadow-lg shadow-primary/40",
          isDragDisabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        )}
        onDragEnd={handleDragEnd}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
        ) : (
          <ChevronsRight className="h-5 w-5 text-primary-foreground" />
        )}
      </motion.div>
    </div>
  );
}
