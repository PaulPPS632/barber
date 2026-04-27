"use client";

/**
 * AnimatedBackground
 * Multi-layer cinematic background:
 *   1. Radial base gradient
 *   2. CSS-animated gradient blobs (no JS needed — pure CSS keyframes)
 *   3. Subtle grid overlay
 *   4. Noise texture
 */
export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* ── Layer 1: Radial base ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #0a0a0f 0%, #050506 55%, #020203 100%)",
        }}
      />

      {/* ── Layer 2: Animated blobs ── */}
      {/* Primary – top-center indigo pool */}
      <div
        className="blob-1 absolute -top-[200px] left-1/2 -translate-x-1/2 h-[900px] w-[1400px] rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(94,106,210,0.6) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      {/* Secondary – left purple/pink */}
      <div
        className="blob-2 absolute top-1/4 -left-[200px] h-[600px] w-[700px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.5) 0%, rgba(219,39,119,0.2) 60%, transparent 80%)",
          filter: "blur(100px)",
        }}
      />
      {/* Tertiary – right indigo/blue */}
      <div
        className="blob-3 absolute top-1/3 -right-[150px] h-[500px] w-[600px] rounded-full opacity-12"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.4) 0%, rgba(59,130,246,0.2) 60%, transparent 80%)",
          filter: "blur(90px)",
        }}
      />
      {/* Bottom accent – pulse */}
      <div
        className="blob-4 absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[900px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(94,106,210,0.5) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* ── Layer 3: Grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* ── Layer 4: Noise texture (SVG inline) ── */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
