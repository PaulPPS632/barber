"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, AtSign, Scissors, User } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { authClient } from "@/lib/auth-client";

interface Field {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
}

export interface SlugConfig {
  /**
   * Async validator — replace the placeholder in register/page.tsx
   * with your real endpoint call.
   * Must resolve { available: boolean }.
   */
  validateSlug: (slug: string) => Promise<{ available: boolean }>;
}

interface AuthFormProps {
  mode: "login" | "register";
  fields: Field[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  serverError?: string | null;
  /** Called after Google OAuth redirect is initiated */
  onGoogleSignIn?: () => void;
  /** When provided, renders the barbería name + slug fields with live validation */
  slugConfig?: SlugConfig;
  /** When true (register mode), shows BARBERÍA / CLIENTE selector */
  showRoleSelector?: boolean;
}

/**
 * AuthForm
 * Shared auth card used by Login & Register pages.
 * - Entrance: staggered slide-up
 * - Input focus: glow ring via GSAP
 * - Google One Tap auto-prompt + Google OAuth button
 */
type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

export function AuthForm({ mode, fields, onSubmit, serverError, onGoogleSignIn, slugConfig, showRoleSelector }: AuthFormProps) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const formRef  = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPwd, setShowPwd]             = useState(false);
  const [values,  setValues]              = useState<Record<string, string>>({});

  // ── Role selector (register only) ───────────────────────────────────────────
  type Role = "barberia" | "cliente";
  const [role, setRole] = useState<Role>("barberia");
  const isBarberiaRole  = showRoleSelector ? role === "barberia" : true;

  // ── Slug state (register only) ───────────────────────────────────────────
  const [barberiaName, setBarberiaName] = useState("");
  const [slug,         setSlug]         = useState("");
  const [slugStatus,   setSlugStatus]   = useState<SlugStatus>("idle");
  const [slugEdited,   setSlugEdited]   = useState(false); // user manually edited the slug

  const toSlug = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const validateSlug = useCallback(
    (value: string) => {
      if (!slugConfig || !value) { setSlugStatus("idle"); return; }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSlugStatus("checking");
      debounceRef.current = setTimeout(async () => {
        try {
          // ── Replace slugConfig.validateSlug with your endpoint ────────────
          const result = await slugConfig.validateSlug(value);
          setSlugStatus(result.available ? "available" : "taken");
        } catch {
          setSlugStatus("error");
        }
      }, 500);
    },
    [slugConfig],
  );

  const handleBarberiaNameChange = (value: string) => {
    setBarberiaName(value);
    if (!slugEdited) {
      const generated = toSlug(value);
      setSlug(generated);
      validateSlug(generated);
    }
  };

  const handleSlugChange = (value: string) => {
    const clean = toSlug(value) || value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(clean);
    setSlugEdited(true);
    validateSlug(clean);
  };

  // ── Password validation (register only) ───────────────────────────────
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [confirmPwd,     setConfirmPwd]     = useState("");
  const [pwdTouched,     setPwdTouched]     = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const PWD_RULES = [
    { id: "length",  label: "Mínimo 8 caracteres",      test: (p: string) => p.length >= 8 },
    { id: "upper",   label: "Una letra mayúscula",       test: (p: string) => /[A-Z]/.test(p) },
    { id: "number",  label: "Un número",                 test: (p: string) => /[0-9]/.test(p) },
    { id: "special", label: "Un carácter especial (!@#$…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ] as const;

  const pwdValue    = values["password"] ?? "";
  const rulesOk     = PWD_RULES.map((r) => r.test(pwdValue));
  const strength    = rulesOk.filter(Boolean).length; // 0-4
  const pwdValid    = strength === 4;
  const confirmOk   = confirmPwd === pwdValue && pwdValid;

  const strengthColor = ["#ef4444", "#ef4444", "#f59e0b", "#f59e0b", "#10b981"][strength];
  const strengthLabel = ["", "Muy débil", "Débil", "Regular", "Fuerte"][strength];

  // ── One Tap auto-prompt ──────────────────────────────────────────────────
  useEffect(() => {
    authClient.oneTap({
      callbackURL: "/dashboard",
      onPromptNotification: (n) => {
        console.info("One Tap prompt dismissed:", n);
      },
    }).catch(() => {/* swallow — user dismissed or not logged in with Google */});
  }, []);

  // ── Entrance animation ───────────────────────────────────────────────────
  useGSAP(
    () => {
      const children = gsap.utils.toArray<HTMLElement>("[data-anim]", cardRef.current);
      gsap.fromTo(
        children,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: "expo.out", stagger: 0.08, delay: 0.15 },
      );
    },
    { scope: cardRef },
  );

  // ── Input glow ───────────────────────────────────────────────────────────
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const wrapper = e.currentTarget.closest("[data-input-wrap]") as HTMLElement | null;
    if (!wrapper) return;
    gsap.to(wrapper, {
      boxShadow: "0 0 0 2px rgba(94,106,210,0.5), 0 0 20px rgba(94,106,210,0.15)",
      borderColor: "rgba(94,106,210,0.6)",
      duration: 0.25,
      ease: "power2.out",
    });
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const wrapper = e.currentTarget.closest("[data-input-wrap]") as HTMLElement | null;
    if (!wrapper) return;
    gsap.to(wrapper, {
      boxShadow: "none",
      borderColor: "rgba(255,255,255,0.08)",
      duration: 0.3,
      ease: "power2.out",
    });
  }, []);

  const handleChange = (id: string, value: string) =>
    setValues((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBarberiaRole && slugConfig && slug && slugStatus === "taken") return;
    if (!isLogin) {
      setPwdTouched(true);
      setConfirmTouched(true);
      if (!pwdValid || !confirmOk) return;
    }
    setLoading(true);
    try {
      await onSubmit({
        ...values,
        ...(showRoleSelector ? { role } : {}),
        ...(isBarberiaRole && slugConfig
          ? { barberiaName, slug }
          : { barberiaName: "", slug: "" }),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const frontendUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      await authClient.signIn.social({ provider: "google", callbackURL: `${frontendUrl}/dashboard` });
      onGoogleSignIn?.();
    } finally {
      setGoogleLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-20">
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
          <h1 className="text-2xl font-semibold text-gradient tracking-tight">
            {isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </h1>
          <p className="text-sm text-[#8A8F98]">
            {isLogin
              ? "Accede a tu panel de barberías"
              : "Configura tu barbería en minutos"}
          </p>
        </div>

        {/* Card */}
        <div
          data-anim
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-8 opacity-0"
          style={{
            background: "rgba(255,255,255,0.04)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5E6AD2]/50 to-transparent" />

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-lg border border-white/[0.10] bg-white/[0.04] py-2.5 text-sm font-medium text-[#EDEDEF] transition-all hover:bg-white/[0.08] hover:border-white/[0.18] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#8A8F98]" />
            ) : (
              /* Google "G" SVG */
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {isLogin ? "Continuar con Google" : "Registrarse con Google"}
          </button>

          {/* Divider */}
          <div className="relative mb-5 flex items-center">
            <div className="flex-1 border-t border-white/[0.07]" />
            <span className="mx-3 text-[11px] text-[#8A8F98]/60 uppercase tracking-widest">o continúa con email</span>
            <div className="flex-1 border-t border-white/[0.07]" />
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* ── Role selector (register only) ─────────────────────────── */}
            {showRoleSelector && !isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#8A8F98] tracking-wide">
                  ¿Cómo vas a usar Barber.pe?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {([
                    { value: "barberia", label: "Soy barbería",  Icon: Scissors, desc: "Gestiona citas y clientes" },
                    { value: "cliente",  label: "Soy cliente",    Icon: User,     desc: "Reserva en tu barbería favorita" },
                  ] as const).map(({ value, label, Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-center transition-all duration-150 ${
                        role === value
                          ? "border-[#5E6AD2]/60 bg-[#5E6AD2]/10 shadow-[0_0_0_1px_rgba(94,106,210,0.3)]"
                          : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          role === value ? "bg-[#5E6AD2]/20" : "bg-white/[0.06]"
                        }`}
                      >
                        <Icon className={`h-4 w-4 transition-colors ${ role === value ? "text-[#5E6AD2]" : "text-[#8A8F98]"}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold transition-colors ${ role === value ? "text-[#EDEDEF]" : "text-[#8A8F98]"}`}>{label}</p>
                        <p className="text-[10px] text-[#8A8F98]/60 mt-0.5 leading-tight">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Barbería fields (only when role === barberia) ────────────── */}
            {slugConfig && isBarberiaRole && (
              <>
                {/* Barbería name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#8A8F98] tracking-wide">
                    Nombre de tu barbería
                  </label>
                  <div
                    data-input-wrap
                    className="relative flex items-center overflow-hidden rounded-lg border transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                  >
                    <input
                      type="text"
                      placeholder="Ej: Barbería El Clásico"
                      value={barberiaName}
                      onChange={(e) => handleBarberiaNameChange(e.target.value)}
                      onFocus={handleFocus as React.FocusEventHandler<HTMLInputElement>}
                      onBlur={handleBlur as React.FocusEventHandler<HTMLInputElement>}
                      required
                      className="w-full bg-transparent px-4 py-3 text-sm text-[#EDEDEF] placeholder:text-[#8A8F98]/50 outline-none"
                    />
                  </div>
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#8A8F98] tracking-wide">
                      URL de tu página
                    </label>
                    <span className="text-[11px] text-[#8A8F98]/50">barber.pe/<span className="text-[#8A8F98]">{slug || "tu-barberia"}</span></span>
                  </div>
                  <div
                    data-input-wrap
                    className={`relative flex items-center overflow-hidden rounded-lg border transition-colors ${
                      slugStatus === "taken"     ? "border-red-500/40 !shadow-[0_0_0_2px_rgba(239,68,68,0.2)]" :
                      slugStatus === "available" ? "border-emerald-500/40 !shadow-[0_0_0_2px_rgba(16,185,129,0.2)]" : ""
                    }`}
                    style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                  >
                    <span className="flex items-center pl-3.5 shrink-0 text-[#8A8F98]/50">
                      <AtSign className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="tu-barberia"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      onFocus={handleFocus as React.FocusEventHandler<HTMLInputElement>}
                      onBlur={handleBlur as React.FocusEventHandler<HTMLInputElement>}
                      required
                      className="w-full bg-transparent px-3 py-3 text-sm text-[#EDEDEF] placeholder:text-[#8A8F98]/50 outline-none font-mono"
                    />
                    {/* Validation indicator */}
                    <span className="mr-3 shrink-0">
                      {slugStatus === "checking"  && <Loader2    className="h-4 w-4 animate-spin text-[#8A8F98]" />}
                      {slugStatus === "available" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      {slugStatus === "taken"     && <XCircle     className="h-4 w-4 text-red-400" />}
                    </span>
                  </div>
                  {/* Status message */}
                  {slugStatus === "taken" && (
                    <p className="text-[11px] text-red-400 mt-0.5">Este slug ya está en uso. Elige otro.</p>
                  )}
                  {slugStatus === "available" && (
                    <p className="text-[11px] text-emerald-400 mt-0.5">¡Disponible!</p>
                  )}
                  {slugStatus === "error" && (
                    <p className="text-[11px] text-amber-400 mt-0.5">No se pudo verificar. Inténtalo de nuevo.</p>
                  )}
                </div>
              </>
            )}

            {fields.map((field) => {
              const isPassword = field.type === "password";
              const inputType  = isPassword && showPwd ? "text" : field.type;

              return (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <label
                    htmlFor={field.id}
                    className="text-xs font-medium text-[#8A8F98] tracking-wide"
                  >
                    {field.label}
                  </label>
                  <div
                    data-input-wrap
                    className="relative flex items-center overflow-hidden rounded-lg border transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                  >
                    <input
                      id={field.id}
                      type={inputType}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      value={values[field.id] ?? ""}
                      onChange={(e) => {
                        handleChange(field.id, e.target.value);
                        if (isPassword) setPwdTouched(true);
                      }}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      required
                      className="w-full bg-transparent px-4 py-3 text-sm text-[#EDEDEF] placeholder:text-[#8A8F98]/50 outline-none"
                    />
                    {isPassword && (
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="mr-3 text-[#8A8F98] hover:text-[#EDEDEF] transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>

                  {/* Password strength — register only */}
                  {isPassword && !isLogin && pwdTouched && pwdValue.length > 0 && (
                    <div className="mt-1 space-y-2">
                      {/* Strength bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex flex-1 gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{
                                background: i <= strength ? strengthColor : "rgba(255,255,255,0.08)",
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: strength > 0 ? strengthColor : "transparent" }}>
                          {strengthLabel}
                        </span>
                      </div>
                      {/* Rules checklist */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                        {PWD_RULES.map((rule, idx) => (
                          <div key={rule.id} className="flex items-center gap-1.5">
                            {rulesOk[idx] ? (
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                            ) : (
                              <XCircle className="h-3 w-3 shrink-0 text-[#8A8F98]/40" />
                            )}
                            <span className={`text-[11px] ${rulesOk[idx] ? "text-emerald-400" : "text-[#8A8F98]/60"}`}>
                              {rule.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Confirm password — register only */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#8A8F98] tracking-wide">
                  Confirmar contraseña
                </label>
                <div
                  data-input-wrap
                  className={`relative flex items-center overflow-hidden rounded-lg border transition-colors ${
                    confirmTouched && confirmPwd
                      ? confirmOk
                        ? "border-emerald-500/40"
                        : "border-red-500/40"
                      : ""
                  }`}
                  style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                >
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                    value={confirmPwd}
                    onChange={(e) => { setConfirmPwd(e.target.value); setConfirmTouched(true); }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required
                    className="w-full bg-transparent px-4 py-3 text-sm text-[#EDEDEF] placeholder:text-[#8A8F98]/50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="mr-3 text-[#8A8F98] hover:text-[#EDEDEF] transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmTouched && confirmPwd && !confirmOk && (
                  <p className="text-[11px] text-red-400 mt-0.5">
                    {!pwdValid ? "La contraseña no cumple los requisitos." : "Las contraseñas no coinciden."}
                  </p>
                )}
                {confirmTouched && confirmOk && (
                  <p className="text-[11px] text-emerald-400 mt-0.5">Las contraseñas coinciden ✓</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end -mt-2">
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#8A8F98] hover:text-[#5E6AD2] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}

            {serverError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                <span className="mt-px text-xs leading-relaxed text-red-400">{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                (isBarberiaRole && slugConfig !== undefined && slugStatus === "taken") ||
                (!isLogin && pwdTouched && (!pwdValid || (confirmTouched && !confirmOk)))
              }
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#5E6AD2] py-3 text-sm font-medium text-white shadow-[0_0_20px_rgba(94,106,210,0.4)] transition-all duration-200 hover:bg-[#6872D9] hover:shadow-[0_0_32px_rgba(94,106,210,0.55)] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p data-anim className="mt-6 text-center text-sm text-[#8A8F98] opacity-0">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="text-[#5E6AD2] hover:text-[#6872D9] transition-colors font-medium"
          >
            {isLogin ? "Regístrate gratis" : "Inicia sesión"}
          </Link>
        </p>
      </div>
    </div>
  );
}
