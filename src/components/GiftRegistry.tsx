"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { VenetianMaskSvg } from "./VenetianMaskSvg";
import { supabase } from "@/lib/supabase";
import {
  Gift,
  Search,
  Check,
  Copy,
  Heart,
  QrCode,
  Sparkles,
  DollarSign,
  X,
  Lock,
  MessageSquare,
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

  // Modal State
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [giverName, setGiverName] = useState("");
  const [giverMessage, setGiverMessage] = useState("");
  const [customQuotaAmount, setCustomQuotaAmount] = useState("");
  const [copiedPix, setCopiedPix] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = ["Todos", "Bolsas", "Acessórios", "Maquiagem", "Skin Care", "Unha"];

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

  const handleOpenGiftModal = (gift: GiftItem) => {
    setSelectedGift(gift);
    setGiverName("");
    setGiverMessage("");
    setCustomQuotaAmount(gift.isQuota ? gift.price : "");
    setReservationSuccess(false);
    setCopiedPix(false);
  };

  const handleConfirmReservation = async () => {
    if (!selectedGift || !giverName.trim()) {
      alert("Por favor, preencha o seu nome.");
      return;
    }

    setSubmitting(true);
    try {
      const amountToSend = selectedGift.isQuota
        ? parseFloat(customQuotaAmount || selectedGift.price)
        : parseFloat(selectedGift.price);

      const updates: Record<string, unknown> = {
        is_reserved: true,
        reserved_by_name: giverName,
        reserved_by_message: giverMessage,
        reserved_at: new Date().toISOString(),
      };

      if (selectedGift.isQuota) {
        const currentCollected = parseFloat(selectedGift.quotaCollected || "0");
        updates.quota_collected = (currentCollected + amountToSend).toFixed(2);
      }

      const { error } = await supabase
        .from("gifts")
        .update(updates)
        .eq("id", selectedGift.id);

      if (error) throw error;

      setSubmitting(false);
      setReservationSuccess(true);
      fetchGifts();

      confetti({
        particleCount: 80,
        spread: 60,
        colors: ["#7A1C28", "#D4AF37", "#F3E5AB"],
      });
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
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
            {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedPix ? "Chave Copiada!" : "Copiar Chave PIX"}
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
              const formattedPrice = Number(gift.price).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });

              return (
                <div
                  key={gift.id}
                  className={`marsala-glass rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative group ${
                    gift.isReserved
                      ? "border-rose-900/60 opacity-80"
                      : "border-[#D4AF37]/30 hover:border-[#D4AF37]/80 hover:shadow-xl hover:shadow-[#7A1C28]/30"
                  }`}
                >
                  {/* Category & Badge header */}
                  <div className="relative h-48 w-full overflow-hidden bg-black/40">
                    <img
                      src={gift.imageUrl}
                      alt={gift.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a060b] via-transparent to-black/30"></div>

                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1a060b]/80 backdrop-blur-md border border-[#D4AF37]/40 text-[10px] uppercase font-bold text-amber-300">
                      {gift.category}
                    </span>

                    {gift.isQuota && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#7A1C28] text-amber-100 text-[10px] uppercase font-bold border border-[#D4AF37]">
                        Cota Aberta
                      </span>
                    )}

                    {gift.isReserved && (
                      <div className="absolute inset-0 bg-[#1a060b]/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                        <Lock className="w-8 h-8 text-[#D4AF37] mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                          Presente Escolhido
                        </span>
                        <p className="text-xs text-rose-200 mt-1 italic">
                          Por: {gift.reservedByName || "Convidado Especial"}
                        </p>
                      </div>
                    )}
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

                    <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-rose-300">
                          {gift.isQuota ? "Valor Sugerido da Cota" : "Valor do Presente"}
                        </span>
                        <span className="text-lg font-bold font-serif text-gold-gradient">
                          {formattedPrice}
                        </span>
                      </div>

                      {!gift.isReserved && (
                        <button
                          onClick={() => handleOpenGiftModal(gift)}
                          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-amber-950 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] hover:brightness-110 shadow transition-transform group-hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 fill-amber-950" />
                          Presentear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gift Reservation Modal */}
      {selectedGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#26070e] border-2 border-[#D4AF37] w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedGift(null)}
              className="absolute top-4 right-4 text-rose-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {reservationSuccess ? (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-400 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-gold-gradient">
                    Muito Obrigado pelo Carinho!
                  </h3>
                  <p className="text-xs text-rose-200">
                    Seu presente <strong className="text-amber-200">{selectedGift.title}</strong> foi reservado com sucesso para o aniversário!
                  </p>
                </div>

                {/* PIX instructions for Giver */}
                <div className="p-4 rounded-2xl bg-[#1a060b] border border-[#D4AF37]/40 text-left space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] block">
                    Instruções de Transferência PIX
                  </span>
                  <div className="text-xs text-rose-200 space-y-1">
                    <p>
                      <strong>Chave PIX:</strong> {pixKey}
                    </p>
                    <p>
                      <strong>Nome:</strong> {pixName}
                    </p>
                    <p>
                      <strong>Valor do Mimo:</strong>{" "}
                      {Number(
                        selectedGift.isQuota && customQuotaAmount
                          ? customQuotaAmount
                          : selectedGift.price
                      ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>

                  <button
                    onClick={handleCopyPix}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedPix ? "Chave PIX Copiada!" : "Copiar Chave PIX Agora"}
                  </button>
                </div>

                <button
                  onClick={() => setSelectedGift(null)}
                  className="px-6 py-2.5 bg-[#58111a] hover:bg-[#7A1C28] text-rose-100 text-xs font-bold uppercase rounded-xl border border-[#D4AF37]/40 cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-[#D4AF37]/30 pb-4">
                  <VenetianMaskSvg variant="gold" className="w-10 h-10 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                      Presentear no Baile de Máscaras
                    </span>
                    <h3 className="text-xl font-serif font-bold text-rose-100">
                      {selectedGift.title}
                    </h3>
                  </div>
                </div>

                {/* Quota amount input if quota */}
                {selectedGift.isQuota && (
                  <div className="space-y-2 p-3 rounded-2xl bg-[#1a060b] border border-[#D4AF37]/30">
                    <label className="block text-xs font-medium text-rose-200">
                      Quanto deseja contribuir nesta cota?
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-amber-300 font-bold">
                        R$
                      </span>
                      <input
                        type="number"
                        min="10"
                        step="5"
                        value={customQuotaAmount}
                        onChange={(e) => setCustomQuotaAmount(e.target.value)}
                        className="w-full bg-[#2b0811] border border-[#D4AF37]/40 rounded-xl pl-9 pr-4 py-2 text-sm text-amber-200 font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Form fields */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-rose-200">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Padrinho Ricardo"
                      value={giverName}
                      onChange={(e) => setGiverName(e.target.value)}
                      className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-xs text-rose-100 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-rose-200 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" /> Mensagem com
                      Carinho para a Aniversariante
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Escreva uma mensagem especial que acompanhará seu presente..."
                      value={giverMessage}
                      onChange={(e) => setGiverMessage(e.target.value)}
                      className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-xs text-rose-100 focus:outline-none focus:border-[#D4AF37]"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={handleConfirmReservation}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      "Reservando..."
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-amber-950" />
                        Confirmar Presente & Ver PIX
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
