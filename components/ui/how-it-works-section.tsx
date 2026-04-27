"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { UserPlus, Settings2, Share2, CalendarCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    n: "01",
    icon: UserPlus,
    title: "Crea tu cuenta",
    desc: "Regístrate en menos de 2 minutos. Solo necesitas tu email y el nombre de tu barbería.",
  },
  {
    n: "02",
    icon: Settings2,
    title: "Configura tu negocio",
    desc: "Agrega tus servicios, precios, horarios y profesionales. Elige tu plantilla de micrositio.",
  },
  {
    n: "03",
    icon: Share2,
    title: "Comparte tu link o número",
    desc: "Comparte tu link de reservas en Instagram, WhatsApp o donde prefieras. Luna queda activa en tu número.",
  },
  {
    n: "04",
    icon: CalendarCheck,
    title: "Recibe reservas",
    desc: "Tus clientes reservan solos, 24/7. Tú ves todo en el panel y Luna gestiona el resto.",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(headRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "expo.out",
          scrollTrigger: { trigger: headRef.current, start: "top 85%" } },
      );

      const items = gsap.utils.toArray<HTMLElement>("[data-step]", sectionRef.current);
      gsap.fromTo(items,
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: "expo.out", stagger: 0.13,
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" } },
      );

      // Animate connector lines drawing in
      const lines = gsap.utils.toArray<HTMLElement>("[data-connector]", sectionRef.current);
      gsap.fromTo(lines,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.6, ease: "expo.out", stagger: 0.13, delay: 0.3,
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" } },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative px-6 py-28">
      {/* Section separator top */}
      <div className="mx-auto mb-20 max-w-6xl">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div ref={headRef} className="mb-16 text-center opacity-0">
          <p className="mb-4 font-mono text-xs tracking-widest text-[#5E6AD2] uppercase">
            ¿Cómo funciona?
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Tu negocio listo en minutos
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[#8A8F98]">
            Sin instalaciones, sin IT, sin complicaciones. Cuatro pasos y estás operando.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector lines — visible only on lg */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              data-connector
              className="absolute top-[52px] hidden h-px lg:block"
              style={{
                left: `calc(${(i + 1) * 25}% - 2px)`,
                width: "calc(25% - 64px)",
                background:
                  "linear-gradient(90deg, rgba(94,106,210,0.4), rgba(94,106,210,0.15))",
              }}
            />
          ))}

          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.n}
                data-step
                className="relative flex flex-col items-center gap-5 text-center opacity-0"
              >
                {/* Number + icon circle */}
                <div className="relative">
                  {/* Outer glow ring */}
                  <div
                    className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ boxShadow: "0 0 24px rgba(94,106,210,0.4)" }}
                  />
                  <div
                    className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[rgba(94,106,210,0.25)] bg-[rgba(94,106,210,0.1)]"
                    style={{ boxShadow: "0 0 20px rgba(94,106,210,0.15)" }}
                  >
                    <Icon className="h-6 w-6 text-[#5E6AD2]" />
                    {/* Step number badge */}
                    <span
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(94,106,210,0.4)] text-[10px] font-bold text-[#5E6AD2]"
                      style={{ background: "#050506" }}
                    >
                      {idx + 1}
                    </span>
                  </div>
                </div>

                {/* Text */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-[#EDEDEF]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#8A8F98]">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
