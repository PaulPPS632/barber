"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  CalendarDays, Filter, CheckCircle2, XCircle, Clock,
  Loader2, RefreshCw, User, StickyNote, AlertTriangle,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAppSession } from "@/lib/auth-client";
import type { Cita, EstadoCita, CitaValidationError, StaffMember, UpdateCitaPayload } from "@/types/api";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_STYLE: Record<EstadoCita, string> = {
  confirmada: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pendiente:  "bg-amber-500/10  text-amber-400  border-amber-500/20",
  cancelada:  "bg-red-500/10    text-red-400    border-red-500/20",
};

const FILTERS = ["todas", "pendiente", "confirmada", "cancelada"] as const;
type FilterType = typeof FILTERS[number];

function fmt(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("es-PE", { day: "numeric", month: "short" }),
    time: d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false }),
  };
}

export default function CitasPage() {
  const { data: session } = useAppSession();
  const barberiaId = session?.user.barberiaId;

  const [citas,        setCitas]        = useState<Cita[]>([]);
  const [staff,        setStaff]        = useState<StaffMember[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState<FilterType>("todas");
  const [staffFilter,  setStaffFilter]  = useState<string>("");
  const [actionError,  setActionError]  = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!barberiaId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "todas") params.set("estado", filter);
      if (staffFilter)        params.set("staffId", staffFilter);

      const [citasRes, staffRes] = await Promise.all([
        fetch(`${API}/barberias/${barberiaId}/citas?${params}`, { credentials: "include" }),
        fetch(`${API}/barberias/${barberiaId}/staff`, { credentials: "include" }),
      ]);
      if (citasRes.ok) setCitas(await citasRes.json());
      if (staffRes.ok) setStaff(await staffRes.json());
    } finally {
      setLoading(false);
    }
  }, [barberiaId, filter, staffFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useGSAP(
    () => {
      gsap.fromTo("[data-row]",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.05, delay: 0.1 },
      );
    },
    { scope: pageRef, dependencies: [filter, loading] },
  );

  // ── Update estado ─────────────────────────────────────────────────────────

  const updateEstado = async (cita: Cita, estado: EstadoCita) => {
    if (!barberiaId) return;
    setActionError(null);
    try {
      const payload: UpdateCitaPayload = { estado };
      const res = await fetch(`${API}/barberias/${barberiaId}/citas/${cita.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 422) {
        const err: CitaValidationError = await res.json();
        if (err.code === "FUERA_DE_HORARIO") throw new Error("El barbero no trabaja en ese horario.");
        if (err.code === "HORARIO_OCUPADO")  throw new Error("El barbero ya tiene una cita en ese horario.");
      }
      if (!res.ok) throw new Error("Error al actualizar la cita");

      setCitas((prev) => prev.map((c) => c.id === cita.id ? { ...c, estado } : c));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error");
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const activeStaff = staff.filter((s) => s.staffProfile?.activo !== false);

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#EDEDEF] tracking-tight flex items-center gap-2.5">
              <CalendarDays className="h-6 w-6 text-[#5E6AD2]" />
              Citas
            </h1>
            <p className="mt-1 text-sm text-[#8A8F98]">{citas.length} cita{citas.length !== 1 ? "s" : ""} encontrada{citas.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#8A8F98] hover:text-[#EDEDEF] transition-colors disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Actualizar
          </button>
        </div>

        {/* Filters */}
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

          {/* Staff filter */}
          {activeStaff.length > 0 && (
            <div className="relative ml-2">
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="appearance-none rounded-full border border-white/[0.06] bg-white/[0.04] pl-3 pr-7 py-1 text-xs text-[#8A8F98] outline-none focus:border-[#5E6AD2]/50 hover:bg-white/[0.07]"
              >
                <option value="">Todos los barberos</option>
                {activeStaff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <User className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8A8F98]" />
            </div>
          )}
        </div>

        {/* Error banner */}
        {actionError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {actionError}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-3 border-b border-white/[0.06] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#8A8F98]/60">
            <span className="w-20">Fecha / Hora</span>
            <span>Cliente</span>
            <span>Servicio</span>
            <span>Barbero</span>
            <span className="w-28 text-right">Estado</span>
            <span className="w-16" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#8A8F98]">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : citas.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-[#8A8F98]">
              No hay citas{filter !== "todas" ? ` con estado "${filter}"` : ""}.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {citas.map((cita) => {
                const { date, time } = fmt(cita.fechaHoraInicio);
                return (
                  <div
                    key={cita.id}
                    data-row
                    className="group grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] items-start gap-3 px-5 py-3.5 opacity-0 hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Fecha/Hora */}
                    <div className="w-20">
                      <p className="font-mono text-sm font-medium text-[#EDEDEF]">{time}</p>
                      <p className="text-[11px] text-[#8A8F98]/60">{date}</p>
                    </div>

                    {/* Cliente */}
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#EDEDEF]">
                        {cita.cliente.nombre ?? cita.cliente.telefono}
                      </p>
                      <p className="text-[11px] text-[#8A8F98]/60">{cita.cliente.telefono}</p>
                    </div>

                    {/* Servicio */}
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#8A8F98]">{cita.servicio.nombre}</p>
                      <p className="text-[11px] text-[#8A8F98]/60 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {cita.servicio.duracionMinutos} min
                      </p>
                    </div>

                    {/* Barbero */}
                    <div className="min-w-0">
                      {cita.staff ? (
                        <p className="truncate text-sm text-[#8A8F98] flex items-center gap-1">
                          <User className="h-3 w-3 shrink-0" /> {cita.staff.name}
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#8A8F98]/40 italic">Sin asignar</p>
                      )}
                      {cita.notas && (
                        <p className="text-[11px] text-[#8A8F98]/60 truncate flex items-center gap-1 mt-0.5">
                          <StickyNote className="h-3 w-3 shrink-0" /> {cita.notas}
                        </p>
                      )}
                    </div>

                    {/* Estado */}
                    <div className="flex w-28 items-center justify-end">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[cita.estado]}`}>
                        {cita.estado}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex w-16 items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {cita.estado === "pendiente" && (
                        <>
                          <button
                            onClick={() => updateEstado(cita, "confirmada")}
                            title="Confirmar"
                            className="rounded-md p-1 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => updateEstado(cita, "cancelada")}
                            title="Cancelar"
                            className="rounded-md p-1 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                      {cita.estado === "confirmada" && (
                        <button
                          onClick={() => updateEstado(cita, "cancelada")}
                          title="Cancelar"
                          className="rounded-md p-1 text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
