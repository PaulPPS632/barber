"use client";

import { use, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Loader2, CheckCircle2, XCircle, Users2 } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

type InviteState =
  | { status: "loading" }
  | { status: "valid"; barberiaId: number; barberiaName: string; email: string }
  | { status: "invalid"; message: string }
  | { status: "success" };

export default function InvitacionPage() {
  const { token } = useParams<{ token: string }>();
  const barberiaId = useSearchParams().get("barberiaId") || "";
  const router    = useRouter();
  const cardRef   = useRef<HTMLDivElement>(null);

  const [invite, setInvite]   = useState<InviteState>({ status: "loading" });
  const [name,   setName]     = useState("");
  const [pwd,    setPwd]      = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Password strength ────────────────────────────────────────────────────
  const pwdRules = [
    { label: "Mínimo 8 caracteres",      pass: pwd.length >= 8 },
    { label: "Una letra mayúscula",       pass: /[A-Z]/.test(pwd) },
    { label: "Un número",                 pass: /[0-9]/.test(pwd) },
    { label: "Un carácter especial",      pass: /[^A-Za-z0-9]/.test(pwd) },
  ];
  const strength    = pwdRules.filter((r) => r.pass).length;          // 0-4
  const pwdValid    = strength === 4;
  const pwdMatch    = pwd === confirmPwd && confirmPwd.length > 0;
  const canSubmit   = name.trim().length > 0 && pwdValid && pwdMatch;

  const strengthColor = [
    "bg-red-500",     // 1
    "bg-orange-500",  // 2
    "bg-amber-400",   // 3
    "bg-emerald-500", // 4
  ][strength - 1] ?? "bg-white/10";


  // ── Validate token on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setInvite({ status: "invalid", message: "Token inválido." }); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/barberias/${barberiaId}/staff/invite/validate/${token}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.message ?? "Invitación no válida o expirada.");
        return data as { ok: boolean; message: string; invitation: { email: string; barberiaId: number } };
      })
      .then(async ({ invitation }) => {
        // Fetch barbería name using the returned barberiaId
        const barberiaRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/barberias/public/${invitation.barberiaId}`);
        const barberiaData = await barberiaRes.json().catch(() => ({}));
        const barberiaName: string = barberiaData?.nombre ?? barberiaData?.name ?? "tu barbería";
        setInvite({ status: "valid", barberiaId: invitation.barberiaId, barberiaName, email: invitation.email });
      })
      .catch((err: Error) => setInvite({ status: "invalid", message: err.message }));
  }, [token]);

  // ── Entrance animation ───────────────────────────────────────────────────
  useGSAP(
    () => {
      gsap.fromTo("[data-anim]",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "expo.out", stagger: 0.08, delay: 0.1 },
      );
    },
    { scope: cardRef, dependencies: [invite.status] },
  );

  // ── Accept invite ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invite.status !== "valid" || !canSubmit) return;
    setSubmitError(null);
    setSubmitting(true);

    try {
      // 1 — Register the user
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email: invite.email,
        password: pwd,
        // @ts-expect-error — custom field
        inviteToken: token,
      });

      if (signUpError) throw new Error(signUpError.message ?? "Error al crear la cuenta");

      setInvite({ status: "success" });
      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-20 bg-[#050506]">
      <AnimatedBackground />

      <div ref={cardRef} className="w-full max-w-md">
        {/* Logo */}
        <div data-anim className="mb-8 flex flex-col items-center gap-3 opacity-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5E6AD2] text-white font-bold shadow-[0_0_20px_rgba(94,106,210,0.5)]">
              B
            </div>
            <span className="text-xl font-semibold text-[#EDEDEF] tracking-tight">
              Barber<span className="text-[#5E6AD2]">.pe</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          data-anim
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-8 opacity-0"
          style={{ background: "rgba(255,255,255,0.04)", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5E6AD2]/50 to-transparent" />

          {/* Loading */}
          {invite.status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#5E6AD2]" />
              <p className="text-sm text-[#8A8F98]">Verificando invitación…</p>
            </div>
          )}

          {/* Invalid */}
          {invite.status === "invalid" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-[#EDEDEF]">Invitación no válida</p>
                <p className="mt-1 text-sm text-[#8A8F98]">{invite.message}</p>
              </div>
              <Link
                href="/"
                className="text-sm text-[#5E6AD2] hover:text-[#6872D9] transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          )}

          {/* Success */}
          {invite.status === "success" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-[#EDEDEF]">¡Bienvenido al equipo!</p>
                <p className="mt-1 text-sm text-[#8A8F98]">Redirigiendo al dashboard…</p>
              </div>
              <Loader2 className="h-4 w-4 animate-spin text-[#8A8F98]" />
            </div>
          )}

          {/* Valid — registration form */}
          {invite.status === "valid" && (
            <div className="space-y-5">
              {/* Invite header */}
              <div className="flex flex-col items-center gap-2 text-center pb-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5E6AD2]/15 border border-[#5E6AD2]/25">
                  <Users2 className="h-5 w-5 text-[#5E6AD2]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8A8F98] uppercase tracking-widest">Has sido invitado a</p>
                  <p className="text-lg font-semibold text-[#EDEDEF] mt-0.5">{invite.barberiaName}</p>
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#8A8F98] tracking-wide">Correo electrónico</label>
                <div
                  className="flex items-center rounded-lg border px-4 py-3 text-sm"
                  style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
                >
                  <span className="text-[#8A8F98]">{invite.email}</span>
                  <span className="ml-auto text-[10px] text-[#8A8F98]/50 uppercase tracking-wider">Fijo</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#8A8F98] tracking-wide">Tu nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    required
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50 focus:ring-1 focus:ring-[#5E6AD2]/20"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#8A8F98] tracking-wide">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      placeholder="Crea una contraseña segura"
                      required
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-10 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50 focus:ring-1 focus:ring-[#5E6AD2]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8F98] hover:text-[#EDEDEF] transition-colors"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {pwd.length > 0 && (
                    <div className="space-y-2 pt-0.5">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColor : "bg-white/10"}`}
                          />
                        ))}
                      </div>
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                        {pwdRules.map((rule) => (
                          <li key={rule.label} className={`flex items-center gap-1.5 text-[11px] transition-colors ${rule.pass ? "text-emerald-400" : "text-[#8A8F98]"}`}>
                            <span className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${rule.pass ? "bg-emerald-400" : "bg-white/20"}`} />
                            {rule.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#8A8F98] tracking-wide">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      placeholder="Repite la contraseña"
                      required
                      className={`w-full rounded-lg border bg-white/[0.04] px-4 py-3 pr-10 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none transition-colors focus:ring-1 ${
                        confirmPwd.length === 0
                          ? "border-white/[0.08] focus:border-[#5E6AD2]/50 focus:ring-[#5E6AD2]/20"
                          : pwdMatch
                          ? "border-emerald-500/40 focus:border-emerald-500/60 focus:ring-emerald-500/20"
                          : "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8F98] hover:text-[#EDEDEF] transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPwd.length > 0 && !pwdMatch && (
                    <p className="text-[11px] text-red-400">Las contraseñas no coinciden</p>
                  )}
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#5E6AD2] py-3 text-sm font-medium text-white shadow-[0_0_20px_rgba(94,106,210,0.35)] transition-all hover:bg-[#6872D9] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Unirme al equipo
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
