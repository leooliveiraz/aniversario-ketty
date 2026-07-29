"use client";

import React, { useState } from "react";
import { VenetianMaskSvg } from "./VenetianMaskSvg";
import {
  MapPin,
  Clock,
  Shirt,
  Sparkles,
  CalendarPlus,
  Crown,
  CheckCircle2,
} from "lucide-react";

interface EventDetailsProps {
  personName: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  dressCodeTitle: string;
  dressCodeDesc: string;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  personName,
  eventDate,
  venueName,
  venueAddress,
  dressCodeTitle,
  dressCodeDesc,
}) => {
  const [copiedCalendar, setCopiedCalendar] = useState(false);

  // Format date and time
  const dateObj = new Date(eventDate);
  const formattedDate = dateObj.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleAddToCalendar = () => {
    const startDate = new Date(eventDate);
    const endDate = new Date(startDate.getTime() + 6 * 60 * 60 * 1000); // 6 hours party

    const formatCalDate = (d: Date) =>
      d.toISOString().replace(/-|:|\.\d+/g, "");

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `Baile de Máscaras - 15 Anos da ${personName}`
    )}&dates=${formatCalDate(startDate)}/${formatCalDate(
      endDate
    )}&details=${encodeURIComponent(
      `Venha com seu traje mais elegante e máscara! Traje: ${dressCodeTitle}`
    )}&location=${encodeURIComponent(`${venueName}, ${venueAddress}`)}`;

    window.open(googleUrl, "_blank");
    setCopiedCalendar(true);
    setTimeout(() => setCopiedCalendar(false), 3000);
  };

  return (
    <section id="festa" className="py-20 px-4 relative bg-[#1a060b] text-rose-100">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58111a]/80 border border-[#D4AF37]/40 text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Detalhes da Noite Real
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-gold-gradient">
            O Baile de Máscaras
          </h2>
          <p className="text-sm sm:text-base text-rose-200/80">
            Tudo o que você precisa saber para vivenciar uma noite encantadora e inesquecível.
          </p>
        </div>

        {/* 3 Key Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date & Time Card */}
          <div className="marsala-glass marsala-glass-hover p-6 rounded-2xl flex flex-col justify-between border border-[#D4AF37]/30 space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#58111a] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-gold-gradient">Data & Horário</h3>
              <p className="text-sm font-medium text-rose-100 capitalize">{formattedDate}</p>
              <p className="text-xs text-amber-300">Abertura dos portões às {formattedTime}</p>
            </div>

            <button
              onClick={handleAddToCalendar}
              className="mt-4 w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-rose-100 bg-[#58111a] hover:bg-[#7A1C28] border border-[#D4AF37]/40 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4 text-[#D4AF37]" />
              {copiedCalendar ? "Adicionado!" : "Adicionar à Agenda"}
            </button>
          </div>

          {/* Location Card */}
          <div className="marsala-glass marsala-glass-hover p-6 rounded-2xl flex flex-col justify-between border border-[#D4AF37]/30 space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#58111a] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-gold-gradient">Local do Evento</h3>
              <p className="text-sm font-bold text-rose-100">{venueName}</p>
              <p className="text-xs text-rose-200/80 leading-relaxed">{venueAddress}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName}, ${venueAddress}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-rose-100 bg-[#58111a] hover:bg-[#7A1C28] border border-[#D4AF37]/40 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                Google Maps
              </a>
              <a
                href={`https://www.waze.com/ul?q=${encodeURIComponent(`${venueName}, ${venueAddress}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-rose-100 bg-[#58111a] hover:bg-[#7A1C28] border border-[#D4AF37]/40 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                Waze
              </a>
            </div>
          </div>

          {/* Dress Code Card */}
          <div className="marsala-glass marsala-glass-hover p-6 rounded-2xl flex flex-col justify-between border border-[#D4AF37]/30 space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#58111a] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Shirt className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-gold-gradient">Código de Vestimenta</h3>
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {dressCodeTitle}
              </p>
              <p className="text-xs text-rose-200/80 leading-relaxed">{dressCodeDesc}</p>
            </div>

            <div className="pt-2 border-t border-[#D4AF37]/20 text-[11px] text-rose-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dica: Preto, Dourado, Azul Noturno, Rosa & Prata são bem-vindos!</span>
            </div>
          </div>
        </div>

        {/* Marsala Dress Exclusive Announcement Card */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#58111a] via-[#7A1C28] to-[#400B12] border-2 border-[#D4AF37]/60 shadow-2xl overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-20 pointer-events-none">
            <VenetianMaskSvg variant="gold" className="w-64 h-64" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#1a060b] rounded-2xl border border-[#D4AF37] text-[#D4AF37] shrink-0">
                <Crown className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-gold-gradient">
                  Destaque Especial da Noite: A Cor Marsala
                </h3>
                <p className="text-xs sm:text-sm text-rose-100/90 max-w-2xl leading-relaxed">
                  Para tornar o momento da aniversariante ainda mais mágico e exclusivo, pedimos gentilmente aos convidados que reservem o tom <strong className="text-amber-200 underline decoration-amber-400">Marsala exclusivamente para a aniversariante</strong>. Solte sua criatividade e venha radiante nas demais cores e com sua melhor máscara!
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <div className="px-4 py-2.5 rounded-full bg-[#1a060b]/80 border border-[#D4AF37] text-xs font-bold text-amber-300 flex items-center gap-2">
                <VenetianMaskSvg variant="gold" className="w-5 h-5" />
                Traje de Gala + Máscara Obrigatória
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
};
