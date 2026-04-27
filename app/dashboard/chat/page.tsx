"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Bot, Trash2, User, ChevronDown } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";

const CONVERSATIONS = [
  { id: 1, client: "Carlos Mendoza",    phone: "+51 999 123 456", messages: 14, lastMsg: "Perfecto, hasta mañana",    date: "Hoy" },
  { id: 2, client: "Diego Ramírez",     phone: "+51 991 456 789", messages: 7,  lastMsg: "¿Tienen disponible el sábado?", date: "Ayer" },
  { id: 3, client: "Andrés Villanueva", phone: "+51 987 321 654", messages: 22, lastMsg: "Gracias, nos vemos!",        date: "Hace 3 días" },
];

type Message = { role: "user" | "ai"; text: string };

const HISTORY: Record<number, Message[]> = {
  1: [
    { role: "user", text: "Hola, ¿tienen disponible mañana a las 10am?" },
    { role: "ai",  text: "¡Hola Carlos! Sí, tenemos disponible mañana martes a las 10:00 am. ¿Te confirmo la cita?" },
    { role: "user", text: "Sí, por favor." },
    { role: "ai",  text: "✅ Cita confirmada para mañana martes a las 10:00 am. Servicio: Corte + Barba. ¡Te esperamos!" },
    { role: "user", text: "Perfecto, hasta mañana" },
  ],
  2: [
    { role: "user", text: "¿Tienen disponible el sábado?" },
    { role: "ai",  text: "Hola Diego! Este sábado tenemos disponibilidad a las 09:00, 11:00 y 15:00. ¿Cuál te conviene?" },
  ],
  3: [
    { role: "user", text: "Buenas, quiero reservar para el viernes" },
    { role: "ai",  text: "Claro Andrés! Tenemos el viernes disponible a las 10:00, 12:00 y 16:00. ¿Cuál prefieres?" },
    { role: "user", text: "A las 12 please" },
    { role: "ai",  text: "✅ Reserva creada para el viernes a las 12:00. Servicio: Degradado. ¡Nos vemos!" },
    { role: "user", text: "Gracias, nos vemos!" },
  ],
};

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo("[data-convo]",
        { x: -12, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "expo.out", stagger: 0.06, delay: 0.1 },
      );
    },
    { scope: pageRef },
  );

  const messages = selectedId ? HISTORY[selectedId] ?? [] : [];
  const selected = CONVERSATIONS.find((c) => c.id === selectedId);

  return (
    <DashboardShell>
      <div ref={pageRef} className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#EDEDEF] tracking-tight flex items-center gap-2.5">
            <Bot className="h-6 w-6 text-[#5E6AD2]" />
            Chat IA
          </h1>
          <p className="mt-1 text-sm text-[#8A8F98]">Historial de conversaciones gestionadas por la IA</p>
        </div>

        <div className="flex gap-4 h-[calc(100vh-13rem)]">
          {/* Sidebar list */}
          <div
            className="w-72 shrink-0 rounded-2xl border border-white/[0.06] overflow-y-auto"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {CONVERSATIONS.map((c) => (
              <button
                key={c.id}
                data-convo
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-4 py-3.5 border-b border-white/[0.04] opacity-0 transition-colors hover:bg-white/[0.04] ${
                  selectedId === c.id ? "bg-[#5E6AD2]/10 border-l-2 border-l-[#5E6AD2]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[#EDEDEF] truncate">{c.client}</p>
                  <span className="text-[11px] text-[#8A8F98]/60 shrink-0">{c.date}</span>
                </div>
                <p className="mt-0.5 text-xs text-[#8A8F98] truncate">{c.lastMsg}</p>
                <p className="mt-1 text-[11px] text-[#8A8F98]/50">{c.messages} mensajes</p>
              </button>
            ))}
          </div>

          {/* Chat view */}
          <div
            className="flex-1 rounded-2xl border border-white/[0.06] flex flex-col overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {selected ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-[#EDEDEF]">{selected.client}</p>
                    <p className="text-xs text-[#8A8F98]">{selected.phone}</p>
                  </div>
                  <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Borrar historial
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "ai" && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5E6AD2]/20 border border-[#5E6AD2]/30 mt-0.5">
                          <Bot className="h-3.5 w-3.5 text-[#5E6AD2]" />
                        </div>
                      )}
                      <div
                        className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#5E6AD2]/20 text-[#EDEDEF] rounded-tr-sm"
                            : "bg-white/[0.06] text-[#EDEDEF] rounded-tl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.role === "user" && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.10] mt-0.5">
                          <User className="h-3.5 w-3.5 text-[#8A8F98]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-[#8A8F98]">Selecciona una conversación</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
