"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { VenetianMaskSvg } from "./VenetianMaskSvg";
import { Sparkles, Calendar, MapPin, ChevronDown, Share2, Heart } from "lucide-react";

interface HeroSectionProps {
  personName: string;
  age: number;
  tagline: string;
  eventDate: string;
  venueName: string;
  welcomeMessage: string;
  onOpenRsvp: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  personName,
  age,
  tagline,
  eventDate,
  venueName,
  welcomeMessage,
  onOpenRsvp,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(eventDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  const handleTriggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#7A1C28", "#D4AF37", "#F3E5AB", "#400B12", "#FFFFFF"],
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Baile de Máscaras - 15 Anos da ${personName}`,
          text: `Você está convidado para o Baile de Máscaras da ${personName}! Venha celebrar conosco.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Format display date
  const formattedDate = new Date(eventDate).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section id="inicio" className="relative min-h-[92vh] flex flex-col justify-center items-center px-4 overflow-hidden py-12 bg-marsala-pattern">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#7A1C28]/40 via-[#d4af37]/15 to-transparent rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating decorative star particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Sparkles className="absolute top-12 left-[15%] w-6 h-6 text-amber-300/40 animate-star-twinkle" />
        <Sparkles className="absolute top-[25%] right-[12%] w-8 h-8 text-rose-300/30 animate-star-twinkle delay-1000" />
        <Sparkles className="absolute bottom-[20%] left-[10%] w-5 h-5 text-amber-200/50 animate-star-twinkle delay-500" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center space-y-8 z-10">
        {/* Top Emblem */}
        <div className="inline-flex flex-col items-center gap-2 animate-float-slow">
          <div className="p-3 rounded-full bg-gradient-to-b from-[#7A1C28]/80 to-[#2b0811] border border-[#D4AF37]/50 shadow-2xl shadow-[#7A1C28]/50">
            <VenetianMaskSvg variant="gold" className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]"></span>
            <span>Convenção de Mascarados</span>
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]"></span>
          </div>
        </div>

        {/* Main Headings */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-serif text-gold-gradient drop-shadow-md">
            {personName}
          </h1>
          <p className="text-xl sm:text-2xl font-serif italic text-rose-200/90 font-light tracking-wide">
            {tagline}
          </p>
        </div>

        {/* Welcome Text */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-rose-100/80 leading-relaxed font-sans px-4 py-3 rounded-2xl bg-[#3c0b17]/40 border border-[#D4AF37]/20 backdrop-blur-sm">
          {welcomeMessage}
        </p>

        {/* Party Quick Specs */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-amber-200/90 font-medium">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#58111a]/60 border border-[#D4AF37]/30">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#58111a]/60 border border-[#D4AF37]/30">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>{venueName}</span>
          </div>
        </div>

        {/* Live Countdown Timer Card */}
        <div className="pt-2">
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-[#D4AF37]/40 via-[#7A1C28] to-[#D4AF37]/40 shadow-2xl">
            <div className="bg-[#1a060b]/90 rounded-xl px-4 sm:px-8 py-5 backdrop-blur-md">
              <span className="block text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3 font-semibold">
                Contagem Regressiva para o Gran Baile
              </span>

              <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-4xl font-black text-gold-gradient font-serif">
                    {timeLeft.days}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-rose-300">
                    Dias
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-4xl font-black text-gold-gradient font-serif">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-rose-300">
                    Horas
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-4xl font-black text-gold-gradient font-serif">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-rose-300">
                    Minutos
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-4xl font-black text-rose-300 font-serif">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-300/80">
                    Segundos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button Group */}
        <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={() => {
              handleTriggerConfetti();
              onOpenRsvp();
            }}
            className="px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 hover:brightness-110 shadow-xl shadow-[#D4AF37]/20 transform hover:-translate-y-1 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-amber-950" />
            Confirmar Presença
          </button>

          <a
            href="#presentes"
            className="px-6 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider text-rose-100 bg-[#58111a]/70 hover:bg-[#7A1C28] border border-[#D4AF37]/50 transition-all cursor-pointer flex items-center gap-2"
          >
            Ver Lista de Presentes
          </a>

          <button
            onClick={handleShare}
            className="p-3.5 rounded-full bg-[#3c0b17]/80 hover:bg-[#58111a] border border-[#D4AF37]/40 text-[#D4AF37] hover:text-amber-200 transition-all cursor-pointer"
            title="Compartilhar Convite"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {copiedLink && (
          <p className="text-xs text-amber-300 font-medium animate-fadeIn">
            ✓ Link do convite copiado para a área de transferência!
          </p>
        )}

        {/* Scroll indicator */}
        <div className="pt-6 flex justify-center">
          <a
            href="#festa"
            className="p-2 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#58111a]/40 transition-colors animate-bounce"
            aria-label="Rolar para detalhes"
          >
            <ChevronDown className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};
