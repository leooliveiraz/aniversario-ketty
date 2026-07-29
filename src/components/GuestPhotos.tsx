"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, Upload, X, ChevronLeft, ChevronRight, Pause, Play, User } from "lucide-react";

interface GuestPhoto {
  id: number;
  senderName: string;
  imageUrl: string;
  createdAt: string;
}

export const GuestPhotos: React.FC = () => {
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [modalOpen, setModalOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const CAROUSEL_INTERVAL_MS = 4000;
  const REFRESH_INTERVAL_MS = 120000;

  const fetchSettings = async () => {
    const { data } = await supabase.from("event_info").select("auto_approve_photos").limit(1).single();
    if (data) setAutoApprove(data.auto_approve_photos ?? true);
  };

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from("guest_photos")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (data) {
      setPhotos(
        data.map((p) => ({
          id: p.id,
          senderName: p.sender_name,
          imageUrl: p.image_url,
          createdAt: p.created_at,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
    fetchPhotos();
    const interval = setInterval(fetchPhotos, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (photos.length === 0 || isPaused) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [photos.length, isPaused]);

  const goTo = (index: number) => setCurrentIndex(index);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % photos.length);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `guest/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("guest_photos").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("guest_photos").getPublicUrl(path);
      const imageUrl = urlData.publicUrl;

      const res = await fetch("/api/guest-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderName: senderName.trim(), imageUrl, isApproved: autoApprove }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      setSenderName("");
      setFile(null);
      setModalOpen(false);
      fetchPhotos();
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar foto. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-[#1a060b]">
        <div className="text-center text-rose-300 text-sm animate-pulse">Carregando fotos dos convidados...</div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-[#1a060b] relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58111a]/80 border border-[#D4AF37]/40 text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            <Camera className="w-3.5 h-3.5" /> Fotos dos Convidados
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-gold-gradient">
            Galeria do Público
          </h2>
          <p className="text-sm text-rose-200/80">
            Veja as fotos enviadas pelos convidados do baile!
          </p>

          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 font-bold text-xs uppercase tracking-wider shadow-xl hover:brightness-110 transition-transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Enviar Minha Foto
          </button>
        </div>

        {/* Carousel */}
        {photos.length > 0 ? (
          <div
            className="relative w-full max-w-3xl mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative h-[400px] sm:h-[500px] rounded-3xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-2xl bg-[#2b0811]">
              {photos.map((p, idx) => (
                <div
                  key={p.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    idx === currentIndex
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <img
                    src={p.imageUrl}
                    alt={`Foto de ${p.senderName}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1a060b]/90 via-[#1a060b]/40 to-transparent p-4 pt-12">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-sm font-serif font-bold text-rose-100">{p.senderName}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Nav arrows */}
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-rose-200 hover:text-[#D4AF37] transition-all cursor-pointer z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-rose-200 hover:text-[#D4AF37] transition-all cursor-pointer z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Pause/Play */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-rose-200 transition-all cursor-pointer z-10"
                title={isPaused ? "Retomar" : "Pausar"}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex ? "w-6 bg-[#D4AF37]" : "w-2 bg-rose-700 hover:bg-rose-500"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-[#D4AF37]/30 mx-auto mb-4" />
            <p className="text-rose-300 text-sm">Nenhuma foto enviada ainda. Seja o primeiro!</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#26070e] border-2 border-[#D4AF37] w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-6 h-6 text-[#D4AF37]" />
                <h3 className="text-lg font-serif font-bold text-gold-gradient">
                  Enviar Foto
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-rose-300 hover:text-white text-xs uppercase cursor-pointer"
              >
                Fechar ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-rose-200">Seu Nome *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-xs text-rose-100 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-rose-200">Sua Foto *</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-xs text-rose-100 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#58111a] file:text-[#D4AF37] file:cursor-pointer hover:file:bg-[#7A1C28] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                {file && (
                  <p className="text-[10px] text-rose-400 truncate">{file.name}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 font-bold text-xs uppercase tracking-wider shadow hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Enviando..." : "Enviar Foto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
