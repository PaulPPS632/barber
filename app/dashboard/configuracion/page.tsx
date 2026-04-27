"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Settings, Save, Eye, EyeOff, ChevronDown } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { authClient } from "@/lib/auth-client";

const TIMEZONES = [
  "America/Lima",
  "America/Bogota",
  "America/Santiago",
  "America/Mexico_City",
  "America/Buenos_Aires",
];

export default function ConfiguracionPage() {
  const { data: session } = authClient.useSession();
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    nombre: "Barbería El Clásico",
    slug: "el-clasico",
    timezone: "America/Lima",
    aiSystemPrompt: "Eres el asistente de reservas de Barbería El Clásico. Responde en español de manera amigable y concisa.",
    metaPhoneId: "",
    metaToken: "",
    whatsappNumber: "+51 999 123 456",
  });

  useGSAP(
    () => {
      gsap.fromTo("[data-section]",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.08, delay: 0.1 },
      );
    },
    { scope: pageRef },
  );

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[#EDEDEF] tracking-tight flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-[#5E6AD2]" />
            Configuración
          </h1>
          <p className="mt-1 text-sm text-[#8A8F98]">Gestiona los datos de tu barbería y credenciales.</p>
        </div>

        {/* Section: Barbería */}
        <div
          data-section
          className="rounded-2xl border border-white/[0.06] p-6 space-y-5 opacity-0"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <h2 className="text-sm font-semibold text-[#EDEDEF] border-b border-white/[0.06] pb-3">
            Información de la barbería
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nombre" value={form.nombre} onChange={update("nombre")} placeholder="Ej: Barbería El Clásico" />
            <FormField label="Slug (URL)" value={form.slug} onChange={update("slug")} placeholder="el-clasico" prefix="barber.pe/" />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#8A8F98]">
              Zona horaria
            </label>
            <div className="relative">
              <select
                value={form.timezone}
                onChange={update("timezone")}
                className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#EDEDEF] outline-none focus:border-[#5E6AD2]/50"
              >
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8F98]" />
            </div>
          </div>

          <FormField label="Número de WhatsApp" value={form.whatsappNumber} onChange={update("whatsappNumber")} placeholder="+51 999 000 000" />
        </div>

        {/* Section: IA */}
        <div
          data-section
          className="rounded-2xl border border-white/[0.06] p-6 space-y-5 opacity-0"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <h2 className="text-sm font-semibold text-[#EDEDEF] border-b border-white/[0.06] pb-3">
            Configuración de IA
          </h2>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#8A8F98]">
              System Prompt
            </label>
            <textarea
              value={form.aiSystemPrompt}
              onChange={update("aiSystemPrompt")}
              rows={4}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50 focus:ring-1 focus:ring-[#5E6AD2]/20"
              placeholder="Describe cómo debe comportarse tu asistente IA..."
            />
            <p className="mt-1.5 text-[11px] text-[#8A8F98]/60">
              Este prompt define la personalidad y reglas de tu asistente de WhatsApp.
            </p>
          </div>
        </div>

        {/* Section: Meta / WhatsApp Cloud API */}
        <div
          data-section
          className="rounded-2xl border border-white/[0.06] p-6 space-y-5 opacity-0"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="text-sm font-semibold text-[#EDEDEF]">Meta / WhatsApp Cloud API</h2>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] text-amber-400 font-medium">
              Avanzado
            </span>
          </div>

          <FormField label="Meta Phone ID" value={form.metaPhoneId} onChange={update("metaPhoneId")} placeholder="1234567890" />

          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#8A8F98]">
              Token de acceso
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={form.metaToken}
                onChange={update("metaToken")}
                placeholder="EAAxxxxx..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 pr-10 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8F98] hover:text-[#EDEDEF] transition-colors"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between pb-4">
          <p className="text-xs text-[#8A8F98]">
            Sesión activa: <span className="text-[#EDEDEF]">{session?.user?.email}</span>
          </p>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all active:scale-95 ${
              saved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-[#5E6AD2] text-white hover:bg-[#6872D9]"
            }`}
          >
            <Save className="h-4 w-4" />
            {saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  prefix?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#8A8F98]">{label}</label>
      <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.05] focus-within:border-[#5E6AD2]/50 focus-within:ring-1 focus-within:ring-[#5E6AD2]/20 overflow-hidden">
        {prefix && (
          <span className="shrink-0 border-r border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-xs text-[#8A8F98]">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none"
        />
      </div>
    </div>
  );
}
