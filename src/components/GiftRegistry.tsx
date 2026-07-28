"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Gift,
  Search,
  QrCode,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface GiftItem {
  id: number;
  title: string;
  description: string;
  category: string;
  price: string;
  imageUrl: string;
  isQuota: boolean;
  quotaCollected: string;
  isReserved: boolean;
  reservedByName?: string;
  reservedByMessage?: string;
}

interface GiftRegistryProps {
  pixKey: string;
  pixKeyType: string;
  pixName: string;
  pixCity: string;
}

export const GiftRegistry: React.FC<GiftRegistryProps> = ({
  pixKey,
  pixKeyType,
  pixName,
  pixCity,
}) => {
  const [giftsList, setGiftsList] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleCloseLightbox = useCallback(() => setLightboxIndex(null), []);

  const categories = ["Todos", "Bolsas", "Acessórios", "Maquiagem", "Perfumes", "Skin Care", "Unha", "Arte & Hobby"];

  const fetchGifts = async () => {
    try {
      const { data, error } = await supabase.from("gifts").select("*").order("id");
      if (error) throw error;
      if (data) {
        setGiftsList(
          data.map((g) => ({
            id: g.id,
            title: g.title,
            description: g.description || "",
            category: g.category,
            price: g.price,
            imageUrl: g.image_url,
            isQuota: g.is_quota,
            quotaCollected: g.quota_collected || "0.00",
            isReserved: g.is_reserved,
            reservedByName: g.reserved_by_name,
            reservedByMessage: g.reserved_by_message,
          }))
        );
      }
    } catch (err) {
      console.error("Error loading gifts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setTimeout(() => {
      const btn = document.activeElement as HTMLElement | null;
      if (btn) btn.blur();
    }, 3000);
  };

  // Filter gifts
  const filteredGifts = giftsList.filter((gift) => {
    const matchesCategory =
      selectedCategory === "Todos" || gift.category === selectedCategory;
    const matchesSearch =
      gift.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gift.description && gift.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + filteredGifts.length) % filteredGifts.length : null
    );
  }, [filteredGifts.length]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % filteredGifts.length : null
    );
  }, [filteredGifts.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseLightbox();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, handleCloseLightbox, handlePrev, handleNext]);

  return (
    <section id="presentes" className="py-20 px-4 bg-[#1a060b] relative">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58111a]/80 border border-[#D4AF37]/40 text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            <Gift className="w-3.5 h-3.5" /> Lista de Presentes & Cotas
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-gold-gradient">
            Presentes para a Aniversariante
          </h2>
          <p className="text-sm sm:text-base text-rose-200/80">
            Sua presença é o nosso maior presente! Mas caso deseje nos mimar com um carinho,
            escolha um item abaixo ou contribua via PIX com qualquer valor.
          </p>
        </div>

        {/* PIX Quick Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#400B12] via-[#7A1C28] to-[#58111a] border-2 border-[#D4AF37]/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#1a060b] rounded-2xl border border-[#D4AF37] text-[#D4AF37]">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D4AF37]">
                Contribuição Livre via PIX
              </span>
              <h3 className="text-xl font-serif font-bold text-rose-100">
                Chave PIX: <span className="text-amber-200">{pixKey}</span>
              </h3>
              <p className="text-xs text-rose-300">
                Titular: {pixName} • {pixKeyType} ({pixCity})
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyPix}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            Copiar Chave PIX
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#7A1C28] text-amber-200 border border-[#D4AF37] shadow-md"
                    : "bg-[#2b0811] text-rose-300 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar presente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-full pl-9 pr-4 py-2 text-xs text-rose-100 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Gift Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-rose-300 text-sm animate-pulse">
            Carregando lista de presentes em tom Marsala...
          </div>
        ) : filteredGifts.length === 0 ? (
          <div className="text-center py-12 text-rose-300 text-sm">
            Nenhum presente encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGifts.map((gift) => {
              const hasPrice = gift.price && parseFloat(gift.price) > 0;
              const formattedPrice = hasPrice
                ? Number(gift.price).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : null;

              return (
                <div
                  key={gift.id}
                  className="marsala-glass rounded-2xl border border-[#D4AF37]/30 hover:border-[#D4AF37]/80 hover:shadow-xl hover:shadow-[#7A1C28]/30 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
                >
                  {/* Category & Badge header */}
                  <div className="relative h-48 w-full overflow-hidden bg-black/40">
                    {gift.imageUrl ? (
                      <button
                        onClick={() => setLightboxIndex(filteredGifts.indexOf(gift))}
                        className="w-full h-full cursor-pointer"
                      >
                        <img
                          src={gift.imageUrl}
                          alt={gift.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </button>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#400B12] to-[#1a060b]">
                        <Gift className="w-16 h-16 text-[#D4AF37]/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a060b] via-transparent to-black/30 pointer-events-none"></div>

                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1a060b]/80 backdrop-blur-md border border-[#D4AF37]/40 text-[10px] uppercase font-bold text-amber-300 pointer-events-none">
                      {gift.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-serif font-bold text-rose-100 group-hover:text-gold-gradient transition-colors">
                        {gift.title}
                      </h3>
                      <p className="text-xs text-rose-200/70 line-clamp-2 leading-relaxed">
                        {gift.description}
                      </p>
                    </div>

                    {formattedPrice && (
                      <div className="pt-3 border-t border-[#D4AF37]/20">
                        <span className="block text-[10px] uppercase tracking-wider text-rose-300">
                          {gift.isQuota ? "Valor Sugerido da Cota" : "Valor do Presente"}
                        </span>
                        <span className="text-lg font-bold font-serif text-gold-gradient">
                          {formattedPrice}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Carousel */}
      {lightboxIndex !== null && filteredGifts[lightboxIndex]?.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn p-4"
          onClick={handleCloseLightbox}
        >
          <button
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 text-rose-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-200 hover:text-[#D4AF37] p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <div onClick={(e) => e.stopPropagation()} className="max-w-4xl max-h-[90vh] flex flex-col items-center gap-4">
            <img
              src={filteredGifts[lightboxIndex].imageUrl}
              alt={filteredGifts[lightboxIndex].title}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="text-center max-w-lg">
              <h3 className="text-lg font-serif font-bold text-gold-gradient">
                {filteredGifts[lightboxIndex].title}
              </h3>
              <span className="text-xs text-rose-300 uppercase tracking-wider">
                {filteredGifts[lightboxIndex].category}
              </span>
              {filteredGifts[lightboxIndex].description && (
                <p className="text-sm text-rose-200/80 mt-2 leading-relaxed">
                  {filteredGifts[lightboxIndex].description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-200 hover:text-[#D4AF37] p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {filteredGifts.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  i === lightboxIndex ? "bg-[#D4AF37] w-4" : "bg-rose-700 hover:bg-rose-500"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
