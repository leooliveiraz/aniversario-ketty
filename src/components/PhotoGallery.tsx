"use client";

import React, { useState } from "react";
import { Camera, Copy, Check, X, Sparkles, Share2 } from "lucide-react";

interface PhotoGalleryProps {
  personName: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ personName }) => {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [copiedHashtag, setCopiedHashtag] = useState(false);

  const hashtagText = `#BaileDeMascaras${personName.replace(/\s+/g, "")}`;

  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      caption: "Sessão de Fotos Oficial - O Vestido Marsala Real",
    },
    {
      url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80",
      caption: "Elegância & Detalhes Dourados dos 15 Anos",
    },
    {
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      caption: "Salão Imperial - Preparativos do Baile de Máscaras",
    },
    {
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
      caption: "Ensaio Fotográfico - Produção & Máscara de Gala",
    },
    {
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
      caption: "Luzes e Celebração Mágica da Noite",
    },
    {
      url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
      caption: "Os Sapatos da Valsa Inesquecível",
    },
  ];

  const handleCopyHashtag = () => {
    navigator.clipboard.writeText(hashtagText);
    setCopiedHashtag(true);
    setTimeout(() => setCopiedHashtag(false), 3000);
  };

  return (
    <section id="galeria" className="py-20 px-4 bg-[#1a060b] relative">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58111a]/80 border border-[#D4AF37]/40 text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            <Camera className="w-3.5 h-3.5" /> Ensaio Fotográfico & Inspirações
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-gold-gradient">
            Galeria do Baile
          </h2>
          <p className="text-sm sm:text-base text-rose-200/80">
            Confira os primeiros registros do ensaio pré-festa e prepare-se para o grande dia!
          </p>
        </div>

        {/* Gallery Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setActiveImage(img.url)}
              className="relative h-64 rounded-2xl overflow-hidden border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-xl group cursor-pointer"
            >
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a060b] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>

              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <p className="text-xs font-serif font-bold text-rose-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> {img.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Social Hashtag Box */}
        <div className="marsala-glass p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#58111a] border border-[#D4AF37] text-[#D4AF37]">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300">
                Hashtag Oficial nas Redes Sociais
              </span>
              <h3 className="text-xl font-serif font-bold text-gold-gradient">
                {hashtagText}
              </h3>
              <p className="text-xs text-rose-200">
                Use a hashtag ao postar fotos no dia da festa para aparecer no álbum do baile!
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyHashtag}
            className="px-5 py-2.5 rounded-xl bg-[#58111a] hover:bg-[#7A1C28] text-rose-100 text-xs font-bold uppercase tracking-wider border border-[#D4AF37]/40 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            {copiedHashtag ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#D4AF37]" />}
            {copiedHashtag ? "Hashtag Copiada!" : "Copiar Hashtag"}
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <img
              src={activeImage}
              alt="Ampliada"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl border-2 border-[#D4AF37]"
            />
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 bg-[#1a060b] text-white p-2 rounded-full border border-[#D4AF37] cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
