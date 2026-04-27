"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Globe, Copy, Check, ExternalLink } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { useState } from "react";

const TEMPLATES = [
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    desc: "Limpio y moderno. Ideal para barberías premium.",
    primary: "#5E6AD2",
    accent: "#EDEDEF",
    active: true,
  },
  {
    id: "urbana-moderna",
    name: "Urbana Moderna",
    desc: "Audaz y urbano. Perfecto para barberías de tendencia.",
    primary: "#F97316",
    accent: "#FFF",
    active: false,
  },
  {
    id: "classic",
    name: "Classic",
    desc: "Tradicional y elegante. Para el barbero clásico.",
    primary: "#B45309",
    accent: "#FFFBEB",
    active: false,
  },
  {
    id: "modern-dark",
    name: "Modern Dark",
    desc: "Oscuro y sofisticado. Para una experiencia premium.",
    primary: "#7C3AED",
    accent: "#F5F3FF",
    active: false,
  },
];

function MiniPreview({ primary, accent, name }: { primary: string; accent: string; name: string }) {
  return (
    <div className="h-32 w-full rounded-xl overflow-hidden" style={{ background: "#0d0d0f", border: `1px solid ${primary}22` }}>
      {/* Fake header */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ borderColor: `${primary}20` }}>
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: primary }} />
        <div className="h-1 w-10 rounded-full bg-white/20" />
        <div className="ml-auto h-1 w-6 rounded-full" style={{ background: primary }} />
      </div>
      {/* Fake hero */}
      <div className="px-3 py-2.5 space-y-1.5">
        <div className="h-2 w-16 rounded-full" style={{ background: accent, opacity: 0.9 }} />
        <div className="h-1 w-24 rounded-full bg-white/20" />
        <div className="h-1 w-20 rounded-full bg-white/10" />
        <div className="mt-2 h-5 w-14 rounded-full" style={{ background: primary, opacity: 0.85 }} />
      </div>
    </div>
  );
}

export default function MicrositiPage() {
  const [copied, setCopied] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("minimal-dark");
  const pageRef = useRef<HTMLDivElement>(null);
  const slug = "mi-barberia";
  const link = `https://barber.pe/${slug}`;

  useGSAP(
    () => {
      gsap.fromTo("[data-card]",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.07, delay: 0.1 },
      );
    },
    { scope: pageRef },
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[#EDEDEF] tracking-tight flex items-center gap-2.5">
            <Globe className="h-6 w-6 text-[#5E6AD2]" />
            Micrositio
          </h1>
          <p className="mt-1 text-sm text-[#8A8F98]">Tu página pública de reservas.</p>
        </div>

        {/* Link card */}
        <div
          data-card
          className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-5 py-4 opacity-0"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Globe className="h-5 w-5 text-[#5E6AD2] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8A8F98] mb-0.5">Tu link de reservas</p>
            <p className="truncate text-sm font-medium text-[#EDEDEF]">{link}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/[0.06] text-[#8A8F98] hover:bg-white/[0.10] hover:text-[#EDEDEF]"
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-[#5E6AD2] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#6872D9] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Ver
            </a>
          </div>
        </div>

        {/* Template selector */}
        <div>
          <h2 className="mb-4 text-sm font-semibold text-[#EDEDEF]">Elige una plantilla</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                data-card
                onClick={() => setActiveTemplate(tmpl.id)}
                className={`text-left rounded-2xl border p-3.5 opacity-0 transition-all duration-150 space-y-3 ${
                  activeTemplate === tmpl.id
                    ? "border-[#5E6AD2]/60 bg-[#5E6AD2]/[0.08]"
                    : "border-white/[0.06] bg-white/[0.04] hover:border-white/[0.12] hover:bg-white/[0.07]"
                }`}
              >
                <MiniPreview primary={tmpl.primary} accent={tmpl.accent} name={tmpl.name} />
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#EDEDEF]">{tmpl.name}</p>
                    {activeTemplate === tmpl.id && (
                      <span className="rounded-full bg-[#5E6AD2]/20 border border-[#5E6AD2]/40 px-2 py-0.5 text-[10px] text-[#5E6AD2] font-medium">
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#8A8F98] leading-relaxed">{tmpl.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Apply button */}
        <div className="flex justify-end">
          <button className="rounded-xl bg-[#5E6AD2] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#6872D9] transition-colors active:scale-95">
            Guardar cambios
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
