import { AnimatedBackground } from "@/components/ui/animated-background";
import { MarketingNavbar } from "@/components/ui/marketing-navbar";
import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050506]">
      <AnimatedBackground />
      <MarketingNavbar />

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5E6AD2] text-white font-bold text-xs">
              B
            </div>
            <span className="text-sm font-semibold text-[#EDEDEF]">
              Barber<span className="text-[#5E6AD2]">.pe</span>
            </span>
          </Link>
          <p className="text-xs text-[#8A8F98]">
            © {new Date().getFullYear()} Barber.pe — Todos los derechos reservados
          </p>
          <div className="flex gap-5 text-xs text-[#8A8F98]">
            <Link href="#" className="hover:text-[#EDEDEF] transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-[#EDEDEF] transition-colors">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
