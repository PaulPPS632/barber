"use client";

import { useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, ArrowRight, Zap, Sparkles, Star } from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

interface Plan {
  id: string;
  badge: string;
  badgeIcon: React.ReactNode;
  name: string;
  price: string | null;
  period: string;
  desc: string;
  featured: boolean;
  cta: string;
  ctaHref: string;
  benefits: string[];
  limit: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    badge: "Gratis",
    badgeIcon: <Star className="h-3 w-3" />,
    name: "Free",
    price: "0",
    period: "/mes",
    desc: "Para barberías que quieren digitalizarse sin costo.",
    featured: false,
    cta: "Comenzar gratis",
    ctaHref: "/register",
    limit: "1 profesional incluido",
    benefits: [
      "Micrositio personalizado con tu marca",
      "Reservas ilimitadas por link",
      "Estadísticas del mes (citas, clientes)",
      "1 profesional (barbero)",
      "Panel de gestión básico",
    ],
  },
  {
    id: "pro",
    badge: "Más popular",
    badgeIcon: <Zap className="h-3 w-3" />,
    name: "Pro",
    price: "100",
    period: "/mes",
    desc: "IA, automatización y CRM para barberías en crecimiento.",
    featured: true,
    cta: "Comenzar Pro",
    ctaHref: "/register?plan=pro",
    limit: "Hasta 5 profesionales",
    benefits: [
      "Todo lo del plan Free",
      "Luna IA activa 24/7 en WhatsApp",
      "Hasta 5 profesionales con acceso independiente",
      "Agenda inteligente sin conflictos",
      "CRM con historial y preferencias",
      "Panel de gestión avanzado",
      "Historial de conversaciones IA",
      "Soporte por WhatsApp prioritario",
      "Sin contrato — cancela cuando quieras",
    ],
  },
  {
    id: "pro-plus",
    badge: "Pro+",
    badgeIcon: <Sparkles className="h-3 w-3" />,
    name: "Pro+",
    price: "180",
    period: "/mes",
    desc: "Para barberías con múltiples sedes y equipos grandes.",
    featured: false,
    cta: "Comenzar Pro+",
    ctaHref: "/register?plan=pro-plus",
    limit: "Hasta 10 profesionales",
    benefits: [
      "Todo lo del plan Pro",
      "Hasta 10 profesionales con acceso independiente",
      "Reportes avanzados por profesional",
      "Múltiples números de WhatsApp",
      "Soporte dedicado con onboarding",
    ],
  },
];

/**
 * PricingSection — three-plan layout: Free / Pro (featured) / Pro+
 */
export function PricingCard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Heading
      gsap.fromTo(
        headRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "expo.out",
          scrollTrigger: { trigger: headRef.current, start: "top 85%" },
        },
      );

      // Cards stagger
      const cards = gsap.utils.toArray<HTMLElement>("[data-plan-card]", sectionRef.current);
      gsap.fromTo(
        cards,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.12,
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="pricing" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div ref={headRef} className="mb-16 text-center opacity-0">
          <p className="mb-4 font-mono text-xs tracking-widest text-[#5E6AD2] uppercase">
            Precios
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Simple. Sin sorpresas.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[#8A8F98]">
            Empieza gratis y escala cuando lo necesites. Sin costos ocultos.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 md:grid-cols-3 md:items-start">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Individual plan card ─────────────────────────────────── */

function PlanCard({ plan }: { plan: Plan }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    gsap.to(glowRef.current, {
      background: `radial-gradient(380px circle at ${x}% ${y}%, rgba(94,106,210,0.16), transparent 65%)`,
      duration: 0.5, ease: "power2.out",
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    gsap.to(glowRef.current, { opacity: 1, duration: 0.3 });
    if (!plan.featured) {
      gsap.to(cardRef.current, {
        boxShadow: "0 0 0 1px rgba(94,106,210,0.35), 0 8px 40px rgba(94,106,210,0.12)",
        duration: 0.4, ease: "power2.out",
      });
    }
  }, [plan.featured]);

  const handleMouseLeave = useCallback(() => {
    gsap.to(glowRef.current, { opacity: 0, duration: 0.5 });
    if (!plan.featured) {
      gsap.to(cardRef.current, {
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.25)",
        duration: 0.5, ease: "power2.out",
      });
    }
  }, [plan.featured]);

  return (
    <div
      data-plan-card
      ref={cardRef}
      className={`relative flex flex-col overflow-hidden rounded-2xl opacity-0 cursor-default ${
        plan.featured
          ? "ring-1 ring-[rgba(94,106,210,0.5)] shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_8px_60px_rgba(94,106,210,0.2),0_0_100px_rgba(94,106,210,0.06)]"
          : ""
      }`}
      style={{
        background: plan.featured
          ? "linear-gradient(160deg, rgba(94,106,210,0.12) 0%, rgba(10,10,12,1) 50%)"
          : "rgba(255,255,255,0.04)",
        boxShadow: plan.featured
          ? undefined
          : "0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.25)",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow overlay */}
      <div ref={glowRef} className="pointer-events-none absolute inset-0 z-0 opacity-0" />

      {/* Top accent line */}
      <div
        className="h-px w-full"
        style={{
          background: plan.featured
            ? "linear-gradient(90deg, transparent, #5E6AD2, transparent)"
            : "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col p-7">
        {/* Badge */}
        <div className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-[rgba(94,106,210,0.30)] bg-[rgba(94,106,210,0.08)] px-3 py-1 text-[11px] font-mono tracking-widest text-[#5E6AD2] uppercase">
          {plan.badgeIcon}
          {plan.badge}
        </div>

        {/* Plan name */}
        <h3 className="mb-1 text-xl font-semibold text-[#EDEDEF]">{plan.name}</h3>
        <p className="mb-5 text-sm text-[#8A8F98] leading-relaxed">{plan.desc}</p>

        {/* Price */}
        <div className="mb-1 flex items-baseline gap-1">
          <span className="text-[#8A8F98]">S/</span>
          <span
            className={`text-5xl font-semibold tracking-tight ${
              plan.featured ? "text-shimmer" : "text-gradient"
            }`}
          >
            {plan.price}
          </span>
          <span className="text-[#8A8F98] text-sm">{plan.period}</span>
        </div>

        {/* Pro-rated label */}
        <p className="mb-6 text-xs text-[#8A8F98]/60">{plan.limit}</p>

        {/* Divider */}
        <div className="mb-6 h-px bg-white/[0.06]" />

        {/* Benefits */}
        <ul className="mb-8 flex flex-1 flex-col gap-3">
          {plan.benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-[#EDEDEF]">
              <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[rgba(94,106,210,0.18)]">
                <Check className="h-2.5 w-2.5 text-[#5E6AD2]" />
              </span>
              <span className={b.startsWith("Todo lo del") ? "text-[#8A8F98] italic" : ""}>
                {b}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={plan.ctaHref}
          className={`group flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
            plan.featured
              ? "bg-[#5E6AD2] text-white shadow-[0_0_20px_rgba(94,106,210,0.4)] hover:bg-[#6872D9] hover:shadow-[0_0_32px_rgba(94,106,210,0.6)]"
              : "border border-white/[0.10] bg-white/[0.04] text-[#EDEDEF] hover:bg-white/[0.08] hover:border-white/20"
          }`}
        >
          {plan.cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>

        {plan.id === "free" && (
          <p className="mt-3 text-center text-[11px] text-[#8A8F98]/60">
            Sin tarjeta de crédito
          </p>
        )}
        {plan.featured && (
          <p className="mt-3 text-center text-[11px] text-[#8A8F98]/60">
            14 días gratis · Sin tarjeta
          </p>
        )}
      </div>
    </div>
  );
}
