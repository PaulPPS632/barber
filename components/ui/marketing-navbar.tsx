"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "Características" },
  { href: "#pricing",  label: "Precios" },
];

/**
 * MarketingNavbar
 * Fixed top bar with blur-glass effect.
 * Fades in on mount via GSAP.
 */
export function MarketingNavbar() {
  const navRef   = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      gsap.fromTo(
        navRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", delay: 0.1 },
      );
    },
    { scope: navRef },
  );

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 opacity-0"
      style={{
        background: "rgba(5,5,6,0.7)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5E6AD2] text-white font-bold text-sm shadow-[0_0_16px_rgba(94,106,210,0.5)]">
            B
          </div>
          <span className="font-semibold text-[#EDEDEF] tracking-tight">
            Barber<span className="text-[#5E6AD2]">.pe</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-[#8A8F98] transition-colors duration-150 hover:text-[#EDEDEF]"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm text-[#8A8F98] transition-colors duration-150 hover:text-[#EDEDEF]"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#5E6AD2] px-4 py-2 text-sm font-medium text-white shadow-[0_0_16px_rgba(94,106,210,0.35)] transition-all duration-200 hover:bg-[#6872D9] hover:shadow-[0_0_24px_rgba(94,106,210,0.5)] active:scale-[0.97]"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-[#8A8F98] md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="border-t border-white/[0.06] px-6 py-4 md:hidden"
          style={{ background: "rgba(5,5,6,0.95)" }}
        >
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="text-sm text-[#8A8F98] hover:text-[#EDEDEF]"
              >
                {label}
              </Link>
            ))}
            <div className="h-px bg-white/[0.06]" />
            <Link href="/login" className="text-sm text-[#8A8F98] hover:text-[#EDEDEF]">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-[#5E6AD2] py-2.5 text-sm font-medium text-white"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
