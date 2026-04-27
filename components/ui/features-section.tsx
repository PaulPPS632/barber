"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bot, CalendarCheck, Users, Zap, MessageSquare, BarChart3 } from "lucide-react";
import { SpotlightCard } from "./spotlight-card";
import { WhatsAppMockup } from "./whatsapp-mockup";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: Bot,
    title: "Luna, tu IA 24/7",
    desc: "Responde, agenda y recuerda preferencias de cada cliente de forma autónoma por WhatsApp.",
  },
  {
    icon: CalendarCheck,
    title: "Agenda inteligente",
    desc: "Sin conflictos. Luna conoce tu disponibilidad y nunca doble-agenda.",
  },
  {
    icon: Users,
    title: "CRM integrado",
    desc: "Historial de cortes, preferencias y notas de cada cliente, actualizado automáticamente.",
  },
  {
    icon: Zap,
    title: "Setup en minutos",
    desc: "Conecta tu número de WhatsApp Business y estás listo. Sin instalaciones ni IT.",
  },
  {
    icon: MessageSquare,
    title: "Contexto persistente",
    desc: "Luna recuerda conversaciones anteriores y personaliza cada interacción.",
  },
  {
    icon: BarChart3,
    title: "Panel de control",
    desc: "Visualiza citas, clientes y métricas desde un dashboard limpio y rápido.",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Heading
      gsap.fromTo(
        headRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "expo.out",
          scrollTrigger: {
            trigger: headRef.current,
            start: "top 85%",
          },
        },
      );

      // Cards stagger
      const cards = gsap.utils.toArray<HTMLElement>("[data-feature-card]", gridRef.current);
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative mx-auto max-w-6xl px-6 py-32"
    >
      {/* Section label + heading */}
      <div ref={headRef} className="mb-16 text-center opacity-0">
        <p className="mb-4 font-mono text-xs tracking-widest text-[#5E6AD2] uppercase">
          Características
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
          Todo lo que tu barbería necesita
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[#8A8F98]">
          Una plataforma SaaS multi-tenant con IA lista para escalar sin importar cuántas sedes tengas.
        </p>
      </div>

      {/* Two-column: mockup + feature grid */}
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left – WhatsApp mockup */}
        <div className="flex justify-center lg:justify-end">
          <WhatsAppMockup />
        </div>

        {/* Right – feature cards */}
        <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} data-feature-card className="opacity-0">
              <SpotlightCard className="h-full p-5 transition-all duration-300">
                <div className="flex flex-col gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[rgba(94,106,210,0.12)]">
                    <Icon className="h-4 w-4 text-[#5E6AD2]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#EDEDEF]">{title}</h3>
                  <p className="text-xs leading-relaxed text-[#8A8F98]">{desc}</p>
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
