"use client";

import { useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

/**
 * SpotlightCard
 * Tracks mouse position and renders a radial glow that follows the cursor.
 * GSAP smooths the movement so it feels fluid, not snappy.
 */
export function SpotlightCard({
  children,
  className = "",
  glowColor = "rgba(94,106,210,0.15)",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  // store current glow position so we can tween from it
  const pos = useRef({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !glowRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Tween glow position — feels like a heavy lamp following the cursor
      gsap.to(pos.current, {
        x,
        y,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: () => {
          if (!glowRef.current) return;
          glowRef.current.style.background = `radial-gradient(300px circle at ${pos.current.x}% ${pos.current.y}%, ${glowColor}, transparent 70%)`;
        },
      });
    },
    [glowColor],
  );

  const handleMouseLeave = useCallback(() => {
    gsap.to(glowRef.current, { opacity: 0, duration: 0.4, ease: "power2.out" });
  }, []);

  const handleMouseEnter = useCallback(() => {
    gsap.to(glowRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" });
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] ${className}`}
      style={{ background: "rgba(255,255,255,0.04)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {/* Glow layer */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-0"
        style={{
          background: `radial-gradient(300px circle at 50% 50%, ${glowColor}, transparent 70%)`,
        }}
      />
      {/* Hover border highlight */}
      <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px rgba(94,106,210,0.25)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
