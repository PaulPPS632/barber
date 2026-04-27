"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    name: "Carlos Mendoza",
    role: "Dueño · Barbería El Estilo",
    city: "Lima",
    avatar: "CM",
    color: "#5E6AD2",
    stars: 5,
    quote:
      "Desde que activé Luna no pierdo ni una cita. Los clientes me escriben a las 11pm y ella agenda sola. En el primer mes llené mi agenda completa.",
  },
  {
    name: "Diego Quispe",
    role: "Barbero independiente",
    city: "Arequipa",
    avatar: "DQ",
    color: "#7c3aed",
    stars: 5,
    quote:
      "El micrositio quedó increíble. Mis clientes me dicen que parece que tengo una app propia. El link de reservas lo comparto en mi Instagram y llega gente nueva cada semana.",
  },
  {
    name: "Andrés Vásquez",
    role: "Dueño · Fade Factory",
    city: "Trujillo",
    avatar: "AV",
    color: "#0ea5e9",
    stars: 5,
    quote:
      "Tengo 4 barberos y cada uno maneja su propia agenda desde el panel. Antes me volvía loco coordinando todo por WhatsApp. Ahora fluye solo.",
  },
  {
    name: "Sebastián Rojas",
    role: "Dueño · The Barber Lounge",
    city: "Lima",
    avatar: "SR",
    color: "#10b981",
    stars: 5,
    quote:
      "Luna recuerda las preferencias de cada cliente. Le dice al cliente cuándo fue su último corte, qué servicio prefiere… mis clientes piensan que tengo un recepcionista dedicado.",
  },
];

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(headRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "expo.out",
          scrollTrigger: { trigger: headRef.current, start: "top 85%" } },
      );

      const cards = gsap.utils.toArray<HTMLElement>("[data-tcard]", sectionRef.current);
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
            Testimonios
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Quienes ya lo usan
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[#8A8F98]">
            Barberías reales que automatizaron su agenda con Luna.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              data-tcard
              className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/[0.06] p-6 opacity-0 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {/* Quote mark */}
              <div
                className="absolute -right-2 -top-2 text-7xl font-serif leading-none select-none opacity-[0.06]"
                style={{ color: t.color }}
              >
                "
              </div>

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#5E6AD2] text-[#5E6AD2]" />
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-[#8A8F98]">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${t.color}cc, ${t.color}66)`,
                    boxShadow: `0 0 12px ${t.color}40`,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#EDEDEF]">{t.name}</p>
                  <p className="text-xs text-[#8A8F98]/70">{t.role} · {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
