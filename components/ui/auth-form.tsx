"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { authClient } from "@/lib/auth-client";

interface Field {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
}

interface AuthFormProps {
  mode: "login" | "register";
  fields: Field[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  serverError?: string | null;
  /** Called after Google OAuth redirect is initiated */
  onGoogleSignIn?: () => void;
}

/**
 * AuthForm
 * Shared auth card used by Login & Register pages.
 * - Entrance: staggered slide-up
 * - Input focus: glow ring via GSAP
 * - Google One Tap auto-prompt + Google OAuth button
 */
export function AuthForm({ mode, fields, onSubmit, serverError, onGoogleSignIn }: AuthFormProps) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const formRef  = useRef<HTMLFormElement>(null);
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [values,  setValues]        = useState<Record<string, string>>({});

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
    setLoading(true);
    try { await onSubmit(values); } finally { setLoading(false); }
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
            {fields.map((field) => {
              const isPassword = field.type === "password";
              const inputType = isPassword && showPwd ? "text" : field.type;

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
                    style={{
                      borderColor: "rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <input
                      id={field.id}
                      type={inputType}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      value={values[field.id] ?? ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
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
                        {showPwd ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

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
              disabled={loading}
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
