"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const NAV = [
  {
    group: "Principal",
    items: [
      { href: "/dashboard",         icon: LayoutDashboard, label: "Resumen" },
      { href: "/dashboard/citas",   icon: CalendarDays,    label: "Citas" },
      { href: "/dashboard/clientes",icon: Users,           label: "Clientes" },
    ],
  },
  {
    group: "Barbería",
    items: [
      { href: "/dashboard/servicios", icon: Scissors,      label: "Servicios" },
      { href: "/dashboard/chat",      icon: MessageSquare, label: "Chat IA" },
      { href: "/dashboard/micrositio",icon: Store,         label: "Micrositio" },
    ],
  },
  {
    group: "Cuenta",
    items: [
      { href: "/dashboard/configuracion", icon: Settings,  label: "Configuración" },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  // Entrance slide-in
  useGSAP(
    () => {
      gsap.fromTo(sidebarRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "expo.out", delay: 0.05 },
      );
    },
    { scope: sidebarRef },
  );

  // Collapse / expand
  const toggle = () => {
    const next = !collapsed;
    gsap.to(sidebarRef.current, {
      width: next ? 72 : 240,
      duration: 0.35,
      ease: "expo.inOut",
    });
    setCollapsed(next);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div
      ref={sidebarRef}
      className="relative flex h-screen w-[240px] shrink-0 flex-col overflow-hidden border-r border-white/[0.06]"
      style={{ background: "rgba(10,10,12,0.95)" }}
    >
      {/* ── Logo ── */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5E6AD2] text-sm font-bold text-white shadow-[0_0_14px_rgba(94,106,210,0.5)]">
            B
          </div>
          {!collapsed && (
            <span className="truncate font-semibold tracking-tight text-[#EDEDEF]">
              Barber<span className="text-[#5E6AD2]">.pe</span>
            </span>
          )}
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-thin">
        {NAV.map(({ group, items }) => (
          <div key={group} className="flex flex-col gap-1">
            {!collapsed && (
              <p className="mb-1 px-2 font-mono text-[10px] tracking-widest text-[#8A8F98]/50 uppercase select-none">
                {group}
              </p>
            )}
            {items.map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition-all duration-150 ${
                    active
                      ? "bg-[rgba(94,106,210,0.18)] text-[#EDEDEF]"
                      : "text-[#8A8F98] hover:bg-white/[0.05] hover:text-[#EDEDEF]"
                  }`}
                >
                  {/* Active indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#5E6AD2]" />
                  )}
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      active ? "text-[#5E6AD2]" : "text-[#8A8F98] group-hover:text-[#EDEDEF]"
                    }`}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Sign out ── */}
      <div className="border-t border-white/[0.06] px-3 py-3">
        <button
          onClick={handleSignOut}
          className="flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-sm text-[#8A8F98] transition-all duration-150 hover:bg-red-500/10 hover:text-red-400"
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-[72px] flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.10] bg-[#0a0a0c] text-[#8A8F98] shadow-md transition-colors hover:text-[#EDEDEF] z-10"
        aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3" />
          : <ChevronLeft  className="h-3 w-3" />
        }
      </button>
    </div>
  );
}
