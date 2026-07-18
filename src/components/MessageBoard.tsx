"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { VenetianMaskSvg } from "./VenetianMaskSvg";
import { MessageSquare, Heart, Send, Sparkles, Plus, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface MessageItem {
  id: number;
  senderName: string;
  relationship: string;
  message: string;
  maskStyle: "gold" | "marsala" | "silver" | "velvet";
  likes: number;
  createdAt: string;
}

export const MessageBoard: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem("liked_messages");
      return new Set<number>(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set<number>();
    }
  });

  const saveLikedIds = (ids: Set<number>) => {
    setLikedIds(ids);
    localStorage.setItem("liked_messages", JSON.stringify([...ids]));
  };

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [relationship, setRelationship] = useState("Amigo(a)");
  const [maskStyle, setMaskStyle] = useState<"gold" | "marsala" | "silver" | "velvet">("gold");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const relationships = ["Amigo(a)", "Família", "Padrinho/Madrinha", "Colega de Escola", "Outro"];

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("guest_messages")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setMessages(
          data.map((msg) => ({
            id: msg.id,
            senderName: msg.sender_name,
            relationship: msg.relationship,
            message: msg.message,
            maskStyle: msg.mask_style,
            likes: msg.likes,
            createdAt: msg.created_at,
          }))
        );
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleLike = async (id: number) => {
    if (likedIds.has(id)) return;

    try {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, likes: msg.likes + 1 } : msg))
      );
      saveLikedIds(new Set(likedIds).add(id));

      const current = messages.find((m) => m.id === id);
      if (current) {
        await supabase
          .from("guest_messages")
          .update({ likes: current.likes + 1 })
          .eq("id", id);
      }
    } catch (err) {
      console.error("Error liking message:", err);
    }
  };

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) {
      alert("Por favor, preencha seu nome e a mensagem.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("guest_messages").insert({
        sender_name: senderName,
        relationship,
        message,
        mask_style: maskStyle,
        is_approved: true,
      });

      if (error) throw error;

      setSenderName("");
      setMessage("");
      setModalOpen(false);
      fetchMessages();

      confetti({
        particleCount: 70,
        spread: 60,
        colors: ["#7A1C28", "#D4AF37", "#F3E5AB"],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="recados" className="py-20 px-4 bg-marsala-pattern relative">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58111a]/80 border border-[#D4AF37]/40 text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            <MessageSquare className="w-3.5 h-3.5" /> Mural de Homenagens
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-gold-gradient">
            Recados de Carinho
          </h2>
          <p className="text-sm sm:text-base text-rose-200/80">
            Deixe sua mensagem especial para a aniversariante guardar no coração para sempre.
          </p>

          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 font-bold text-xs uppercase tracking-wider shadow-xl hover:brightness-110 transition-transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Deixar Meu Recado
          </button>
        </div>

        {/* Message Cards Masonry Grid */}
        {loading ? (
          <div className="text-center py-12 text-rose-300 text-sm animate-pulse">
            Carregando mural de recados...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-rose-300 text-sm">
            Seja o primeiro a deixar um recado de carinho!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="marsala-glass p-6 rounded-2xl border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <VenetianMaskSvg variant={msg.maskStyle} className="w-8 h-8" />
                      <div>
                        <h3 className="text-sm font-serif font-bold text-rose-100">
                          {msg.senderName}
                        </h3>
                        <span className="text-[10px] uppercase text-[#D4AF37]">
                          {msg.relationship}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-rose-100/90 italic leading-relaxed font-serif">
                    &ldquo;{msg.message}&rdquo;
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-[#D4AF37]/10">
                  <span className="text-[10px] text-rose-300">
                    {new Date(msg.createdAt).toLocaleDateString("pt-BR")}
                  </span>

                  <button
                    onClick={() => handleLike(msg.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition-colors cursor-pointer ${
                      likedIds.has(msg.id)
                        ? "bg-[#7A1C28]/60 border-[#D4AF37] text-amber-200"
                        : "bg-[#1a060b] hover:bg-[#7A1C28] border-[#D4AF37]/30 text-rose-200"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedIds.has(msg.id) ? "fill-[#D4AF37] text-[#D4AF37]" : "fill-rose-500 text-rose-500"}`} />
                    <span>{msg.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Message Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#26070e] border-2 border-[#D4AF37] w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
              <div className="flex items-center gap-2">
                <VenetianMaskSvg variant={maskStyle} className="w-8 h-8" />
                <h3 className="text-lg font-serif font-bold text-gold-gradient">
                  Escrever no Mural
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-rose-300 hover:text-white text-xs uppercase"
              >
                Fechar ✕
              </button>
            </div>

            <form onSubmit={handlePostMessage} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-rose-200">Seu Nome *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tio Roberto"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-xs text-rose-100 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-rose-200">Vínculo</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-3 py-2.5 text-xs text-rose-100 focus:outline-none"
                  >
                    {relationships.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-rose-200">
                    Estilo da Máscara
                  </label>
                  <select
                    value={maskStyle}
                    onChange={(e) =>
                      setMaskStyle(e.target.value as "gold" | "marsala" | "silver" | "velvet")
                    }
                    className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-3 py-2.5 text-xs text-rose-100 focus:outline-none"
                  >
                    <option value="gold">Dourada Imperial</option>
                    <option value="marsala">Marsala Velvet</option>
                    <option value="silver">Prata Real</option>
                    <option value="velvet">Nobre Veludo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-rose-200">
                  Sua Mensagem de Carinho *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Deseje felicidades, saúde e alegrias para esta nova fase inesquecível..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-xs text-rose-100 focus:outline-none focus:border-[#D4AF37]"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 font-bold text-xs uppercase tracking-wider shadow hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Publicando..." : "Publicar Recado"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
