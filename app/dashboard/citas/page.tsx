"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CalendarDays, Filter, CheckCircle2, XCircle, Clock } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";

const CITAS = [
  { id: 1, time: "10:00", date: "Hoy", client: "Carlos Mendoza",   service: "Corte + Barba",  duration: "50 min", status: "confirmada" },
  { id: 2, time: "11:00", date: "Hoy", client: "Diego Ramírez",    service: "Corte clásico",  duration: "30 min", status: "pendiente"  },
  { id: 3, time: "12:30", date: "Hoy", client: "Andrés Villanueva",service: "Degradado",      duration: "40 min", status: "confirmada" },
  { id: 4, time: "14:00", date: "Hoy", client: "Sebastián López",  service: "Barba",          duration: "20 min", status: "pendiente"  },
  { id: 5, time: "09:00", date: "Ayer",client: "Marco Torres",     service: "Corte clásico",  duration: "30 min", status: "confirmada" },
  { id: 6, time: "15:00", date: "Ayer",client: "Luis Paredes",     service: "Corte + Barba",  duration: "50 min", status: "cancelada"  },
];

const STATUS_STYLE: Record<string, string> = {
  confirmada: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pendiente:  "bg-amber-500/10  text-amber-400  border-amber-500/20",
  cancelada:  "bg-red-500/10    text-red-400    border-red-500/20",
};

const FILTERS = ["todas", "pendiente", "confirmada", "cancelada"] as const;
type Filter = typeof FILTERS[number];

export default function CitasPage() {
  const [filter, setFilter] = useState<Filter>("todas");
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo("[data-row]",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.05, delay: 0.1 },
      );
    },
    { scope: pageRef, dependencies: [filter] },
  );

  const visible = filter === "todas" ? CITAS : CITAS.filter((c) => c.status === filter);

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#EDEDEF] tracking-tight flex items-center gap-2.5">
              <CalendarDays className="h-6 w-6 text-[#5E6AD2]" />
              Citas
            </h1>
            <p className="mt-1 text-sm text-[#8A8F98]">{CITAS.length} citas en total</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-[#8A8F98] shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-150 border capitalize ${
                filter === f
                  ? "bg-[#5E6AD2]/20 border-[#5E6AD2]/50 text-[#EDEDEF]"
                  : "bg-white/[0.04] border-white/[0.06] text-[#8A8F98] hover:bg-white/[0.07] hover:text-[#EDEDEF]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div
          className="rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 border-b border-white/[0.06] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#8A8F98]/60">
            <span className="w-16">Hora</span>
            <span>Cliente</span>
            <span>Servicio</span>
            <span className="w-20 text-right">Duración</span>
            <span className="w-28 text-right">Estado</span>
          </div>

          {visible.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-[#8A8F98]">
              No hay citas con estado "{filter}".
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {visible.map((cita) => (
                <div
                  key={cita.id}
                  data-row
                  className="group grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-4 px-5 py-3.5 opacity-0 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-16">
                    <p className="font-mono text-sm font-medium text-[#EDEDEF]">{cita.time}</p>
                    <p className="text-[11px] text-[#8A8F98]/60">{cita.date}</p>
                  </div>
                  <p className="truncate text-sm text-[#EDEDEF]">{cita.client}</p>
                  <p className="truncate text-sm text-[#8A8F98]">{cita.service}</p>
                  <p className="w-20 text-right font-mono text-xs text-[#8A8F98]/70">{cita.duration}</p>
                  <div className="flex w-28 items-center justify-end gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[cita.status]}`}
                    >
                      {cita.status}
                    </span>
                    {cita.status === "pendiente" && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="rounded-md p-1 text-emerald-400 hover:bg-emerald-500/10">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                        <button className="rounded-md p-1 text-red-400 hover:bg-red-500/10">
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
