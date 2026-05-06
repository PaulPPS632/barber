"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Users2, Plus, Mail, Loader2, CheckCircle2, XCircle, Clock,
  Trash2, Crown, Scissors, RefreshCw, Ban, ChevronDown, ChevronUp,
  Calendar, ToggleLeft, ToggleRight, Pencil,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAppSession } from "@/lib/auth-client";
import type {
  StaffMember, StaffInvitation, StaffDisponibilidad,
  CreateDisponibilidadPayload,
} from "@/types/api";

const API = process.env.NEXT_PUBLIC_API_URL;

const DIAS: Record<number, string> = {
  0: "Domingo", 1: "Lunes", 2: "Martes", 3: "Miércoles",
  4: "Jueves",  5: "Viernes", 6: "Sábado",
};

type InviteFormStatus = "idle" | "sending" | "sent" | "error";
type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

const ROLE_STYLE: Record<string, string> = {
  admin:   "bg-[#5E6AD2]/10 text-[#5E6AD2] border-[#5E6AD2]/20",
  staff:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  superadmin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const INVITE_STATUS_STYLE: Record<InvitationStatus, string> = {
  pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  revoked:  "bg-red-500/10 text-red-400 border-red-500/20",
  expired:  "bg-white/5 text-[#8A8F98] border-white/10",
};

const INVITE_STATUS_LABEL: Record<InvitationStatus, string> = {
  pending: "pendiente", accepted: "aceptada", revoked: "revocada", expired: "expirada",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5E6AD2]/20 border border-[#5E6AD2]/30 text-xs font-semibold text-[#5E6AD2]">
      {parts[0]?.[0]?.toUpperCase()}{parts[1]?.[0]?.toUpperCase() ?? ""}
    </div>
  );
}

// ── Disponibilidad panel for a single staff member ─────────────────────────

function DisponibilidadPanel({ barberiaId, staffId }: { barberiaId: string | number; staffId: string }) {
  const [bloques,   setBloques]   = useState<StaffDisponibilidad[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState<CreateDisponibilidadPayload>({ diaSemana: 1, horaInicio: "09:00", horaFin: "18:00", activo: true });
  const [saving,    setSaving]    = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchBloques = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/barberias/${barberiaId}/staff/${staffId}/disponibilidad`, { credentials: "include" });
      if (res.ok) setBloques(await res.json());
    } finally {
      setLoading(false);
    }
  }, [barberiaId, staffId]);

  useEffect(() => { fetchBloques(); }, [fetchBloques]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId != null) {
        const res = await fetch(`${API}/barberias/${barberiaId}/staff/${staffId}/disponibilidad/${editingId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ horaInicio: form.horaInicio, horaFin: form.horaFin, activo: form.activo }),
        });
        if (res.ok) {
          const updated = await res.json();
          setBloques((prev) => prev.map((b) => b.id === editingId ? updated : b));
        }
      } else {
        const res = await fetch(`${API}/barberias/${barberiaId}/staff/${staffId}/disponibilidad`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) { const nb = await res.json(); setBloques((prev) => [...prev, nb]); }
      }
      setShowForm(false);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API}/barberias/${barberiaId}/staff/${staffId}/disponibilidad/${id}`, { method: "DELETE", credentials: "include" });
    setBloques((prev) => prev.filter((b) => b.id !== id));
  };

  const openEdit = (b: StaffDisponibilidad) => {
    setForm({ diaSemana: b.diaSemana, horaInicio: b.horaInicio, horaFin: b.horaFin, activo: b.activo });
    setEditingId(b.id);
    setShowForm(true);
  };

  const grouped = Object.entries(DIAS).map(([dia, nombre]) => ({
    dia: Number(dia),
    nombre,
    bloques: bloques.filter((b) => b.diaSemana === Number(dia)),
  }));

  return (
    <div className="mt-3 rounded-xl border border-white/[0.06] p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#EDEDEF] flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#5E6AD2]" /> Disponibilidad semanal
        </p>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ diaSemana: 1, horaInicio: "09:00", horaFin: "18:00", activo: true }); }} className="flex items-center gap-1 text-[11px] text-[#5E6AD2] hover:text-[#6872D9]">
          <Plus className="h-3 w-3" /> Agregar bloque
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-[#5E6AD2]/20 p-3 space-y-3" style={{ background: "rgba(94,106,210,0.06)" }}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-[10px] text-[#8A8F98] uppercase tracking-wide">Día</label>
              <select value={form.diaSemana} onChange={(e) => setForm((f) => ({ ...f, diaSemana: Number(e.target.value) }))} disabled={editingId != null} className="w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.05] px-2 py-1.5 text-xs text-[#EDEDEF] outline-none focus:border-[#5E6AD2]/50">
                {Object.entries(DIAS).map(([d, n]) => <option key={d} value={d}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-[#8A8F98] uppercase tracking-wide">Inicio</label>
              <input type="time" value={form.horaInicio} onChange={(e) => setForm((f) => ({ ...f, horaInicio: e.target.value }))} className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-2 py-1.5 text-xs text-[#EDEDEF] outline-none focus:border-[#5E6AD2]/50" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-[#8A8F98] uppercase tracking-wide">Fin</label>
              <input type="time" value={form.horaFin} onChange={(e) => setForm((f) => ({ ...f, horaFin: e.target.value }))} className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-2 py-1.5 text-xs text-[#EDEDEF] outline-none focus:border-[#5E6AD2]/50" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-[#8A8F98] uppercase tracking-wide">Activo</label>
              <button onClick={() => setForm((f) => ({ ...f, activo: !f.activo }))} className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs transition-colors ${form.activo ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-white/[0.08] bg-white/[0.05] text-[#8A8F98]"}`}>
                {form.activo ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                {form.activo ? "Activo" : "Inactivo"}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 rounded-lg bg-[#5E6AD2] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#6872D9] disabled:opacity-60">
              {saving && <Loader2 className="h-3 w-3 animate-spin" />} {editingId != null ? "Guardar" : "Crear"}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-[#8A8F98] hover:bg-white/[0.05]">Cancelar</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-[#8A8F98]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando…
        </div>
      ) : (
        <div className="grid gap-1.5">
          {grouped.map(({ dia, nombre, bloques: bs }) =>
            bs.length === 0 ? null : (
              <div key={dia} className="flex items-center gap-3 flex-wrap">
                <span className="w-20 shrink-0 text-[11px] font-medium text-[#8A8F98]">{nombre}</span>
                {bs.map((b) => (
                  <div key={b.id} className={`group flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] ${b.activo ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-white/[0.08] bg-white/[0.04] text-[#8A8F98]"}`}>
                    <Clock className="h-3 w-3" />
                    {b.horaInicio} – {b.horaFin}
                    <button onClick={() => openEdit(b)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8A8F98] hover:text-[#EDEDEF]">
                      <Pencil className="h-2.5 w-2.5" />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8A8F98] hover:text-red-400">
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
          {bloques.length === 0 && (
            <p className="text-xs text-[#8A8F98]/50 italic">Sin horarios configurados.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const { data: session } = useAppSession();
  const barberiaId = session?.user.barberiaId;
  const pageRef = useRef<HTMLDivElement>(null);

  const [members,     setMembers]     = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);

  const [email,       setEmail]       = useState("");
  const [formStatus,  setFormStatus]  = useState<InviteFormStatus>("idle");
  const [formError,   setFormError]   = useState<string | null>(null);
  const [revokingId,  setRevokingId]  = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!barberiaId) return;
    setLoading(true);
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        fetch(`${API}/barberias/${barberiaId}/staff`, { credentials: "include" }),
        fetch(`${API}/barberias/${barberiaId}/staff/invitations`, { credentials: "include" }),
      ]);
      if (membersRes.ok)     setMembers(await membersRes.json());
      if (invitationsRes.ok) setInvitations(await invitationsRes.json());
    } finally {
      setLoading(false);
    }
  }, [barberiaId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useGSAP(
    () => {
      gsap.fromTo("[data-row]",
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.06, delay: 0.1 },
      );
    },
    { scope: pageRef, dependencies: [loading] },
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !barberiaId) return;
    setFormError(null);
    setFormStatus("sending");
    try {
      const res = await fetch(`${API}/barberias/${barberiaId}/staff/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Error al enviar la invitación");
      }
      setFormStatus("sent");
      setEmail("");
      setInvitations((prev) => [{
        id: Date.now(), email: email.trim(), status: "pending",
        expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
        createdAt: new Date().toISOString(), acceptedBy: null,
      }, ...prev]);
      setTimeout(() => setFormStatus("idle"), 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error desconocido");
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 4000);
    }
  };

  const handleRevoke = async (invitationId: number) => {
    if (!barberiaId) return;
    setRevokingId(invitationId);
    try {
      const res = await fetch(`${API}/barberias/${barberiaId}/staff/invitations/${invitationId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      setInvitations((prev) => prev.map((inv) => inv.id === invitationId ? { ...inv, status: "revoked" } : inv));
    } catch { /* silently */ } finally {
      setRevokingId(null);
    }
  };

  const pendingCount = invitations.filter((i) => i.status === "pending").length;

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-3xl space-y-8">

        {/* Header */}
        <div data-row className="opacity-0 flex items-start justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#EDEDEF] tracking-tight">
              <Users2 className="h-6 w-6 text-[#5E6AD2]" /> Staff
            </h1>
            <p className="mt-1 text-sm text-[#8A8F98]">
              {members.length} miembro{members.length !== 1 ? "s" : ""} · {pendingCount} invitación{pendingCount !== 1 ? "es" : ""} pendiente{pendingCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#8A8F98] hover:text-[#EDEDEF] transition-colors disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Actualizar
          </button>
        </div>

        {/* Invite form */}
        <div data-row className="rounded-2xl border border-white/[0.06] p-5 space-y-4 opacity-0" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#EDEDEF]"><Plus className="h-4 w-4 text-[#5E6AD2]" /> Invitar barbero</h2>
            <p className="mt-1 text-xs text-[#8A8F98]">Se enviará un correo con un enlace único. El barbero se registrará y quedará vinculado a tu barbería automáticamente.</p>
          </div>
          <form onSubmit={handleInvite} className="flex gap-2.5">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8F98]/50 pointer-events-none" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] pl-9 pr-4 py-2.5 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50 focus:ring-1 focus:ring-[#5E6AD2]/20" />
            </div>
            <button type="submit" disabled={formStatus === "sending"} className="flex items-center gap-2 rounded-xl bg-[#5E6AD2] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#6872D9] active:scale-95 disabled:opacity-60 disabled:pointer-events-none shrink-0">
              {formStatus === "sending" ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando…</> : formStatus === "sent" ? <><CheckCircle2 className="h-4 w-4" />¡Enviado!</> : <><Plus className="h-4 w-4" />Invitar</>}
            </button>
          </form>
          {formStatus === "error" && formError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
              <XCircle className="h-3.5 w-3.5 shrink-0" />{formError}
            </div>
          )}
        </div>

        {/* Miembros */}
        <div data-row className="opacity-0 rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="border-b border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#EDEDEF]">Miembros activos</h2>
            <span className="rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 px-2 py-0.5 text-[11px] font-medium text-[#5E6AD2]">{members.length}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#8A8F98]"><Loader2 className="h-4 w-4 animate-spin" /> Cargando…</div>
          ) : members.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#8A8F98]">Aún no hay miembros activos.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {members.map((member) => {
                const isExpanded = expandedId === member.id;
                const profile = member.staffProfile;
                return (
                  <div key={member.id}>
                    <div className="group flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors">
                      <Initials name={member.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-[#EDEDEF] truncate">{member.name}</p>
                          <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${ROLE_STYLE[member.role] ?? ROLE_STYLE.staff}`}>
                            {member.role === "admin" || member.role === "superadmin" ? <Crown className="h-2.5 w-2.5" /> : <Scissors className="h-2.5 w-2.5" />}
                            {member.role}
                          </span>
                          {profile && !profile.activo && (
                            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">Inactivo</span>
                          )}
                        </div>
                        <p className="text-xs text-[#8A8F98] mt-0.5 truncate">{member.email}</p>
                        {profile?.especialidad && (
                          <p className="text-[11px] text-[#8A8F98]/60 mt-0.5">{profile.especialidad}</p>
                        )}
                      </div>
                      {/* Toggle disponibilidad */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : member.id)}
                        className="flex items-center gap-1 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-[#8A8F98] hover:bg-white/[0.06] hover:text-[#EDEDEF] transition-colors"
                      >
                        <Calendar className="h-3 w-3" />
                        Horario
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>

                    {/* Disponibilidad expandida */}
                    {isExpanded && barberiaId && (
                      <div className="px-5 pb-4">
                        <DisponibilidadPanel barberiaId={barberiaId} staffId={member.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invitaciones */}
        <div data-row className="opacity-0 rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="border-b border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#EDEDEF]">Invitaciones</h2>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#8A8F98]"><Loader2 className="h-4 w-4 animate-spin" /> Cargando…</div>
          ) : invitations.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#8A8F98]">No se han enviado invitaciones aún.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {invitations.map((inv) => (
                <div key={inv.id} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors">
                  {inv.acceptedBy ? <Initials name={inv.acceptedBy.name} /> : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.08]">
                      <Mail className="h-4 w-4 text-[#8A8F98]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {inv.acceptedBy ? (
                      <>
                        <p className="text-sm font-medium text-[#EDEDEF] truncate">{inv.acceptedBy.name}</p>
                        <p className="text-xs text-[#8A8F98] mt-0.5 truncate">{inv.email}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-[#EDEDEF] truncate">{inv.email}</p>
                        <p className="text-xs text-[#8A8F98] mt-0.5">
                          {inv.status === "pending" ? `Expira ${fmt(inv.expiresAt)}` : `Enviada ${fmt(inv.createdAt)}`}
                        </p>
                      </>
                    )}
                  </div>
                  <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium shrink-0 ${INVITE_STATUS_STYLE[inv.status as InvitationStatus]}`}>
                    {inv.status === "pending" && <Clock className="h-3 w-3" />}
                    {inv.status === "accepted" && <CheckCircle2 className="h-3 w-3" />}
                    {(inv.status === "revoked" || inv.status === "expired") && <Ban className="h-3 w-3" />}
                    {INVITE_STATUS_LABEL[inv.status as InvitationStatus]}
                  </span>
                  {inv.status === "pending" && (
                    <button onClick={() => handleRevoke(inv.id)} disabled={revokingId === inv.id} className="ml-1 rounded-lg p-1.5 text-[#8A8F98]/30 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50" title="Revocar">
                      {revokingId === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
