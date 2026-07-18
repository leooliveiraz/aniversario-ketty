"use client";

import React, { useState } from "react";
import { VenetianMaskSvg } from "./VenetianMaskSvg";
import { Menu, X, Shield, CalendarCheck, Gift, MessageSquare, Image, Sparkles, Clock } from "lucide-react";

interface NavbarProps {
  personName: string;
  age: number;
  onOpenAdmin: () => void;
  onOpenRsvpModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  personName,
  age,
  onOpenAdmin,
  onOpenRsvpModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Início", href: "#inicio", icon: Sparkles },
    { name: "O Baile", href: "#festa", icon: Clock },
    { name: "Confirmar Presença", href: "#confirmacao", icon: CalendarCheck },
    { name: "Lista de Presentes", href: "#presentes", icon: Gift },
    { name: "Mural de Recados", href: "#recados", icon: MessageSquare },
    { name: "Galeria & Traje", href: "#galeria", icon: Image },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1a060b]/90 backdrop-blur-md border-b border-[#D4AF37]/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <a href="#inicio" className="flex items-center gap-3 group">
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#7A1C28] via-[#D4AF37] to-[#400B12] p-[1px] group-hover:scale-105 transition-transform">
            <div className="bg-[#1a060b] rounded-full p-1.5">
              <VenetianMaskSvg variant="gold" className="w-8 h-8" />
            </div>
          </div>
          <div>
            <span className="block font-[#Cinzel] text-xl font-bold tracking-wider text-gold-gradient leading-none">
              {personName}
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-rose-300 font-medium">
              Baile de Máscaras • {age} Anos
            </span>
          </div>
        </a>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold tracking-wider uppercase text-rose-100 hover:text-[#D4AF37] transition-colors relative group py-1"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#7A1C28] group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onOpenRsvpModal}
            className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-amber-950 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] hover:brightness-110 rounded-full shadow-lg shadow-[#D4AF37]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            Confirmar Presença
          </button>

          <button
            onClick={onOpenAdmin}
            title="Painel de Controle da Família"
            className="p-2 text-rose-300 hover:text-amber-300 bg-[#3c0b17]/60 hover:bg-[#58111a] border border-[#D4AF37]/30 rounded-full transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onOpenAdmin}
            className="p-2 text-rose-300 hover:text-amber-300 bg-[#3c0b17]/60 border border-[#D4AF37]/30 rounded-full cursor-pointer"
            title="Painel Admin"
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#D4AF37] hover:text-amber-200 cursor-pointer focus:outline-none"
            aria-label="Alternar menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#26070e]/95 border-b border-[#D4AF37]/40 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-1 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-100 hover:bg-[#7A1C28]/40 hover:text-[#D4AF37] transition-all"
                >
                  <Icon className="w-4 h-4 text-[#D4AF37]" />
                  {link.name}
                </a>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#D4AF37]/20 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRsvpModal();
              }}
              className="w-full py-2.5 text-xs font-bold tracking-wider uppercase text-amber-950 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              Confirmar Presença Agora
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
