"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Scissors, Plus, Pencil, Trash2, Clock, DollarSign } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";

type Service = { id: number; name: string; price: number; duration: number };

const INITIAL: Service[] = [
  { id: 1, name: "Corte clásico",   price: 25,  duration: 30 },
  { id: 2, name: "Corte + Barba",   price: 40,  duration: 50 },
  { id: 3, name: "Degradado",       price: 30,  duration: 40 },
  { id: 4, name: "Barba",           price: 20,  duration: 20 },
  { id: 5, name: "Cejas",           price: 10,  duration: 15 },
];

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", price: "", duration: "" });
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo("[data-row]",
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.06, delay: 0.1 },
      );
    },
    { scope: pageRef, dependencies: [services] },
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", price: "", duration: "" });
    setShowForm(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ name: s.name, price: String(s.price), duration: String(s.duration) });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? { ...s, name: form.name, price: Number(form.price), duration: Number(form.duration) }
            : s,
        ),
      );
    } else {
      setServices((prev) => [
        ...prev,
        { id: Date.now(), name: form.name, price: Number(form.price), duration: Number(form.duration) },
      ]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
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
            <p className="mt-1 text-sm text-[#8A8F98]">{services.length} servicios configurados</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl bg-[#5E6AD2] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#6872D9] active:scale-95"
          >
            <Plus className="h-4 w-4" /> Nuevo
          </button>
        </div>

        {/* Modal / inline form */}
        {showForm && (
          <div
            className="rounded-2xl border border-[#5E6AD2]/30 p-5 space-y-4"
            style={{ background: "rgba(94,106,210,0.07)" }}
          >
            <h2 className="text-sm font-semibold text-[#EDEDEF]">
              {editing ? "Editar servicio" : "Nuevo servicio"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { key: "name",     label: "Nombre",          placeholder: "Corte clásico", type: "text"   },
                { key: "price",    label: "Precio (S/)",     placeholder: "25",            type: "number" },
                { key: "duration", label: "Duración (min)",  placeholder: "30",            type: "number" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="mb-1 block text-[11px] text-[#8A8F98] uppercase tracking-wide">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[#EDEDEF] placeholder-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/50 focus:ring-1 focus:ring-[#5E6AD2]/30"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="rounded-xl bg-[#5E6AD2] px-4 py-2 text-sm font-medium text-white hover:bg-[#6872D9] transition-colors"
              >
                {editing ? "Guardar" : "Crear"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-[#8A8F98] hover:bg-white/[0.05] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Services list */}
        <div
          className="rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-white/[0.06] px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#8A8F98]/60">
            <span>Nombre</span>
            <span className="w-20 text-right">Precio</span>
            <span className="w-24 text-right">Duración</span>
            <span className="w-16" />
          </div>

          <div className="divide-y divide-white/[0.04]">
            {services.map((svc) => (
              <div
                key={svc.id}
                data-row
                className="group grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 opacity-0 hover:bg-white/[0.03] transition-colors"
              >
                <p className="text-sm font-medium text-[#EDEDEF]">{svc.name}</p>
                <div className="flex w-20 items-center justify-end gap-1 text-sm text-[#EDEDEF]">
                  <DollarSign className="h-3 w-3 text-[#8A8F98]" />
                  {svc.price}
                </div>
                <div className="flex w-24 items-center justify-end gap-1 text-sm text-[#8A8F98]">
                  <Clock className="h-3 w-3" />
                  {svc.duration} min
                </div>
                <div className="flex w-16 items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(svc)}
                    className="rounded-lg p-1.5 text-[#8A8F98] hover:bg-white/[0.07] hover:text-[#EDEDEF]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(svc.id)}
                    className="rounded-lg p-1.5 text-[#8A8F98] hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
