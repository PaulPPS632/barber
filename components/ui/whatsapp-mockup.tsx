"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CheckCheck } from "lucide-react";

const MESSAGES = [
  { from: "user",  text: "Hola! Quiero un corte + barba para mañana" },
  { from: "luna",  text: "¡Hola! 😊 Con gusto. Tenemos disponible mañana a las 10:00 am o 3:00 pm. ¿Cuál prefieres?" },
  { from: "user",  text: "Las 10am perfecto" },
  { from: "luna",  text: "¡Listo! Cita confirmada para mañana a las 10:00 am. ✅\nCorte + Barba — 50 min — S/ 35\n¿Te envío recordatorio el día anterior?" },
  { from: "user",  text: "Sí por favor 🙌" },
  { from: "luna",  text: "Perfecto, te recordaré mañana a las 9am. ¡Hasta entonces! 💈" },
];

/**
 * WhatsAppMockup
 * Renders an iPhone-style WhatsApp chat.
 * Messages appear one-by-one using a GSAP staggered timeline (fade + slide).
 */
export function WhatsAppMockup() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bubbles = gsap.utils.toArray<HTMLElement>("[data-bubble]", containerRef.current);

      gsap.fromTo(
        bubbles,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "expo.out",
          stagger: 0.45,
          delay: 0.6,
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-[2.5rem] border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]"
      style={{ background: "#0b0b0d" }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-7 pt-3 pb-1">
        <span className="text-[11px] font-semibold text-[#EDEDEF]">9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-4 rounded-full bg-[#EDEDEF]/80" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#EDEDEF]/80" />
          <div className="h-2 w-2 rounded-full bg-[#EDEDEF]/80" />
        </div>
      </div>

      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5E6AD2] text-sm font-bold text-white shadow-[0_0_12px_rgba(94,106,210,0.5)]">
          L
        </div>
        <div>
          <p className="text-sm font-semibold text-[#EDEDEF]">Luna IA 💈</p>
          <p className="text-[11px] text-[#8A8F98]">Barbería Pérez · en línea</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex flex-col gap-2 px-4 py-4 text-[13px] leading-relaxed"
        style={{ minHeight: "340px", background: "rgba(5,5,6,0.6)" }}
      >
        {MESSAGES.map((msg, i) => (
          <div
            key={i}
            data-bubble
            className={`flex opacity-0 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative max-w-[75%] rounded-2xl px-3 py-2 whitespace-pre-line ${
                msg.from === "user"
                  ? "rounded-br-sm bg-[#5E6AD2] text-white"
                  : "rounded-bl-sm bg-[rgba(255,255,255,0.07)] text-[#EDEDEF]"
              }`}
            >
              {msg.text}
              {msg.from === "user" && (
                <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] text-white/60">
                  <CheckCheck className="h-3 w-3 text-[#a5b4fc]" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 border-t border-white/[0.06] px-3 py-3">
        <div className="flex-1 rounded-full bg-white/[0.07] px-4 py-2 text-[12px] text-[#8A8F98]">
          Escribe un mensaje…
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5E6AD2] text-white shadow-[0_0_10px_rgba(94,106,210,0.4)]">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
