"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

gsap.registerPlugin();

/**
 * HeroSection
 * - Badge fades in from below
 * - Headline words reveal sequentially (mask + translateY)
 * - Subline fades in after headline
 * - CTAs slide up last
 * - Scroll-linked opacity/scale on the whole wrapper
 */
export function HeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const badgeRef    = useRef<HTMLDivElement>(null);
  const line1Ref    = useRef<HTMLDivElement>(null);
  const line2Ref    = useRef<HTMLDivElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // Badge
      tl.fromTo(
        badgeRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
      );

      // Each word in h1 — split by span[data-word]
      const words1 = Array.from(line1Ref.current?.querySelectorAll("[data-word]") ?? []);
      const words2 = Array.from(line2Ref.current?.querySelectorAll("[data-word]") ?? []);

      tl.fromTo(
        [...words1, ...words2],
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.06,
        },
        "-=0.3",
      );

      // Subline
      tl.fromTo(
        subRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.3",
      );

      // CTAs
      tl.fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.3",
      );
    },
    { scope: wrapperRef },
  );

  return (
    <section
      ref={wrapperRef}
      className="relative flex min-h-[92vh] flex-col items-center justify-center px-6 pt-32 pb-20 text-center"
    >
      {/* Badge */}
      <div
        ref={badgeRef}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(94,106,210,0.30)] bg-[rgba(94,106,210,0.08)] px-4 py-1.5 opacity-0"
      >
        <Sparkles className="h-3.5 w-3.5 text-[#5E6AD2]" />
        <span className="font-mono text-xs tracking-widest text-[#8A8F98] uppercase">
          IA + WhatsApp + Barberías
        </span>
      </div>

      {/* Headline – line 1 */}
      <h1
        className="mx-auto max-w-4xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
      >
        <div ref={line1Ref} className="overflow-hidden pb-1">
          {["Tu", "barbería,", "siempre"].map((w) => (
            <span
              key={w}
              data-word
              className="mr-[0.25em] inline-block text-gradient opacity-0"
              style={{ willChange: "transform, opacity" }}
            >
              {w}
            </span>
          ))}
        </div>
        {/* Line 2 – accent shimmer */}
        <div ref={line2Ref} className="overflow-hidden">
          {["abierta".split(""), "con Luna"].map((_, i) => (
            <span
              key={i}
              data-word
              className={`mr-[0.2em] inline-block opacity-0 ${i === 0 ? "text-shimmer" : "text-gradient"}`}
              style={{ willChange: "transform, opacity" }}
            >
              {i === 0 ? "abierta" : "con Luna"}
            </span>
          ))}
        </div>
      </h1>

      {/* Sub */}
      <p
        ref={subRef}
        className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#8A8F98] opacity-0 sm:text-lg md:text-xl"
      >
        Luna, tu asistente de IA por WhatsApp, agenda citas, recuerda
        preferencias y gestiona tu agenda — 24/7, sin que toques nada.
      </p>

      {/* CTAs */}
      <div
        ref={ctaRef}
        className="mt-10 flex flex-col items-center gap-4 opacity-0 sm:flex-row"
      >
        <Link
          href="/register"
          className="group inline-flex items-center gap-2 rounded-lg bg-[#5E6AD2] px-6 py-3 text-sm font-medium text-white shadow-[0_0_24px_rgba(94,106,210,0.4)] transition-all duration-200 hover:bg-[#6872D9] hover:shadow-[0_0_36px_rgba(94,106,210,0.6)] active:scale-[0.97]"
        >
          Empieza gratis hoy
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
        <Link
          href="#features"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.04] px-6 py-3 text-sm font-medium text-[#EDEDEF] transition-all duration-200 hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.97]"
        >
          Ver cómo funciona
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
        <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/40 to-white/10" />
        <span className="font-mono text-[10px] tracking-widest text-[#8A8F98] uppercase">scroll</span>
      </div>
    </section>
  );
}
