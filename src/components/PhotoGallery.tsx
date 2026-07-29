"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, Copy, Check, X, Sparkles, Star, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoData {
  id: number;
  image_url: string;
  caption: string;
  is_highlight: boolean;
  sort_order: number;
  album_id: number;
}

interface AlbumData {
  id: number;
  title: string;
  description: string;
  sort_order: number;
}

interface PhotoGalleryProps {
  personName: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ personName }) => {
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedHashtag, setCopiedHashtag] = useState(false);

  const hashtagText = `#BaileDeMascaras${personName.replace(/\s+/g, "")}`;

  useEffect(() => {
    Promise.all([
      supabase.from("albums").select("*").order("sort_order"),
      supabase.from("photos").select("*").order("sort_order"),
    ]).then(([albumsRes, photosRes]) => {
      if (albumsRes.data) setAlbums(albumsRes.data);
      if (photosRes.data) setPhotos(photosRes.data);
      setLoading(false);
    });
  }, []);

  const activePhotos = activeAlbum
    ? photos.filter((p) => p.album_id === activeAlbum)
    : [];

  const highlights = photos.filter((p) => p.is_highlight);

  const currentPhotos = activeAlbum ? activePhotos : [];
  const currentLightboxPhotos = activeAlbum ? activePhotos : highlights;

  const handleCopyHashtag = () => {
    navigator.clipboard.writeText(hashtagText);
    setCopiedHashtag(true);
    setTimeout(() => setCopiedHashtag(false), 3000);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i !== null ? (i - 1 + currentLightboxPhotos.length) % currentLightboxPhotos.length : null));
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i !== null ? (i + 1) % currentLightboxPhotos.length : null));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, currentLightboxPhotos.length]);

  if (loading) {
    return (
      <section id="galeria" className="py-20 px-4 bg-[#1a060b]">
        <div className="text-center text-rose-300 text-sm animate-pulse">Carregando galeria...</div>
      </section>
    );
  }

  if (albums.length === 0) return null;

  return (
    <section id="galeria" className="py-20 px-4 bg-[#1a060b] relative">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58111a]/80 border border-[#D4AF37]/40 text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            <Camera className="w-3.5 h-3.5" /> Galeria de Fotos
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-gold-gradient">
            {activeAlbum
              ? albums.find((a) => a.id === activeAlbum)?.title || "Fotos"
              : "Galeria do Baile"}
          </h2>
          {activeAlbum ? (
            <p className="text-sm text-rose-200/80 max-w-xl mx-auto">
              {albums.find((a) => a.id === activeAlbum)?.description}
            </p>
          ) : (
            <p className="text-sm text-rose-200/80 max-w-xl mx-auto">
              Confira os momentos especiais do nosso Baile de Máscaras.
            </p>
          )}
        </div>

        {/* Back button when inside album */}
        {activeAlbum && (
          <div className="text-center">
            <button onClick={() => setActiveAlbum(null)} className="px-4 py-2 text-xs text-rose-300 hover:text-white border border-[#D4AF37]/40 rounded-xl cursor-pointer">
              ← Ver todos os álbuns
            </button>
          </div>
        )}

        {/* Highlights on main view */}
        {!activeAlbum && highlights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Star className="w-4 h-4 fill-[#D4AF37]" />
              <span className="text-xs uppercase font-bold tracking-wider">Destaques</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {highlights.map((p) => (
                <div
                  key={p.id}
                  onClick={() => { setActiveAlbum(p.album_id); setTimeout(() => setLightboxIndex(photos.filter((ph) => ph.album_id === p.album_id).indexOf(p)), 100); }}
                  className="relative h-40 rounded-xl overflow-hidden border-2 border-[#D4AF37] cursor-pointer group"
                >
                  <img src={p.image_url} alt={p.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a060b] via-transparent to-transparent" />
                  {p.caption && (
                    <p className="absolute bottom-2 left-2 right-2 text-[10px] text-rose-200 truncate">{p.caption}</p>
                  )}
                  <Star className="absolute top-2 right-2 w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Albums grid */}
        {!activeAlbum && albums.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((a) => {
              const albumPhotos = photos.filter((p) => p.album_id === a.id);
              const cover = albumPhotos.length > 0 ? albumPhotos[0].image_url : null;
              return (
                <div
                  key={a.id}
                  onClick={() => setActiveAlbum(a.id)}
                  className="marsala-glass rounded-2xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 overflow-hidden cursor-pointer group"
                >
                  <div className="relative h-48 bg-[#2b0811]">
                    {cover ? (
                      <img src={cover} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-12 h-12 text-[#D4AF37]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a060b] via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-serif font-bold text-gold-gradient">{a.title}</h3>
                      <span className="text-[10px] text-rose-300">{albumPhotos.length} {albumPhotos.length === 1 ? "foto" : "fotos"}</span>
                    </div>
                  </div>
                  {a.description && (
                    <div className="p-3">
                      <p className="text-[11px] text-rose-200/70 line-clamp-2">{a.description}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Photos grid inside album */}
        {activeAlbum && currentPhotos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPhotos.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => setLightboxIndex(idx)}
                className="relative h-64 rounded-2xl overflow-hidden border border-[#D4AF37]/30 hover:border-[#D4AF37] cursor-pointer group"
              >
                <img src={p.image_url} alt={p.caption || ""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a060b] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                {p.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <p className="text-xs font-serif font-bold text-rose-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> {p.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!activeAlbum && albums.length === 0 && (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-[#D4AF37]/30 mx-auto mb-4" />
            <p className="text-rose-300 text-sm">A galeria será atualizada em breve com as fotos do baile!</p>
          </div>
        )}

        {/* Hashtag */}
        <div className="marsala-glass p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#58111a] border border-[#D4AF37] text-[#D4AF37]">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300">Hashtag Oficial</span>
              <h3 className="text-xl font-serif font-bold text-gold-gradient">{hashtagText}</h3>
              <p className="text-xs text-rose-200">Use a hashtag ao postar fotos no dia da festa!</p>
            </div>
          </div>
          <button onClick={handleCopyHashtag} className="px-5 py-2.5 rounded-xl bg-[#58111a] hover:bg-[#7A1C28] text-rose-100 text-xs font-bold uppercase tracking-wider border border-[#D4AF37]/40 transition-all flex items-center gap-2 cursor-pointer shrink-0">
            {copiedHashtag ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#D4AF37]" />}
            {copiedHashtag ? "Hashtag Copiada!" : "Copiar Hashtag"}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && currentLightboxPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 text-rose-200 hover:text-white p-2 rounded-full hover:bg-white/10 cursor-pointer z-10">
            <X className="w-8 h-8" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i !== null ? (i - 1 + currentLightboxPhotos.length) % currentLightboxPhotos.length : null)); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-200 hover:text-[#D4AF37] p-2 rounded-full hover:bg-white/10 cursor-pointer">
            <ChevronLeft className="w-10 h-10" />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-4xl max-h-[90vh] flex flex-col items-center gap-4">
            <img src={currentLightboxPhotos[lightboxIndex].image_url} alt="" className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
            {currentLightboxPhotos[lightboxIndex].caption && (
              <p className="text-sm text-rose-200/90 text-center">{currentLightboxPhotos[lightboxIndex].caption}</p>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i !== null ? (i + 1) % currentLightboxPhotos.length : null)); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-200 hover:text-[#D4AF37] p-2 rounded-full hover:bg-white/10 cursor-pointer">
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {currentLightboxPhotos.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }} className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === lightboxIndex ? "bg-[#D4AF37] w-4" : "bg-rose-700 hover:bg-rose-500"}`} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
