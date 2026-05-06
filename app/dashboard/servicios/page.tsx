"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Scissors, Plus, Pencil, Trash2, Clock, DollarSign, Loader2, RefreshCw, ImageIcon, X } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAppSession } from "@/lib/auth-client";
import type { Servicio, CreateServicioPayload, UpdateServicioPayload } from "@/types/api";

const API = process.env.NEXT_PUBLIC_API_URL;

type ImagenForm = { key: string; orden: number };

type FormState = {
  nombre: string;
  precio: string;
  duracionMinutos: string;
  imagenes: ImagenForm[];
};

const EMPTY_FORM: FormState = { nombre: "", precio: "", duracionMinutos: "", imagenes: [] };

export default function ServiciosPage() {
  const { data: session } = useAppSession();
  const barberiaId = session?.user.barberiaId;

  const [services,   setServices]  = useState<Servicio[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [showForm,   setShowForm]  = useState(false);
  const [editing,    setEditing]   = useState<Servicio | null>(null);
  const [form,       setForm]      = useState<FormState>(EMPTY_FORM);
  const [saving,     setSaving]    = useState(false);
  const [saveError,  setSaveError] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchServices = useCallback(async () => {
    if (!barberiaId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/barberias/${barberiaId}/servicios`, { credentials: "include" });
      if (res.ok) setServices(await res.json());
    } finally {
      setLoading(false);
    }
  }, [barberiaId]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  useGSAP(
    () => {
      gsap.fromTo("[data-row]",
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.06, delay: 0.1 },
      );
    },
    { scope: pageRef, dependencies: [loading, showForm] },
  );

  // ── Form helpers ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setSaveError(null);
  };

  const openEdit = (s: Servicio) => {
    setEditing(s);
    setForm({
      nombre:           s.nombre,
      precio:           s.precio,
      duracionMinutos:  String(s.duracionMinutos),
      imagenes:         s.imagenes.map((img) => ({ key: img.key, orden: img.orden })),
    });
    setShowForm(true);
    setSaveError(null);
  };

  const addImagen = () =>
    setForm((f) => ({ ...f, imagenes: [...f.imagenes, { key: "", orden: f.imagenes.length }] }));

  const removeImagen = (i: number) =>
    setForm((f) => ({ ...f, imagenes: f.imagenes.filter((_, idx) => idx !== i) }));

  const updateImagen = (i: number, field: keyof ImagenForm, value: string | number) =>
    setForm((f) => ({
      ...f,
      imagenes: f.imagenes.map((img, idx) => idx === i ? { ...img, [field]: value } : img),
    }));

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.nombre.trim() || !barberiaId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const imagenes = form.imagenes.filter((img) => img.key.trim());
      if (editing) {
        const payload: UpdateServicioPayload = {
          nombre:          form.nombre          || undefined,
          precio:          form.precio ? Number(form.precio) : undefined,
          duracionMinutos: form.duracionMinutos ? Number(form.duracionMinutos) : undefined,
          imagenes:        imagenes.length ? imagenes : undefined,
        };
        const res = await fetch(`${API}/barberias/${barberiaId}/servicios/${editing.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al actualizar servicio");
      } else {
        const payload: CreateServicioPayload = {
          nombre:          form.nombre,
          precio:          Number(form.precio),
          duracionMinutos: Number(form.duracionMinutos),
          imagenes:        imagenes.length ? imagenes : undefined,
        };
        const res = await fetch(`${API}/barberias/${barberiaId}/servicios`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al crear servicio");
      }
      await fetchServices();
      setShowForm(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!barberiaId || !confirm("¿Eliminar este servicio?")) return;
    try {
      await fetch(`${API}/barberias/${barberiaId}/servicios/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch { /* silently ignore */ }
  };

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#EDEDEF] tracking-tight flex items-center gap-2.5">
              <Scissors className="h-6 w-6 text-[#5E6AD2]" />
              Servicios
            </h1>
            <p className="mt-1 text-sm text-[#8A8F98]">{services.length} servicio{services.length !== 1 ? "s" : ""} configurado{services.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchServices} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#8A8F98] hover:text-[#EDEDEF] transition-colors disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={openCreate} className="flex items-center gap-1.5 rounded-xl bg-[#5E6AD2] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#6872D9] active:scale-95">
              <Plus className="h-4 w-4" /> Nuevo
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl border border-[#5E6AD2]/30 p-5 space-y-4" style={{ background: "rgba(94,106,210,0.07)" }}>
            <h2 className="text-sm font-semibold text-[#EDEDEF]">{editing ? "Editar servicio" : "Nuevo servicio"}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { key: "nombre",          label: "Nombre",         placeholder: "Corte clásico", type: "text"   },
                { key: "precio",          label: "Precio (S/)",    placeholder: "25",             type: "number" },
                { key: "duracionMinutos", label: "Duración (min)", placeholder: "30",             type: "number" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="mb-1 block text-[11px] text-[#8A8F98] uppercase tracking-wide">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof FormState] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50 focus:ring-1 focus:ring-[#5E6AD2]/30"
                  />
                </div>
              ))}
            </div>

            {/* Imágenes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] text-[#8A8F98] uppercase tracking-wide flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" /> Imágenes (keys del bucket)
                </label>
                <button onClick={addImagen} className="flex items-center gap-1 text-[11px] text-[#5E6AD2] hover:text-[#6872D9]">
                  <Plus className="h-3 w-3" /> Agregar imagen
                </button>
              </div>
              {form.imagenes.length === 0 ? (
                <p className="text-xs text-[#8A8F98]/60 italic">Sin imágenes. El servicio se mostrará sin foto.</p>
              ) : (
                <div className="space-y-2">
                  {form.imagenes.map((img, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[11px] text-[#8A8F98] w-14 shrink-0">Orden {i}</span>
                      <input
                        value={img.key}
                        onChange={(e) => updateImagen(i, "key", e.target.value)}
                        placeholder="servicios/corte-1.webp"
                        className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-xs text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50"
                      />
                      <button onClick={() => removeImagen(i)} className="rounded-lg p-1.5 text-[#8A8F98] hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {saveError && <p className="text-xs text-red-400">{saveError}</p>}

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-[#5E6AD2] px-4 py-2 text-sm font-medium text-white hover:bg-[#6872D9] transition-colors disabled:opacity-60 disabled:pointer-events-none">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editing ? "Guardar" : "Crear"}
              </button>
              <button onClick={() => setShowForm(false)} className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-[#8A8F98] hover:bg-white/[0.05] transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-white/[0.06] px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#8A8F98]/60">
            <span>Nombre</span>
            <span className="w-16 text-right">Imgs</span>
            <span className="w-20 text-right">Precio</span>
            <span className="w-24 text-right">Duración</span>
            <span className="w-16" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#8A8F98]">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : services.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#8A8F98]">No hay servicios. Crea el primero.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {services.map((svc) => (
                <div key={svc.id} data-row className="group grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3.5 opacity-0 hover:bg-white/[0.03] transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#EDEDEF]">{svc.nombre}</p>
                    {svc.imagenes.length > 0 && (
                      <p className="text-[11px] text-[#8A8F98]/60 mt-0.5 truncate">{svc.imagenes[0].key}</p>
                    )}
                  </div>
                  <div className="w-16 flex items-center justify-end gap-1 text-xs text-[#8A8F98]">
                    <ImageIcon className="h-3 w-3" />
                    {svc.imagenes.length}
                  </div>
                  <div className="flex w-20 items-center justify-end gap-1 text-sm text-[#EDEDEF]">
                    <DollarSign className="h-3 w-3 text-[#8A8F98]" />
                    {svc.precio}
                  </div>
                  <div className="flex w-24 items-center justify-end gap-1 text-sm text-[#8A8F98]">
                    <Clock className="h-3 w-3" />
                    {svc.duracionMinutos} min
                  </div>
                  <div className="flex w-16 items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(svc)} className="rounded-lg p-1.5 text-[#8A8F98] hover:bg-white/[0.07] hover:text-[#EDEDEF]">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(svc.id)} className="rounded-lg p-1.5 text-[#8A8F98] hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
