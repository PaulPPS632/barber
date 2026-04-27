"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Users, Phone, CalendarDays, ChevronRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";

const CLIENTES = [
  { id: 1, name: "Carlos Mendoza",    phone: "+51 999 123 456", visits: 8,  lastVisit: "Hoy",         service: "Corte + Barba"  },
  { id: 2, name: "Diego Ramírez",     phone: "+51 991 456 789", visits: 5,  lastVisit: "Ayer",        service: "Corte clásico"  },
  { id: 3, name: "Andrés Villanueva", phone: "+51 987 321 654", visits: 12, lastVisit: "Hace 3 días", service: "Degradado"      },
  { id: 4, name: "Sebastián López",   phone: "+51 998 654 123", visits: 3,  lastVisit: "Hace 1 semana",service: "Barba"         },
  { id: 5, name: "Marco Torres",      phone: "+51 993 789 012", visits: 6,  lastVisit: "Hace 1 semana",service: "Corte clásico" },
  { id: 6, name: "Luis Paredes",      phone: "+51 985 234 567", visits: 2,  lastVisit: "Hace 2 semanas",service: "Corte + Barba"},
];

function Initials({ name }: { name: string }) {
  const parts = name.split(" ");
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5E6AD2]/20 border border-[#5E6AD2]/30 text-xs font-semibold text-[#5E6AD2]">
      {parts[0][0]}{parts[1]?.[0] ?? ""}
    </div>
  );
}

export default function ClientesPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo("[data-card]",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.06, delay: 0.1 },
      );
    },
    { scope: pageRef },
  );

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[#EDEDEF] tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#5E6AD2]" />
            Clientes
          </h1>
          <p className="mt-1 text-sm text-[#8A8F98]">{CLIENTES.length} clientes registrados</p>
        </div>

        {/* Client list */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CLIENTES.map((cliente) => (
            <div
              key={cliente.id}
              data-card
              className="group relative flex flex-col gap-3 rounded-2xl border border-white/[0.06] p-4 opacity-0 cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-150"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {/* Top row */}
              <div className="flex items-center gap-3">
                <Initials name={cliente.name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#EDEDEF]">{cliente.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3 text-[#8A8F98]" />
                    <p className="text-xs text-[#8A8F98]">{cliente.phone}</p>
                  </div>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 text-[#8A8F98]/30 group-hover:text-[#8A8F98] transition-colors shrink-0" />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] px-3.5 py-2.5 text-xs"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-1.5 text-[#8A8F98]">
                  <CalendarDays className="h-3 w-3" />
                  <span>{cliente.visits} visitas</span>
                </div>
                <span className="text-[#8A8F98]/50">·</span>
                <span className="text-[#8A8F98]/70">{cliente.lastVisit}</span>
              </div>

              {/* Last service */}
              <p className="text-[11px] text-[#8A8F98]/60">
                Último: <span className="text-[#8A8F98]">{cliente.service}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
