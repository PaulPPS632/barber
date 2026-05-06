"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Globe, Copy, Check, ExternalLink, Loader2, RefreshCw, Save,
  Plus, Trash2, Image as ImageIcon, Video, HelpCircle, Star, ToggleLeft, ToggleRight, Pencil,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAppSession } from "@/lib/auth-client";
import type {
  Micrositio, UpdateMicrositioPayload, PlantillaMicrositio,
  MicrositioPortada, MicrositioPublicacion, MicrositioGaleria, MicrositioFAQ, MicrositioTestimonio,
  TipoPortada, TipoPublicacion,
} from "@/types/api";

const API = process.env.NEXT_PUBLIC_API_URL;

const PLANTILLAS: { value: PlantillaMicrositio; label: string; primary: string }[] = [
  { value: "CLASICO", label: "Clásico",  primary: "#B45309" },
  { value: "MODERNO", label: "Moderno",  primary: "#5E6AD2" },
  { value: "MINIMAL", label: "Minimal",  primary: "#1A1A2E" },
];

function detectTipo(url: string): TipoPublicacion {
  if (url.includes("tiktok.com")) return "TIKTOK";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YOUTUBE";
  return "YOUTUBE";
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="border-b border-white/[0.06] px-5 py-3.5 flex items-center gap-2">
        <span className="text-[#5E6AD2]">{icon}</span>
        <h2 className="text-sm font-semibold text-[#EDEDEF]">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export default function MicrositioPage() {
  const { data: session } = useAppSession();
  const barberiaId = session?.user.barberiaId;

  const [ms,       setMs]      = useState<Micrositio | null>(null);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);
  const [saved,    setSaved]   = useState(false);
  const [copied,   setCopied]  = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<UpdateMicrositioPayload>({});

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchMs = useCallback(async () => {
    if (!barberiaId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/barberias/${barberiaId}/micrositio`, { credentials: "include" });
      if (res.ok) {
        const data: Micrositio = await res.json();
        setMs(data);
        setConfig({
          plantilla:       data.plantilla,
          publicado:       data.publicado,
          seoTitle:        data.seoTitle        ?? "",
          seoDescription:  data.seoDescription  ?? "",
          colorPrimario:   data.colorPrimario   ?? "#5E6AD2",
          colorSecundario: data.colorSecundario ?? "#EDEDEF",
          fuente:          data.fuente          ?? "Inter",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [barberiaId]);

  useEffect(() => { fetchMs(); }, [fetchMs]);

  useGSAP(
    () => {
      gsap.fromTo("[data-card]",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.07, delay: 0.1 },
      );
    },
    { scope: pageRef, dependencies: [loading] },
  );

  // ── Save config ───────────────────────────────────────────────────────────

  const handleSaveConfig = async () => {
    if (!barberiaId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/barberias/${barberiaId}/micrositio`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const updated = await res.json();
        setMs(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  const slug = ms ? String(barberiaId) : "";
  const link = `${API}/barberias/${slug}/micrositio/public`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center gap-2 py-32 text-sm text-[#8A8F98]">
          <Loader2 className="h-5 w-5 animate-spin" /> Cargando micrositio…
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#EDEDEF] tracking-tight flex items-center gap-2.5">
              <Globe className="h-6 w-6 text-[#5E6AD2]" /> Micrositio
            </h1>
            <p className="mt-1 text-sm text-[#8A8F98]">Tu página pública de reservas.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchMs} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#8A8F98] hover:text-[#EDEDEF] transition-colors disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Link card */}
        <div data-card className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-5 py-4 opacity-0" style={{ background: "rgba(255,255,255,0.04)" }}>
          <Globe className="h-5 w-5 text-[#5E6AD2] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8A8F98] mb-0.5">Link público</p>
            <p className="truncate text-sm font-medium text-[#EDEDEF]">{link}</p>
          </div>
          <div className="flex gap-2 shrink-0 items-center">
            {/* Publicado toggle */}
            <button
              onClick={() => setConfig((c) => ({ ...c, publicado: !c.publicado }))}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${config.publicado ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-white/[0.08] bg-white/[0.05] text-[#8A8F98]"}`}
            >
              {config.publicado ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {config.publicado ? "Publicado" : "Borrador"}
            </button>
            <button onClick={handleCopy} className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${copied ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.06] text-[#8A8F98] hover:bg-white/[0.10] hover:text-[#EDEDEF]"}`}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl bg-[#5E6AD2] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#6872D9] transition-colors">
              <ExternalLink className="h-3.5 w-3.5" /> Ver
            </a>
          </div>
        </div>

        {/* ── Configuración general ────────────────────────────────────────── */}
        <div data-card className="rounded-2xl border border-white/[0.06] p-6 space-y-5 opacity-0" style={{ background: "rgba(255,255,255,0.04)" }}>
          <h2 className="text-sm font-semibold text-[#EDEDEF] border-b border-white/[0.06] pb-3">Configuración general</h2>

          {/* Plantilla */}
          <div>
            <label className="mb-2 block text-[11px] text-[#8A8F98] uppercase tracking-wide">Plantilla</label>
            <div className="grid grid-cols-3 gap-3">
              {PLANTILLAS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setConfig((c) => ({ ...c, plantilla: p.value }))}
                  className={`rounded-xl border p-3 text-left transition-all ${config.plantilla === p.value ? "border-[#5E6AD2]/60 bg-[#5E6AD2]/[0.08]" : "border-white/[0.06] bg-white/[0.04] hover:border-white/[0.12]"}`}
                >
                  <div className="h-8 w-full rounded-lg mb-2" style={{ background: p.primary, opacity: 0.6 }} />
                  <p className="text-xs font-medium text-[#EDEDEF]">{p.label}</p>
                  {config.plantilla === p.value && <span className="text-[10px] text-[#5E6AD2]">Activa</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Colores */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#8A8F98] uppercase tracking-wide">Color primario</label>
              <div className="flex items-center gap-2">
                <input type="color" value={config.colorPrimario ?? "#5E6AD2"} onChange={(e) => setConfig((c) => ({ ...c, colorPrimario: e.target.value }))} className="h-9 w-9 rounded-lg border border-white/[0.08] bg-transparent cursor-pointer" />
                <input type="text" value={config.colorPrimario ?? ""} onChange={(e) => setConfig((c) => ({ ...c, colorPrimario: e.target.value }))} className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] outline-none focus:border-[#5E6AD2]/50" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-[#8A8F98] uppercase tracking-wide">Color secundario</label>
              <div className="flex items-center gap-2">
                <input type="color" value={config.colorSecundario ?? "#EDEDEF"} onChange={(e) => setConfig((c) => ({ ...c, colorSecundario: e.target.value }))} className="h-9 w-9 rounded-lg border border-white/[0.08] bg-transparent cursor-pointer" />
                <input type="text" value={config.colorSecundario ?? ""} onChange={(e) => setConfig((c) => ({ ...c, colorSecundario: e.target.value }))} className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] outline-none focus:border-[#5E6AD2]/50" />
              </div>
            </div>
          </div>

          {/* Fuente + SEO */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#8A8F98] uppercase tracking-wide">Fuente (Google Fonts)</label>
              <input type="text" value={config.fuente ?? ""} onChange={(e) => setConfig((c) => ({ ...c, fuente: e.target.value }))} placeholder="Inter" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-[#8A8F98] uppercase tracking-wide">SEO Title</label>
              <input type="text" value={config.seoTitle ?? ""} onChange={(e) => setConfig((c) => ({ ...c, seoTitle: e.target.value }))} placeholder="Barbería Pérez – Miraflores" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] text-[#8A8F98] uppercase tracking-wide">SEO Description</label>
            <textarea value={config.seoDescription ?? ""} onChange={(e) => setConfig((c) => ({ ...c, seoDescription: e.target.value }))} rows={2} placeholder="Especialistas en cortes modernos…" className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
          </div>

          <div className="flex justify-end">
            <button onClick={handleSaveConfig} disabled={saving} className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all active:scale-95 disabled:opacity-60 ${saved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[#5E6AD2] text-white hover:bg-[#6872D9]"}`}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
            </button>
          </div>
        </div>

        {/* ── Portadas ─────────────────────────────────────────────────────── */}
        {ms && barberiaId && <PortadasSection barberiaId={barberiaId} portadas={ms.portadas} onRefresh={fetchMs} />}

        {/* ── Publicaciones ─────────────────────────────────────────────────── */}
        {ms && barberiaId && <PublicacionesSection barberiaId={barberiaId} publicaciones={ms.publicaciones} onRefresh={fetchMs} />}

        {/* ── Galería ───────────────────────────────────────────────────────── */}
        {ms && barberiaId && <GaleriaSection barberiaId={barberiaId} galeria={ms.galeria} onRefresh={fetchMs} />}

        {/* ── FAQs ─────────────────────────────────────────────────────────── */}
        {ms && barberiaId && <FaqsSection barberiaId={barberiaId} faqs={ms.faqs} onRefresh={fetchMs} />}

        {/* ── Testimonios ──────────────────────────────────────────────────── */}
        {ms && barberiaId && <TestimoniosSection barberiaId={barberiaId} testimonios={ms.testimonios} onRefresh={fetchMs} />}
      </div>
    </DashboardShell>
  );
}

// ── Portadas ──────────────────────────────────────────────────────────────────

function PortadasSection({ barberiaId, portadas, onRefresh }: { barberiaId: string | number; portadas: MicrositioPortada[]; onRefresh: () => void }) {
  const [form, setForm] = useState({ key: "", tipo: "HERO" as TipoPortada, altText: "" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.key.trim()) return;
    setSaving(true);
    try {
      await fetch(`${API}/barberias/${barberiaId}/micrositio/portadas`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, orden: portadas.length }),
      });
      setForm({ key: "", tipo: "HERO", altText: "" });
      onRefresh();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API}/barberias/${barberiaId}/micrositio/portadas/${id}`, { method: "DELETE", credentials: "include" });
    onRefresh();
  };

  return (
    <Section title="Portadas" icon={<ImageIcon className="h-4 w-4" />}>
      <div className="grid gap-2 sm:grid-cols-3">
        <input value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} placeholder="portadas/hero.webp" className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50 col-span-1" />
        <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoPortada }))} className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] outline-none focus:border-[#5E6AD2]/50">
          <option value="HERO">HERO</option>
          <option value="BANNER">BANNER</option>
        </select>
        <button onClick={handleAdd} disabled={saving || !form.key.trim()} className="flex items-center justify-center gap-1.5 rounded-xl bg-[#5E6AD2] px-3 py-2 text-sm font-medium text-white hover:bg-[#6872D9] disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Agregar
        </button>
      </div>
      {portadas.length > 0 && (
        <div className="space-y-2">
          {portadas.map((p) => (
            <div key={p.id} className="group flex items-center gap-3 rounded-xl border border-white/[0.06] px-3 py-2.5 hover:bg-white/[0.03]">
              <span className="rounded-full border border-[#5E6AD2]/20 bg-[#5E6AD2]/10 px-2 py-0.5 text-[10px] text-[#5E6AD2]">{p.tipo}</span>
              <p className="flex-1 truncate text-xs text-[#8A8F98]">{p.key}</p>
              <button onClick={() => handleDelete(p.id)} className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-[#8A8F98] hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ── Publicaciones ─────────────────────────────────────────────────────────────

function PublicacionesSection({ barberiaId, publicaciones, onRefresh }: { barberiaId: string | number; publicaciones: MicrositioPublicacion[]; onRefresh: () => void }) {
  const [url,    setUrl]    = useState("");
  const [titulo, setTitulo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!url.trim()) return;
    setSaving(true);
    try {
      const tipo = detectTipo(url);
      await fetch(`${API}/barberias/${barberiaId}/micrositio/publicaciones`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, tipo, titulo: titulo || undefined, orden: publicaciones.length }),
      });
      setUrl(""); setTitulo("");
      onRefresh();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API}/barberias/${barberiaId}/micrositio/publicaciones/${id}`, { method: "DELETE", credentials: "include" });
    onRefresh();
  };

  return (
    <Section title="Publicaciones (TikTok / YouTube)" icon={<Video className="h-4 w-4" />}>
      <div className="grid gap-2 sm:grid-cols-3">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://tiktok.com/... o youtube.com/..." className="sm:col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título (opcional)" className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
      </div>
      <button onClick={handleAdd} disabled={saving || !url.trim()} className="flex items-center gap-1.5 rounded-xl bg-[#5E6AD2] px-4 py-2 text-sm font-medium text-white hover:bg-[#6872D9] disabled:opacity-50">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Agregar
      </button>
      {publicaciones.length > 0 && (
        <div className="space-y-2">
          {publicaciones.map((p) => (
            <div key={p.id} className="group flex items-center gap-3 rounded-xl border border-white/[0.06] px-3 py-2.5 hover:bg-white/[0.03]">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${p.tipo === "TIKTOK" ? "border-pink-500/20 bg-pink-500/10 text-pink-400" : "border-red-500/20 bg-red-500/10 text-red-400"}`}>{p.tipo}</span>
              <div className="flex-1 min-w-0">
                {p.titulo && <p className="truncate text-xs font-medium text-[#EDEDEF]">{p.titulo}</p>}
                <p className="truncate text-xs text-[#8A8F98]">{p.url}</p>
              </div>
              <button onClick={() => handleDelete(p.id)} className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-[#8A8F98] hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ── Galería ───────────────────────────────────────────────────────────────────

function GaleriaSection({ barberiaId, galeria, onRefresh }: { barberiaId: string | number; galeria: MicrositioGaleria[]; onRefresh: () => void }) {
  const [key,    setKey]    = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!key.trim()) return;
    setSaving(true);
    try {
      await fetch(`${API}/barberias/${barberiaId}/micrositio/galeria`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, orden: galeria.length }),
      });
      setKey("");
      onRefresh();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API}/barberias/${barberiaId}/micrositio/galeria/${id}`, { method: "DELETE", credentials: "include" });
    onRefresh();
  };

  return (
    <Section title="Galería de fotos" icon={<ImageIcon className="h-4 w-4" />}>
      <div className="flex gap-2">
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="galeria/foto-1.webp" className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
        <button onClick={handleAdd} disabled={saving || !key.trim()} className="flex items-center gap-1.5 rounded-xl bg-[#5E6AD2] px-4 py-2 text-sm font-medium text-white hover:bg-[#6872D9] disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Agregar
        </button>
      </div>
      {galeria.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {galeria.map((g) => (
            <div key={g.id} className="group relative rounded-xl border border-white/[0.06] px-3 py-2.5 hover:bg-white/[0.03]">
              <p className="truncate text-xs text-[#8A8F98] pr-5">{g.key}</p>
              <button onClick={() => handleDelete(g.id)} className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 rounded-lg p-1 text-[#8A8F98] hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

function FaqsSection({ barberiaId, faqs, onRefresh }: { barberiaId: string | number; faqs: MicrositioFAQ[]; onRefresh: () => void }) {
  const [form, setForm] = useState({ pregunta: "", respuesta: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSave = async () => {
    if (!form.pregunta.trim() || !form.respuesta.trim()) return;
    setSaving(true);
    try {
      if (editingId != null) {
        await fetch(`${API}/barberias/${barberiaId}/micrositio/faqs/${editingId}`, {
          method: "PUT", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setEditingId(null);
      } else {
        await fetch(`${API}/barberias/${barberiaId}/micrositio/faqs`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, orden: faqs.length }),
        });
      }
      setForm({ pregunta: "", respuesta: "" });
      onRefresh();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API}/barberias/${barberiaId}/micrositio/faqs/${id}`, { method: "DELETE", credentials: "include" });
    onRefresh();
  };

  return (
    <Section title="Preguntas frecuentes (FAQs)" icon={<HelpCircle className="h-4 w-4" />}>
      <div className="space-y-2">
        <input value={form.pregunta} onChange={(e) => setForm((f) => ({ ...f, pregunta: e.target.value }))} placeholder="¿Pregunta?" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
        <textarea value={form.respuesta} onChange={(e) => setForm((f) => ({ ...f, respuesta: e.target.value }))} rows={2} placeholder="Respuesta…" className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving || !form.pregunta.trim()} className="flex items-center gap-1.5 rounded-xl bg-[#5E6AD2] px-4 py-2 text-sm font-medium text-white hover:bg-[#6872D9] disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          {editingId != null ? "Guardar" : "Agregar FAQ"}
        </button>
        {editingId != null && <button onClick={() => { setEditingId(null); setForm({ pregunta: "", respuesta: "" }); }} className="rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-[#8A8F98] hover:bg-white/[0.05]">Cancelar</button>}
      </div>
      {faqs.length > 0 && (
        <div className="space-y-2">
          {faqs.map((f) => (
            <div key={f.id} className="group rounded-xl border border-white/[0.06] px-4 py-3 hover:bg-white/[0.03]">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-[#EDEDEF]">{f.pregunta}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => { setEditingId(f.id); setForm({ pregunta: f.pregunta, respuesta: f.respuesta }); }} className="rounded-lg p-1 text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.07]"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(f.id)} className="rounded-lg p-1 text-[#8A8F98] hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <p className="mt-1 text-xs text-[#8A8F98]">{f.respuesta}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ── Testimonios ───────────────────────────────────────────────────────────────

function TestimoniosSection({ barberiaId, testimonios, onRefresh }: { barberiaId: string | number; testimonios: MicrositioTestimonio[]; onRefresh: () => void }) {
  const [form, setForm] = useState({ nombreCliente: "", texto: "", rating: 5 });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.nombreCliente.trim()) return;
    setSaving(true);
    try {
      await fetch(`${API}/barberias/${barberiaId}/micrositio/testimonios`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fecha: new Date().toISOString() }),
      });
      setForm({ nombreCliente: "", texto: "", rating: 5 });
      onRefresh();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API}/barberias/${barberiaId}/micrositio/testimonios/${id}`, { method: "DELETE", credentials: "include" });
    onRefresh();
  };

  return (
    <Section title="Testimonios" icon={<Star className="h-4 w-4" />}>
      <div className="grid gap-2 sm:grid-cols-3">
        <input value={form.nombreCliente} onChange={(e) => setForm((f) => ({ ...f, nombreCliente: e.target.value }))} placeholder="Nombre del cliente" className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
        <textarea value={form.texto} onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))} placeholder="Comentario…" rows={1} className="resize-none rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50" />
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1,2,3,4,5].map((r) => (
              <button key={r} onClick={() => setForm((f) => ({ ...f, rating: r }))} className={`h-7 w-7 text-lg transition-colors ${r <= form.rating ? "text-amber-400" : "text-[#8A8F98]/30"}`}>★</button>
            ))}
          </div>
          <button onClick={handleAdd} disabled={saving || !form.nombreCliente.trim()} className="flex items-center gap-1 rounded-xl bg-[#5E6AD2] px-3 py-2 text-xs font-medium text-white hover:bg-[#6872D9] disabled:opacity-50">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Agregar
          </button>
        </div>
      </div>
      {testimonios.length > 0 && (
        <div className="space-y-2">
          {testimonios.map((t) => (
            <div key={t.id} className="group flex items-start gap-3 rounded-xl border border-white/[0.06] px-4 py-3 hover:bg-white/[0.03]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#EDEDEF]">{t.nombreCliente}</p>
                  <span className="text-amber-400 text-xs">{"★".repeat(t.rating)}</span>
                </div>
                <p className="mt-0.5 text-xs text-[#8A8F98]">{t.texto}</p>
              </div>
              <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-[#8A8F98] hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
