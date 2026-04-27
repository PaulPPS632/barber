"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Lock } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TEMPLATES = [
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    tag: "Disponible",
    locked: false,
    desc: "Fondo negro profundo, tipografía grande y mucho espacio negativo. Para barberías premium que hablan por sí solas.",
    preview: {
      bg: "#0a0a0c",
      accent: "#5E6AD2",
      bars: ["#EDEDEF", "#8A8F98", "#5E6AD2"],
      style: "minimal",
    },
  },
  {
    id: "urbana-moderna",
    name: "Urbana Moderna",
    tag: "Disponible",
    locked: false,
    desc: "Colores vivos, grillas asimétricas y energía urbana. Perfecta para barberías streetwear y cultura hip-hop.",
    preview: {
      bg: "#0f0f12",
      accent: "#f97316",
      bars: ["#f97316", "#EDEDEF", "#fb923c"],
      style: "urban",
    },
  },
  {
    id: "classic",
    name: "Classic",
    tag: "Disponible",
    locked: false,
    desc: "Crema, dorado y serif elegante. Inspira confianza y tradición. Para barberías con años de historia.",
    preview: {
      bg: "#1a1408",
      accent: "#d97706",
      bars: ["#d97706", "#fcd34d", "#EDEDEF"],
      style: "classic",
    },
  },
  {
    id: "modern-dark",
    name: "Modern Dark",
    tag: "Disponible",
    locked: false,
    desc: "Gradientes sutiles, glassmorphism y bordes iluminados. El look de las apps premium de 2026.",
    preview: {
      bg: "#06060a",
      accent: "#818cf8",
      bars: ["#818cf8", "#c4b5fd", "#EDEDEF"],
      style: "modern",
    },
  },
];

/** Mini mock of a microsite inside the card */
function TemplatePreview({
  preview,
  name,
}: {
  preview: (typeof TEMPLATES)[0]["preview"];
  name: string;
}) {
  return (
    <div
      className="relative h-40 w-full overflow-hidden rounded-xl"
      style={{ background: preview.bg, border: `1px solid ${preview.accent}22` }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-6 left-1/2 h-20 w-32 -translate-x-1/2 rounded-full opacity-30"
        style={{ background: preview.accent, filter: "blur(24px)" }}
      />

      {/* Content skeleton */}
      <div className="relative flex h-full flex-col items-center justify-center gap-2 px-5">
        {/* Logo dot */}
        <div
          className="h-6 w-6 rounded-full"
          style={{ background: preview.accent, boxShadow: `0 0 10px ${preview.accent}80` }}
        />

        {/* Title bar */}
        <div
          className="h-2.5 w-24 rounded-full opacity-90"
          style={{ background: preview.bars[0] }}
        />
        {/* Sub bar */}
        <div
          className="h-1.5 w-16 rounded-full opacity-50"
          style={{ background: preview.bars[1] }}
        />

        {/* CTA button mock */}
        <div
          className="mt-1 h-6 w-20 rounded-lg opacity-80"
          style={{ background: preview.accent }}
        />

        {/* Bottom nav dots */}
        <div className="absolute bottom-3 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: i === 0 ? "16px" : "5px",
                height: "5px",
                background: i === 0 ? preview.accent : `${preview.bars[2]}40`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TemplatesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(headRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "expo.out",
          scrollTrigger: { trigger: headRef.current, start: "top 85%" } },
      );

      const cards = gsap.utils.toArray<HTMLElement>("[data-tpl-card]", sectionRef.current);
      gsap.fromTo(cards,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: "expo.out", stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" } },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div ref={headRef} className="mb-14 text-center opacity-0">
          <p className="mb-4 font-mono text-xs tracking-widest text-[#5E6AD2] uppercase">
            Micrositios
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Tu barbería, tu estilo
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[#8A8F98]">
            Elige la plantilla que represente tu identidad. Tu micrositio estará listo en
            segundos con tu nombre, servicios y link de reservas.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              data-tpl-card
              className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/[0.06] p-4 opacity-0 transition-all duration-300 hover:border-white/[0.14]"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {/* Preview */}
              <TemplatePreview preview={tpl.preview} name={tpl.name} />

              {/* Info */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#EDEDEF]">{tpl.name}</h3>
                  <span className="rounded-full border border-[rgba(94,106,210,0.30)] bg-[rgba(94,106,210,0.08)] px-2 py-0.5 font-mono text-[10px] tracking-widest text-[#5E6AD2] uppercase">
                    {tpl.tag}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#8A8F98]">{tpl.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* "More coming soon" pill */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm text-[#8A8F98]">
            <Sparkles className="h-3.5 w-3.5 text-[#5E6AD2]" />
            Más plantillas llegando pronto — diseñadas con tu comunidad
          </div>
        </div>
      </div>
    </section>
  );
}
