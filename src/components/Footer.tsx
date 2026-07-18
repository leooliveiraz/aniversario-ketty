"use client";

import React from "react";
import { VenetianMaskSvg } from "./VenetianMaskSvg";
import { Heart, Sparkles, Shield } from "lucide-react";

interface FooterProps {
  personName: string;
  age: number;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ personName, age, onOpenAdmin }) => {
  return (
    <footer className="bg-[#100306] border-t border-[#D4AF37]/30 text-rose-200/80 py-12 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <VenetianMaskSvg variant="gold" className="w-10 h-10 shrink-0" />
            <div>
              <span className="block font-serif text-xl font-bold text-gold-gradient tracking-wide">
                Baile de Máscaras da {personName}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-rose-300">
                Celebração Inesquecível dos {age} Anos • Marsala & Ouro
              </span>
            </div>
          </div>

          {/* Family Note */}
          <p className="text-xs text-rose-200/70 max-w-md leading-relaxed italic font-serif">
            &ldquo;A contagem regressiva começou! Mal podemos esperar para compartilhar esta noite de magia, mistério e celebração ao seu lado.&rdquo;
          </p>

          {/* Admin link */}
          <button
            onClick={onOpenAdmin}
            className="px-4 py-2 rounded-full bg-[#3c0b17]/60 hover:bg-[#58111a] border border-[#D4AF37]/30 text-xs text-[#D4AF37] hover:text-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" /> Painel da Família
          </button>
        </div>

        <div className="pt-6 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-rose-300/60 gap-3">
          <div className="flex items-center gap-1">
            <span>Feito com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>para o Baile de 15 Anos da {personName}</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#inicio" className="hover:text-[#D4AF37] transition-colors">
              Início
            </a>
            <a href="#festa" className="hover:text-[#D4AF37] transition-colors">
              O Baile
            </a>
            <a href="#confirmacao" className="hover:text-[#D4AF37] transition-colors">
              Confirmar Presença
            </a>
            <a href="#presentes" className="hover:text-[#D4AF37] transition-colors">
              Lista de Presentes
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
