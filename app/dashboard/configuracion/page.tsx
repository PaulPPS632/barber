"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Settings,
  Save,
  Eye,
  EyeOff,
  ChevronDown,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  MapPin,
  Building2,
  Phone,
  Globe,
  Link as LinkIcon,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAppSession } from "@/lib/auth-client";
import type { Barberia, PlataformaRed, UpdateBarberiaPayload } from "@/types/api";

const TIMEZONES = [
  "America/Lima",
  "America/Bogota",
  "America/Santiago",
  "America/Mexico_City",
  "America/Buenos_Aires",
];

const PLATAFORMAS: { value: PlataformaRed; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook",  label: "Facebook"  },
  { value: "tiktok",    label: "TikTok"    },
  { value: "youtube",   label: "YouTube"   },
  { value: "twitter",   label: "Twitter/X" },
  { value: "whatsapp",  label: "WhatsApp"  },
  { value: "web",       label: "Web"       },
];

function PlatformIcon({ plataforma }: { plataforma: PlataformaRed }) {
  const cls = "h-4 w-4 shrink-0 text-[#8A8F98]";
  if (plataforma === "web") return <Globe className={cls} />;
  return <LinkIcon className={cls} />;
}

export default function ConfiguracionPage() {
  const { data: session } = useAppSession();
  const barberiaId = session?.user.barberiaId;

  const [showToken,  setShowToken]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    nombre:         "",
    slug:           "",
    timezone:       "America/Lima",
    aiSystemPrompt: "",
    metaPhoneId:    "",
    metaToken:      "",
    ruc:            "",
    razonSocial:    "",
    telefono:       "",
    direccion:      "",
    latitud:        "",
    longitud:       "",
    logoKey:        "",
  });

  const [redesSociales, setRedesSociales] = useState<{ plataforma: PlataformaRed; url: string }[]>([]);

  const fetchBarberia = useCallback(async () => {
    if (!barberiaId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/barberias/${barberiaId}`,
        { credentials: "include" },
      );
      if (!res.ok) return;
      const data: Barberia = await res.json();
      setForm({
        nombre:         data.nombre         ?? "",
        slug:           data.slug           ?? "",
        timezone:       data.timezone       ?? "America/Lima",
        aiSystemPrompt: data.aiSystemPrompt ?? "",
        metaPhoneId:    data.metaPhoneId    ?? "",
        metaToken:      "",
        ruc:            data.ruc            ?? "",
        razonSocial:    data.razonSocial    ?? "",
        telefono:       data.telefono       ?? "",
        direccion:      data.direccion      ?? "",
        latitud:        data.latitud != null ? String(data.latitud)  : "",
        longitud:       data.longitud != null ? String(data.longitud) : "",
        logoKey:        data.logoKey        ?? "",
      });
      setRedesSociales(
        data.redesSociales.map((r) => ({ plataforma: r.plataforma, url: r.url }))
      );
    } finally {
      setLoading(false);
    }
  }, [barberiaId]);

  useEffect(() => { fetchBarberia(); }, [fetchBarberia]);

  useGSAP(
    () => {
      gsap.fromTo("[data-section]",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.08, delay: 0.1 },
      );
    },
    { scope: pageRef, dependencies: [loading] },
  );

  const update = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const addRed = () =>
    setRedesSociales((r) => [...r, { plataforma: "instagram", url: "" }]);
  const removeRed = (i: number) =>
    setRedesSociales((r) => r.filter((_, idx) => idx !== i));
  const updateRed = (i: number, field: "plataforma" | "url", value: string) =>
    setRedesSociales((r) =>
      r.map((red, idx) => idx === i ? { ...red, [field]: value } : red)
    );

  const handleSave = async () => {
    if (!barberiaId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload: UpdateBarberiaPayload & { metaAccessToken?: string } = {
        nombre:         form.nombre         || undefined,
        slug:           form.slug           || undefined,
        timezone:       form.timezone       || undefined,
        aiSystemPrompt: form.aiSystemPrompt || undefined,
        metaPhoneId:    form.metaPhoneId    || undefined,
        ruc:            form.ruc            || undefined,
        razonSocial:    form.razonSocial    || undefined,
        telefono:       form.telefono       || undefined,
        direccion:      form.direccion      || undefined,
        latitud:        form.latitud  ? parseFloat(form.latitud)  : undefined,
        longitud:       form.longitud ? parseFloat(form.longitud) : undefined,
        logoKey:        form.logoKey        || undefined,
        redesSociales:  redesSociales.filter((r) => r.url.trim()),
      };
      if (form.metaToken) payload.metaAccessToken = form.metaToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/barberias/${barberiaId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Error al guardar");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#EDEDEF] tracking-tight flex items-center gap-2.5">
              <Settings className="h-6 w-6 text-[#5E6AD2]" />
              Configuración
            </h1>
            <p className="mt-1 text-sm text-[#8A8F98]">Gestiona los datos de tu barbería y credenciales.</p>
          </div>
          <button
            onClick={fetchBarberia}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#8A8F98] hover:text-[#EDEDEF] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-[#8A8F98]">
            <Loader2 className="h-5 w-5 animate-spin" /> Cargando configuración…
          </div>
        ) : (
          <>
            {/* Información básica */}
            <div data-section className="rounded-2xl border border-white/[0.06] p-6 space-y-5 opacity-0" style={{ background: "rgba(255,255,255,0.04)" }}>
              <h2 className="text-sm font-semibold text-[#EDEDEF] border-b border-white/[0.06] pb-3">Información de la barbería</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nombre" value={form.nombre} onChange={update("nombre")} placeholder="Ej: Barbería El Clásico" />
                <FormField label="Slug (URL)" value={form.slug} onChange={update("slug")} placeholder="el-clasico" prefix="barber.pe/" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#8A8F98]">Zona horaria</label>
                <div className="relative">
                  <select value={form.timezone} onChange={update("timezone")} className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#EDEDEF] outline-none focus:border-[#5E6AD2]/50">
                    {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8F98]" />
                </div>
              </div>
            </div>

            {/* Datos legales */}
            <div data-section className="rounded-2xl border border-white/[0.06] p-6 space-y-5 opacity-0" style={{ background: "rgba(255,255,255,0.04)" }}>
              <h2 className="text-sm font-semibold text-[#EDEDEF] border-b border-white/[0.06] pb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#5E6AD2]" /> Datos legales
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="RUC" value={form.ruc} onChange={update("ruc")} placeholder="20123456789" />
                <FormField label="Razón social" value={form.razonSocial} onChange={update("razonSocial")} placeholder="Barbería S.A.C." />
              </div>
            </div>

            {/* Contacto y ubicación */}
            <div data-section className="rounded-2xl border border-white/[0.06] p-6 space-y-5 opacity-0" style={{ background: "rgba(255,255,255,0.04)" }}>
              <h2 className="text-sm font-semibold text-[#EDEDEF] border-b border-white/[0.06] pb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#5E6AD2]" /> Contacto y ubicación
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Teléfono" value={form.telefono} onChange={update("telefono")} placeholder="+51987654321" />
                <FormField label="Logo Key (bucket)" value={form.logoKey} onChange={update("logoKey")} placeholder="barberias/logo.webp" />
              </div>
              <FormField label="Dirección" value={form.direccion} onChange={update("direccion")} placeholder="Av. Larco 123, Miraflores" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Latitud" value={form.latitud} onChange={update("latitud")} placeholder="-12.1191479" type="number" />
                <FormField label="Longitud" value={form.longitud} onChange={update("longitud")} placeholder="-77.0301895" type="number" />
              </div>
              {form.latitud && form.longitud && (
                <a href={`https://www.google.com/maps?q=${form.latitud},${form.longitud}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#5E6AD2] hover:underline">
                  <MapPin className="h-3.5 w-3.5" /> Ver en Google Maps
                </a>
              )}
            </div>

            {/* Redes sociales */}
            <div data-section className="rounded-2xl border border-white/[0.06] p-6 space-y-5 opacity-0" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h2 className="text-sm font-semibold text-[#EDEDEF] flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#5E6AD2]" /> Redes sociales
                </h2>
                <button onClick={addRed} className="flex items-center gap-1 rounded-lg bg-white/[0.05] border border-white/[0.08] px-2.5 py-1.5 text-xs text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.08] transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Agregar
                </button>
              </div>
              {redesSociales.length === 0 ? (
                <p className="text-xs text-[#8A8F98] text-center py-4">Sin redes sociales configuradas.</p>
              ) : (
                <div className="space-y-3">
                  {redesSociales.map((red, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <PlatformIcon plataforma={red.plataforma} />
                      <div className="relative">
                        <select value={red.plataforma} onChange={(e) => updateRed(i, "plataforma", e.target.value)} className="appearance-none rounded-xl border border-white/[0.08] bg-white/[0.05] pl-3 pr-7 py-2 text-xs text-[#EDEDEF] outline-none focus:border-[#5E6AD2]/50">
                          {PLATAFORMAS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8A8F98]" />
                      </div>
                      <input type="url" value={red.url} onChange={(e) => updateRed(i, "url", e.target.value)} placeholder="https://..." className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
                      <button onClick={() => removeRed(i)} className="rounded-lg p-1.5 text-[#8A8F98] hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-[#8A8F98]/60">Al guardar, las redes sociales se reemplazan por completo.</p>
            </div>

            {/* IA */}
            <div data-section className="rounded-2xl border border-white/[0.06] p-6 space-y-5 opacity-0" style={{ background: "rgba(255,255,255,0.04)" }}>
              <h2 className="text-sm font-semibold text-[#EDEDEF] border-b border-white/[0.06] pb-3">Configuración de IA</h2>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#8A8F98]">System Prompt</label>
                <textarea value={form.aiSystemPrompt} onChange={update("aiSystemPrompt")} rows={4} className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50 focus:ring-1 focus:ring-[#5E6AD2]/20" placeholder="Describe cómo debe comportarse tu asistente IA..." />
                <p className="mt-1.5 text-[11px] text-[#8A8F98]/60">Define la personalidad y reglas de tu asistente de WhatsApp.</p>
              </div>
            </div>

            {/* Meta API */}
            <div data-section className="rounded-2xl border border-white/[0.06] p-6 space-y-5 opacity-0" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h2 className="text-sm font-semibold text-[#EDEDEF]">Meta / WhatsApp Cloud API</h2>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] text-amber-400 font-medium">Avanzado</span>
              </div>
              <FormField label="Meta Phone ID" value={form.metaPhoneId} onChange={update("metaPhoneId")} placeholder="1234567890" />
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#8A8F98]">Token de acceso</label>
                <div className="relative">
                  <input type={showToken ? "text" : "password"} value={form.metaToken} onChange={update("metaToken")} placeholder="Dejar vacío para no actualizar" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 pr-10 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
                  <button type="button" onClick={() => setShowToken((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8F98] hover:text-[#EDEDEF] transition-colors">
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-between pb-4">
              <div>
                <p className="text-xs text-[#8A8F98]">Sesión: <span className="text-[#EDEDEF]">{session?.user?.email}</span></p>
                {saveError && <p className="mt-1 text-xs text-red-400">{saveError}</p>}
              </div>
              <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none ${saved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[#5E6AD2] text-white hover:bg-[#6872D9]"}`}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function FormField({ label, value, onChange, placeholder, prefix, type = "text" }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; prefix?: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#8A8F98]">{label}</label>
      <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.05] focus-within:border-[#5E6AD2]/50 focus-within:ring-1 focus-within:ring-[#5E6AD2]/20 overflow-hidden">
        {prefix && <span className="shrink-0 border-r border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-xs text-[#8A8F98]">{prefix}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none" />
      </div>
    </div>
  );
}
