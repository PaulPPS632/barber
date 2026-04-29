"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Users2,
  Plus,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Crown,
  Scissors,
  RefreshCw,
  Ban,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAppSession } from "@/lib/auth-client";

// ── Types ────────────────────────────────────────────────────────────────────

type InviteFormStatus = "idle" | "sending" | "sent" | "error";
type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "barbero";
  createdAt: string;
}

interface Invitation {
  id: number;
  email: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  acceptedBy: { id: string; name: string; email: string } | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_STYLE: Record<string, string> = {
  owner:   "bg-[#5E6AD2]/10 text-[#5E6AD2] border-[#5E6AD2]/20",
  barbero: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const INVITE_STATUS_STYLE: Record<InvitationStatus, string> = {
  pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  revoked:  "bg-red-500/10 text-red-400 border-red-500/20",
  expired:  "bg-white/5 text-[#8A8F98] border-white/10",
};

const INVITE_STATUS_LABEL: Record<InvitationStatus, string> = {
  pending:  "pendiente",
  accepted: "aceptada",
  revoked:  "revocada",
  expired:  "expirada",
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const { data: session } = useAppSession();
  const barberiaId = session?.user.barberiaId;
  const pageRef = useRef<HTMLDivElement>(null);

  const [members,     setMembers]     = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading,     setLoading]     = useState(true);

  const [email,          setEmail]          = useState("");
  const [formStatus,     setFormStatus]     = useState<InviteFormStatus>("idle");
  const [formError,      setFormError]      = useState<string | null>(null);
  const [revokingId,     setRevokingId]     = useState<number | null>(null);

  // ── Fetch data ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!barberiaId) return;
    setLoading(true);
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/barberias/${barberiaId}/staff`, { credentials: "include" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/barberias/${barberiaId}/staff/invitations`, { credentials: "include" }),
      ]);
      if (membersRes.ok)     setMembers(await membersRes.json());
      if (invitationsRes.ok) setInvitations(await invitationsRes.json());
    } finally {
      setLoading(false);
    }
  }, [barberiaId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Animations ────────────────────────────────────────────────────────────

  useGSAP(
    () => {
      gsap.fromTo("[data-row]",
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.06, delay: 0.1 },
      );
    },
    { scope: pageRef, dependencies: [loading] },
  );

  // ── Invite ────────────────────────────────────────────────────────────────

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !barberiaId) return;
    setFormError(null);
    setFormStatus("sending");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/barberias/${barberiaId}/staff/invite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: email.trim() }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Error al enviar la invitación");
      }

      setFormStatus("sent");
      setEmail("");
      // Optimistic: add pending entry
      setInvitations((prev) => [
        {
          id: Date.now(),
          email: email.trim(),
          status: "pending",
          expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
          createdAt: new Date().toISOString(),
          acceptedBy: null,
        },
        ...prev,
      ]);
      setTimeout(() => setFormStatus("idle"), 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error desconocido");
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 4000);
    }
  };

  // ── Revoke ────────────────────────────────────────────────────────────────

  const handleRevoke = async (invitationId: number) => {
    if (!barberiaId) return;
    setRevokingId(invitationId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/barberias/${barberiaId}/staff/invitations/${invitationId}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) throw new Error();
      setInvitations((prev) =>
        prev.map((inv) => inv.id === invitationId ? { ...inv, status: "revoked" } : inv)
      );
    } catch {
      // silently ignore
    } finally {
      setRevokingId(null);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const pendingCount = invitations.filter((i) => i.status === "pending").length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-3xl space-y-8">

        {/* Header */}
        <div data-row className="opacity-0 flex items-start justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#EDEDEF] tracking-tight">
              <Users2 className="h-6 w-6 text-[#5E6AD2]" />
              Staff
            </h1>
            <p className="mt-1 text-sm text-[#8A8F98]">
              {members.length} miembro{members.length !== 1 ? "s" : ""} activo{members.length !== 1 ? "s" : ""} · {pendingCount} invitación{pendingCount !== 1 ? "es" : ""} pendiente{pendingCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#8A8F98] hover:text-[#EDEDEF] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {/* Invite form */}
        <div
          data-row
          className="rounded-2xl border border-white/[0.06] p-5 space-y-4 opacity-0"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#EDEDEF]">
              <Plus className="h-4 w-4 text-[#5E6AD2]" />
              Invitar barbero
            </h2>
            <p className="mt-1 text-xs text-[#8A8F98]">
              Se enviará un correo con un enlace único. El barbero se registrará y quedará vinculado a tu barbería automáticamente.
            </p>
          </div>

          <form onSubmit={handleInvite} className="flex gap-2.5">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8F98]/50 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] pl-9 pr-4 py-2.5 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50 focus:ring-1 focus:ring-[#5E6AD2]/20"
              />
            </div>
            <button
              type="submit"
              disabled={formStatus === "sending"}
              className="flex items-center gap-2 rounded-xl bg-[#5E6AD2] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#6872D9] active:scale-95 disabled:opacity-60 disabled:pointer-events-none shrink-0"
            >
              {formStatus === "sending" ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Enviando…</>
              ) : formStatus === "sent" ? (
                <><CheckCircle2 className="h-4 w-4" />¡Enviado!</>
              ) : (
                <><Plus className="h-4 w-4" />Invitar</>
              )}
            </button>
          </form>

          {formStatus === "error" && formError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
              <XCircle className="h-3.5 w-3.5 shrink-0" />{formError}
            </div>
          )}
        </div>

        {/* ── Miembros activos ─────────────────────────────────────────────── */}
        <div data-row className="opacity-0 rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="border-b border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#EDEDEF]">Miembros activos</h2>
            <span className="rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 px-2 py-0.5 text-[11px] font-medium text-[#5E6AD2]">
              {members.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#8A8F98]">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : members.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#8A8F98]">Aún no hay miembros activos.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="group flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
                >
                  <Initials name={member.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[#EDEDEF] truncate">{member.name}</p>
                      <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${ROLE_STYLE[member.role] ?? ROLE_STYLE.barbero}`}>
                        {member.role === "owner" ? <Crown className="h-2.5 w-2.5" /> : <Scissors className="h-2.5 w-2.5" />}
                        {member.role}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A8F98] mt-0.5 truncate">{member.email}</p>
                  </div>
                  <p className="text-[11px] text-[#8A8F98] shrink-0 hidden sm:block">
                    Desde {fmt(member.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Invitaciones ─────────────────────────────────────────────────── */}
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
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#8A8F98]">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : invitations.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#8A8F98]">No se han enviado invitaciones aún.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="group flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
                >
                  {/* Avatar / icon */}
                  {inv.acceptedBy ? (
                    <Initials name={inv.acceptedBy.name} />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.08]">
                      <Mail className="h-4 w-4 text-[#8A8F98]" />
                    </div>
                  )}

                  {/* Info */}
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
                          {inv.status === "pending"
                            ? `Expira ${fmt(inv.expiresAt)}`
                            : `Enviada ${fmt(inv.createdAt)}`}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Status badge */}
                  <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium shrink-0 ${INVITE_STATUS_STYLE[inv.status]}`}>
                    {inv.status === "pending" && <Clock className="h-3 w-3" />}
                    {inv.status === "accepted" && <CheckCircle2 className="h-3 w-3" />}
                    {(inv.status === "revoked" || inv.status === "expired") && <Ban className="h-3 w-3" />}
                    {INVITE_STATUS_LABEL[inv.status]}
                  </span>

                  {/* Revoke button (only pending) */}
                  {inv.status === "pending" && (
                    <button
                      onClick={() => handleRevoke(inv.id)}
                      disabled={revokingId === inv.id}
                      className="ml-1 rounded-lg p-1.5 text-[#8A8F98]/30 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                      title="Revocar invitación"
                    >
                      {revokingId === inv.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />
                      }
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
