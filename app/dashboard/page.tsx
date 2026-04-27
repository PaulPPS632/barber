"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  CalendarDays,
  Users,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

const STATS = [
  { label: "Citas hoy",        value: "8",   sub: "3 pendientes",  icon: CalendarDays,  color: "#5E6AD2" },
  { label: "Clientes totales", value: "124", sub: "+4 este mes",   icon: Users,         color: "#10b981" },
  { label: "Confirmadas",      value: "5",   sub: "esta semana",   icon: CheckCircle2,  color: "#f59e0b" },
  { label: "Ingresos del mes", value: "S/ 2,400", sub: "+18%",    icon: TrendingUp,    color: "#6366f1" },
];

const UPCOMING = [
  { time: "10:00", client: "Carlos M.",  service: "Corte + Barba",  duration: "50 min", status: "confirmada" },
  { time: "11:00", client: "Diego R.",   service: "Corte clásico",  duration: "30 min", status: "pendiente"  },
  { time: "12:30", client: "Andrés V.",  service: "Degradado",      duration: "40 min", status: "confirmada" },
  { time: "14:00", client: "Sebastián L.", service: "Barba",        duration: "20 min", status: "pendiente"  },
];

const STATUS_STYLE: Record<string, string> = {
  confirmada: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pendiente:  "bg-amber-500/10  text-amber-400  border-amber-500/20",
  cancelada:  "bg-red-500/10    text-red-400    border-red-500/20",
};

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-stat]", pageRef.current);
      gsap.fromTo(cards,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "expo.out", stagger: 0.07, delay: 0.1 },
      );

      gsap.fromTo("[data-section]",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "expo.out", stagger: 0.1, delay: 0.35 },
      );
    },
    { scope: pageRef },
  );

  const firstName = session?.user?.name?.split(" ")[0] ?? "Bienvenido";

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[#EDEDEF] tracking-tight">
            Hola, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-[#8A8F98]">
            Aquí está el resumen de tu barbería hoy.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ label, value, sub, icon: Icon, color }) => (
            <div
              key={label}
              data-stat
              className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 opacity-0"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {/* Ambient glow */}
              <div
                className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20"
                style={{ background: color, filter: "blur(24px)" }}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#8A8F98]">{label}</p>
                  <p className="mt-1 text-2xl font-semibold text-[#EDEDEF]">{value}</p>
                  <p className="mt-0.5 text-xs text-[#8A8F98]/70">{sub}</p>
                </div>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: `${color}22`, border: `1px solid ${color}33` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Two-column: upcoming + quick actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming appointments */}
          <div
            data-section
            className="lg:col-span-2 rounded-2xl border border-white/[0.06] opacity-0"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#5E6AD2]" />
                <h2 className="text-sm font-semibold text-[#EDEDEF]">Citas de hoy</h2>
              </div>
              <Link
                href="/dashboard/citas"
                className="flex items-center gap-1 text-xs text-[#5E6AD2] hover:text-[#6872D9] transition-colors"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {UPCOMING.map((appt) => (
                <div
                  key={`${appt.time}-${appt.client}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 shrink-0">
                      <span className="font-mono text-sm font-medium text-[#EDEDEF]">{appt.time}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#EDEDEF]">{appt.client}</p>
                      <p className="text-xs text-[#8A8F98]">{appt.service} · {appt.duration}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[appt.status]}`}
                  >
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div
            data-section
            className="flex flex-col gap-3 opacity-0"
          >
            <h2 className="px-1 text-sm font-semibold text-[#EDEDEF]">Acciones rápidas</h2>
            {[
              { href: "/dashboard/citas",    label: "Nueva cita",      icon: CalendarDays,  color: "#5E6AD2" },
              { href: "/dashboard/clientes", label: "Ver clientes",    icon: Users,         color: "#10b981" },
              { href: "/dashboard/chat",     label: "Chat IA",         icon: CalendarDays,  color: "#6366f1" },
              { href: "/dashboard/servicios",label: "Mis servicios",   icon: CheckCircle2,  color: "#f59e0b" },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl border border-white/[0.06] px-4 py-3 transition-all duration-150 hover:border-white/[0.12] hover:bg-white/[0.05]"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <span className="text-sm text-[#8A8F98] group-hover:text-[#EDEDEF] transition-colors">
                  {label}
                </span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-[#8A8F98]/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#8A8F98]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
