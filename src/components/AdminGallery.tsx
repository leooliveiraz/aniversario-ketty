"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Image,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  X,
  ArrowLeft,
  Upload,
  GripVertical,
  Save,
  Edit3,
} from "lucide-react";

interface Album {
  id: number;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
}

interface Photo {
  id: number;
  album_id: number;
  image_url: string;
  caption: string;
  is_highlight: boolean;
  sort_order: number;
  created_at: string;
}

export const AdminGallery: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [editAlbumId, setEditAlbumId] = useState<number | null>(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");

  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAlbums = async () => {
    const { data } = await supabase.from("albums").select("*").order("sort_order");
    if (data) setAlbums(data);
    setLoading(false);
  };

  const fetchPhotos = async (albumId: number) => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("album_id", albumId)
      .order("sort_order");
    if (data) setPhotos(data);
  };

  useEffect(() => { fetchAlbums(); }, []);

  useEffect(() => {
    if (selectedAlbumId !== null) fetchPhotos(selectedAlbumId);
  }, [selectedAlbumId]);

  // --- Album CRUD ---
  const openNewAlbum = () => {
    setEditAlbumId(null);
    setAlbumTitle("");
    setAlbumDesc("");
    setShowAlbumForm(true);
  };

  const openEditAlbum = (a: Album) => {
    setEditAlbumId(a.id);
    setAlbumTitle(a.title);
    setAlbumDesc(a.description);
    setShowAlbumForm(true);
  };

  const saveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim()) return;

    if (editAlbumId) {
      await supabase.from("albums").update({ title: albumTitle, description: albumDesc }).eq("id", editAlbumId);
    } else {
      const max = albums.reduce((m, a) => Math.max(m, a.sort_order), -1);
      await supabase.from("albums").insert({ title: albumTitle, description: albumDesc, sort_order: max + 1 });
    }
    setShowAlbumForm(false);
    fetchAlbums();
  };

  const deleteAlbum = async (id: number) => {
    if (!confirm("Excluir álbum e todas as fotos?")) return;
    const { data: photosData } = await supabase.from("photos").select("image_url").eq("album_id", id);
    const files = (photosData || []).map((p) => p.image_url.split("/").pop()).filter(Boolean);
    if (files.length > 0) {
      await supabase.storage.from("albums").remove(files);
    }
    await supabase.from("albums").delete().eq("id", id);
    if (selectedAlbumId === id) setSelectedAlbumId(null);
    fetchAlbums();
  };

  const moveAlbum = async (id: number, dir: -1 | 1) => {
    const idx = albums.findIndex((a) => a.id === id);
    const target = idx + dir;
    if (target < 0 || target >= albums.length) return;
    const cur = albums[idx];
    const next = albums[target];
    await Promise.all([
      supabase.from("albums").update({ sort_order: next.sort_order }).eq("id", cur.id),
      supabase.from("albums").update({ sort_order: cur.sort_order }).eq("id", next.id),
    ]);
    fetchAlbums();
  };

  const handleAlbumDragStart = (idx: number) => setDragIndex(idx);
  const handleAlbumDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const reordered = [...albums];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(idx, 0, moved);
    setAlbums(reordered);
    setDragIndex(idx);
  };
  const handleAlbumDragEnd = async () => {
    if (dragIndex === null) return;
    const updates = albums.map((a, i) => ({
      id: a.id,
      sort_order: i,
    }));
    for (const u of updates) {
      await supabase.from("albums").update({ sort_order: u.sort_order }).eq("id", u.id);
    }
    setDragIndex(null);
    fetchAlbums();
  };

  // --- Photo CRUD ---
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || selectedAlbumId === null) return;
    setUploading(true);
    const newPhotos: { album_id: number; image_url: string; caption: string; sort_order: number; is_highlight: boolean }[] = [];
    const maxOrder = photos.reduce((m, p) => Math.max(m, p.sort_order), -1);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `${selectedAlbumId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("albums").upload(path, file);
      if (error) continue;
      const { data: urlData } = supabase.storage.from("albums").getPublicUrl(path);
      newPhotos.push({
        album_id: selectedAlbumId,
        image_url: urlData.publicUrl,
        caption: "",
        sort_order: maxOrder + 1 + i,
        is_highlight: false,
      });
    }

    if (newPhotos.length > 0) {
      await supabase.from("photos").insert(newPhotos);
      fetchPhotos(selectedAlbumId);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const updatePhotoCaption = async (id: number, caption: string) => {
    await supabase.from("photos").update({ caption }).eq("id", id);
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)));
  };

  const toggleHighlight = async (id: number) => {
    const p = photos.find((ph) => ph.id === id);
    if (!p) return;
    await supabase.from("photos").update({ is_highlight: !p.is_highlight }).eq("id", id);
    setPhotos((prev) => prev.map((ph) => (ph.id === id ? { ...ph, is_highlight: !ph.is_highlight } : ph)));
  };

  const deletePhoto = async (id: number) => {
    const p = photos.find((ph) => ph.id === id);
    if (!p) return;
    const fileName = p.image_url.split("/").pop();
    await supabase.storage.from("albums").remove([fileName!]);
    await supabase.from("photos").delete().eq("id", id);
    fetchPhotos(selectedAlbumId!);
  };

  const movePhoto = async (id: number, dir: -1 | 1) => {
    const idx = photos.findIndex((p) => p.id === id);
    const target = idx + dir;
    if (target < 0 || target >= photos.length) return;
    const cur = photos[idx];
    const next = photos[target];
    await Promise.all([
      supabase.from("photos").update({ sort_order: next.sort_order }).eq("id", cur.id),
      supabase.from("photos").update({ sort_order: cur.sort_order }).eq("id", next.id),
    ]);
    fetchPhotos(selectedAlbumId!);
  };

  const handlePhotoDragStart = (idx: number) => setDragIndex(idx);
  const handlePhotoDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const reordered = [...photos];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(idx, 0, moved);
    setPhotos(reordered);
    setDragIndex(idx);
  };
  const handlePhotoDragEnd = async () => {
    if (dragIndex === null) return;
    for (const [i, p] of photos.entries()) {
      await supabase.from("photos").update({ sort_order: i }).eq("id", p.id);
    }
    setDragIndex(null);
    fetchPhotos(selectedAlbumId!);
  };

  // --- Views ---
  if (selectedAlbumId !== null) {
    const album = albums.find((a) => a.id === selectedAlbumId);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => { setSelectedAlbumId(null); setPhotos([]); }} className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Voltar para Álbuns
          </button>
          <h4 className="text-sm font-serif font-bold text-gold-gradient">{album?.title}</h4>
        </div>

        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
            <Upload className="w-4 h-4" /> {uploading ? "Enviando..." : "Enviar Fotos"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((p, idx) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => handlePhotoDragStart(idx)}
              onDragOver={(e) => handlePhotoDragOver(e, idx)}
              onDragEnd={handlePhotoDragEnd}
              className={`relative group rounded-xl overflow-hidden border ${p.is_highlight ? "border-[#D4AF37]" : "border-[#D4AF37]/30"} bg-[#1a060b]`}
            >
              <img src={p.image_url} alt="" className="w-full h-32 object-cover" />
              <div className="p-2 space-y-1.5">
                <input
                  type="text"
                  value={p.caption}
                  onChange={(e) => updatePhotoCaption(p.id, e.target.value)}
                  placeholder="Legenda..."
                  className="w-full bg-[#2b0811] border border-[#D4AF37]/20 rounded px-2 py-1 text-[10px] text-rose-100"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button onClick={() => movePhoto(p.id, -1)} className="text-rose-400 hover:text-white p-0.5 cursor-pointer"><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => movePhoto(p.id, 1)} className="text-rose-400 hover:text-white p-0.5 cursor-pointer"><ChevronDown className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleHighlight(p.id)} className={`p-0.5 cursor-pointer ${p.is_highlight ? "text-[#D4AF37]" : "text-rose-600 hover:text-rose-400"}`} title="Destacar">
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deletePhoto(p.id)} className="text-rose-500 hover:text-rose-300 p-0.5 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-rose-600 cursor-grab"><GripVertical className="w-3.5 h-3.5" /></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-serif font-bold text-gold-gradient">Álbuns de Fotos</h4>
        <button onClick={openNewAlbum} className="px-4 py-2 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" /> Novo Álbum
        </button>
      </div>

      {showAlbumForm && (
        <form onSubmit={saveAlbum} className="p-4 rounded-2xl bg-[#1a060b] border border-[#D4AF37] space-y-3">
          <h5 className="text-xs font-bold text-[#D4AF37] uppercase">{editAlbumId ? "Editar Álbum" : "Novo Álbum"}</h5>
          <input type="text" placeholder="Título do álbum *" required value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} className="w-full bg-[#2b0811] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-rose-100" />
          <textarea placeholder="Descrição (opcional)" value={albumDesc} onChange={(e) => setAlbumDesc(e.target.value)} className="w-full bg-[#2b0811] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-rose-100" />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowAlbumForm(false)} className="px-3 py-1.5 text-xs text-rose-300 hover:text-white">Cancelar</button>
            <button type="submit" className="px-4 py-1.5 bg-[#58111a] text-amber-200 text-xs font-bold uppercase rounded-lg border border-[#D4AF37]">
              <Save className="w-3.5 h-3.5 inline mr-1" /> Salvar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-rose-300 text-xs animate-pulse">Carregando álbuns...</div>
      ) : albums.length === 0 ? (
        <div className="text-center py-8 text-rose-300 text-xs">Nenhum álbum criado ainda.</div>
      ) : (
        <div className="space-y-2">
          {albums.map((a, idx) => {
            const cover = photos.length > 0 ? photos[0].image_url : null;
            return (
              <div
                key={a.id}
                draggable
                onDragStart={() => handleAlbumDragStart(idx)}
                onDragOver={(e) => handleAlbumDragOver(e, idx)}
                onDragEnd={handleAlbumDragEnd}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#1a060b] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                onClick={() => setSelectedAlbumId(a.id)}
              >
                <span className="text-rose-600 cursor-grab"><GripVertical className="w-4 h-4" /></span>
                <div className="w-12 h-12 rounded-lg bg-[#2b0811] flex items-center justify-center overflow-hidden shrink-0 border border-[#D4AF37]/20">
                  <Image className="w-5 h-5 text-[#D4AF37]/40" />
                </div>
                <div className="flex-grow min-w-0">
                  <h5 className="text-sm font-bold text-rose-100 truncate">{a.title}</h5>
                  <p className="text-[10px] text-rose-300 truncate">{a.description || "Sem descrição"}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => moveAlbum(a.id, -1)} className="text-rose-400 hover:text-white p-1 cursor-pointer"><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => moveAlbum(a.id, 1)} className="text-rose-400 hover:text-white p-1 cursor-pointer"><ChevronDown className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openEditAlbum(a)} className="text-amber-400 hover:text-amber-200 p-1 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteAlbum(a.id)} className="text-rose-500 hover:text-rose-300 p-1 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
