"use client";

import React, { useState, useEffect } from "react";
import { VenetianMaskSvg } from "./VenetianMaskSvg";
import { supabase } from "@/lib/supabase";
import {
  Shield,
  Users,
  Gift,
  Settings,
  X,
  Trash2,
  Download,
  Plus,
  Save,
  CheckCircle,
  BarChart3,
  Search,
  KeyRound,
  DollarSign,
} from "lucide-react";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: () => void;
}

interface RsvpItem {
  id: number;
  guestName: string;
  email: string;
  phone: string;
  status: string;
  adultCount: number;
  childCount: number;
  companionNames: string;
  dietaryNotes: string;
  songRequest: string;
  vipCode: string;
  createdAt: string;
}

interface GiftItem {
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
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onEventUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState("");

  const [activeTab, setActiveTab] = useState<"stats" | "rsvps" | "gifts" | "settings">("stats");

  // Data
  const [rsvps, setRsvps] = useState<RsvpItem[]>([]);
  const [giftsList, setGiftsList] = useState<GiftItem[]>([]);
  const [searchGuest, setSearchGuest] = useState("");
  const [loading, setLoading] = useState(false);

  // Settings Form State
  const [personName, setPersonName] = useState("");
  const [age, setAge] = useState(15);
  const [tagline, setTagline] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [dressCodeTitle, setDressCodeTitle] = useState("");
  const [dressCodeDesc, setDressCodeDesc] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState("");
  const [pixName, setPixName] = useState("");
  const [pixCity, setPixCity] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [showSongRequest, setShowSongRequest] = useState(true);
  const [showDietaryNotes, setShowDietaryNotes] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Add Gift Form
  const [showAddGift, setShowAddGift] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Presentes");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newIsQuota, setNewIsQuota] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "marsala15" || passcode === "1234" || passcode === "admin") {
      setIsAuthenticated(true);
      setPassError("");
      loadAdminData();
    } else {
      setPassError("Senha incorreta. Dica: use 'marsala15' ou '1234'");
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [rsvpsResult, giftsResult, eventResult] = await Promise.all([
        supabase.from("rsvps").select("*").order("id", { ascending: false }),
        supabase.from("gifts").select("*").order("id"),
        supabase.from("event_info").select("*").limit(1).single(),
      ]);

      if (!rsvpsResult.error && rsvpsResult.data) {
        setRsvps(
          rsvpsResult.data.map((r) => ({
            id: r.id,
            guestName: r.guest_name,
            email: r.email || "",
            phone: r.phone || "",
            status: r.status,
            adultCount: r.adult_count,
            childCount: r.child_count,
            companionNames: r.companion_names || "",
            dietaryNotes: r.dietary_notes || "",
            songRequest: r.song_request || "",
            vipCode: r.vip_code,
            createdAt: r.created_at,
          }))
        );
      }

      if (!giftsResult.error && giftsResult.data) {
        setGiftsList(
          giftsResult.data.map((g) => ({
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
          }))
        );
      }

      if (!eventResult.error && eventResult.data) {
        const ev = eventResult.data;
        setPersonName(ev.person_name || "");
        setAge(ev.age || 15);
        setTagline(ev.tagline || "");
        setEventDate(ev.event_date || "");
        setVenueName(ev.venue_name || "");
        setVenueAddress(ev.venue_address || "");
        setMapUrl(ev.map_url || "");
        setDressCodeTitle(ev.dress_code_title || "");
        setDressCodeDesc(ev.dress_code_desc || "");
        setPixKey(ev.pix_key || "");
        setPixKeyType(ev.pix_key_type || "");
        setPixName(ev.pix_name || "");
        setPixCity(ev.pix_city || "");
        setWelcomeMessage(ev.welcome_message || "");
        setShowSongRequest(ev.show_song_request ?? true);
        setShowDietaryNotes(ev.show_dietary_notes ?? true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAdminData();
    }
  }, [isOpen, isAuthenticated]);

  const handleDeleteRsvp = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta confirmação?")) return;
    await supabase.from("rsvps").delete().eq("id", id);
    setRsvps(rsvps.filter((r) => r.id !== id));
  };

  const handleDeleteGift = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este presente?")) return;
    await supabase.from("gifts").delete().eq("id", id);
    setGiftsList(giftsList.filter((g) => g.id !== id));
  };

  const handleCreateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const { error } = await supabase.from("gifts").insert({
      title: newTitle,
      description: newDesc,
      category: newCategory,
      price: newPrice,
      image_url: newImage,
      is_quota: newIsQuota,
    });

    if (!error) {
      setShowAddGift(false);
      setNewTitle("");
      setNewDesc("");
      setNewPrice("");
      setNewImage("");
      loadAdminData();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("event_info")
      .update({
        person_name: personName,
        age,
        tagline,
        event_date: eventDate,
        venue_name: venueName,
        venue_address: venueAddress,
        map_url: mapUrl,
        dress_code_title: dressCodeTitle,
        dress_code_desc: dressCodeDesc,
        pix_key: pixKey,
        pix_key_type: pixKeyType,
        pix_name: pixName,
        pix_city: pixCity,
        welcome_message: welcomeMessage,
        show_song_request: showSongRequest,
        show_dietary_notes: showDietaryNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onEventUpdated();
    }
  };

  const exportCsv = () => {
    const headers = "Nome,Status,Adultos,Crianças,Telefone,Email,Acompanhantes,Música,Restrições,Código VIP\n";
    const rows = rsvps
      .map(
        (r) =>
          `"${r.guestName}","${r.status}",${r.adultCount},${r.childCount},"${r.phone}","${r.email}","${r.companionNames}","${r.songRequest}","${r.dietaryNotes}","${r.vipCode}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `lista_convidados_baile_${personName.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  // Stats
  const confirmedList = rsvps.filter((r) => r.status === "confirmed");
  const totalGuests = confirmedList.reduce(
    (sum, r) => sum + r.adultCount + r.childCount,
    0
  );
  const totalChildren = confirmedList.reduce((sum, r) => sum + r.childCount, 0);
  const reservedGiftsCount = giftsList.filter((g) => g.isReserved).length;
  const totalQuotasSum = giftsList.reduce(
    (acc, g) => acc + parseFloat(g.quotaCollected || "0"),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#26070e] border-2 border-[#D4AF37] w-full max-w-5xl rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#D4AF37]" />
            <div>
              <h3 className="text-xl font-serif font-bold text-gold-gradient">
                Painel da Família & Anfitriões
              </h3>
              <p className="text-xs text-rose-300">Gestão do Baile de Máscaras</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-rose-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Auth Screen */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4 py-8 max-w-sm mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-[#58111a] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] mx-auto">
              <KeyRound className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-serif font-bold text-rose-100">
                Acesso Restrito ao Anfitrião
              </h4>
              <p className="text-xs text-rose-300">Digite a senha para acessar o painel administrativo.</p>
            </div>

            <input
              type="password"
              placeholder="Digite a senha (padrão: marsala15)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-center text-sm text-rose-100 focus:outline-none focus:border-[#D4AF37]"
            />

            {passError && <p className="text-xs text-rose-400 font-medium">{passError}</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 font-bold text-xs uppercase tracking-wider shadow cursor-pointer"
            >
              Entrar no Painel
            </button>
          </form>
        ) : (
          <div className="flex flex-col flex-grow overflow-hidden space-y-4">
            {/* Nav Tabs */}
            <div className="flex border-b border-[#D4AF37]/20 space-x-2 overflow-x-auto pb-1 shrink-0">
              <button
                onClick={() => setActiveTab("stats")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "stats"
                    ? "bg-[#58111a] text-[#D4AF37] border-t-2 border-x border-[#D4AF37]"
                    : "text-rose-300 hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Resumo & Stats
              </button>

              <button
                onClick={() => setActiveTab("rsvps")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "rsvps"
                    ? "bg-[#58111a] text-[#D4AF37] border-t-2 border-x border-[#D4AF37]"
                    : "text-rose-300 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" /> Convidados ({rsvps.length})
              </button>

              <button
                onClick={() => setActiveTab("gifts")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "gifts"
                    ? "bg-[#58111a] text-[#D4AF37] border-t-2 border-x border-[#D4AF37]"
                    : "text-rose-300 hover:text-white"
                }`}
              >
                <Gift className="w-4 h-4" /> Presentes ({giftsList.length})
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "settings"
                    ? "bg-[#58111a] text-[#D4AF37] border-t-2 border-x border-[#D4AF37]"
                    : "text-rose-300 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" /> Editar Festa
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-grow overflow-y-auto pr-1 space-y-6">
              {/* STATS TAB */}
              {activeTab === "stats" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="marsala-glass p-4 rounded-2xl border border-[#D4AF37]/30 text-center space-y-1">
                      <Users className="w-5 h-5 text-[#D4AF37] mx-auto" />
                      <span className="block text-2xl font-serif font-bold text-gold-gradient">
                        {totalGuests}
                      </span>
                      <span className="text-[10px] uppercase text-rose-300 font-semibold">
                        Pessoas Confirmadas
                      </span>
                    </div>

                    <div className="marsala-glass p-4 rounded-2xl border border-[#D4AF37]/30 text-center space-y-1">
                      <BarChart3 className="w-5 h-5 text-amber-300 mx-auto" />
                      <span className="block text-2xl font-serif font-bold text-amber-200">
                        {confirmedList.length}
                      </span>
                      <span className="text-[10px] uppercase text-rose-300 font-semibold">
                        Famílias / Grupos
                      </span>
                    </div>

                    <div className="marsala-glass p-4 rounded-2xl border border-[#D4AF37]/30 text-center space-y-1">
                      <Gift className="w-5 h-5 text-rose-300 mx-auto" />
                      <span className="block text-2xl font-serif font-bold text-rose-100">
                        {reservedGiftsCount}
                      </span>
                      <span className="text-[10px] uppercase text-rose-300 font-semibold">
                        Presentes Reservados
                      </span>
                    </div>

                    <div className="marsala-glass p-4 rounded-2xl border border-[#D4AF37]/30 text-center space-y-1">
                      <DollarSign className="w-5 h-5 text-emerald-400 mx-auto" />
                      <span className="block text-2xl font-serif font-bold text-emerald-400">
                        R$ {totalQuotasSum.toFixed(2)}
                      </span>
                      <span className="text-[10px] uppercase text-rose-300 font-semibold">
                        Cotas Arrecadadas
                      </span>
                    </div>
                  </div>

                  {/* Summary lists */}
                  <div className="p-5 rounded-2xl bg-[#1a060b] border border-[#D4AF37]/20 space-y-3">
                    <h4 className="text-sm font-serif font-bold text-[#D4AF37]">
                      Acompanhamento do Baile
                    </h4>
                    <ul className="text-xs text-rose-200 space-y-2">
                      <li className="flex justify-between border-b border-[#D4AF37]/10 pb-1.5">
                        <span>Crianças confirmadas (até 10 anos):</span>
                        <strong className="text-amber-200">{totalChildren}</strong>
                      </li>
                      <li className="flex justify-between border-b border-[#D4AF37]/10 pb-1.5">
                        <span>Convidados que declinaram:</span>
                        <strong className="text-rose-400">
                          {rsvps.filter((r) => r.status === "declined").length}
                        </strong>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* RSVPS TAB */}
              {activeTab === "rsvps" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={searchGuest}
                        onChange={(e) => setSearchGuest(e.target.value)}
                        className="w-full bg-[#1a060b] border border-[#D4AF37]/30 rounded-full pl-9 pr-4 py-1.5 text-xs text-rose-100"
                      />
                    </div>

                    <button
                      onClick={exportCsv}
                      className="px-4 py-2 bg-[#58111a] hover:bg-[#7A1C28] text-amber-200 text-xs font-bold uppercase rounded-xl border border-[#D4AF37]/40 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Exportar Planilha CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/30">
                    <table className="w-full text-left text-xs text-rose-200">
                      <thead className="bg-[#1a060b] text-[#D4AF37] uppercase font-bold border-b border-[#D4AF37]/30">
                        <tr>
                          <th className="p-3">Convidado</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Pessoas</th>
                          <th className="p-3">Contato</th>
                          <th className="p-3">Pedido de Música</th>
                          <th className="p-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D4AF37]/10 bg-[#26070e]">
                        {rsvps
                          .filter((r) =>
                            r.guestName.toLowerCase().includes(searchGuest.toLowerCase())
                          )
                          .map((r) => (
                            <tr key={r.id} className="hover:bg-[#3c0b17]/50">
                              <td className="p-3 font-medium text-rose-100">
                                <div>{r.guestName}</div>
                                {r.companionNames && (
                                  <div className="text-[10px] text-rose-300">
                                    + {r.companionNames}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                    r.status === "confirmed"
                                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500"
                                      : "bg-rose-950 text-rose-300 border border-rose-500"
                                  }`}
                                >
                                  {r.status === "confirmed" ? "Confirmado" : "Ausente"}
                                </span>
                              </td>
                              <td className="p-3">
                                {r.adultCount} ad. / {r.childCount} cr.
                              </td>
                              <td className="p-3 text-[11px]">
                                {r.phone} {r.email && `• ${r.email}`}
                              </td>
                              <td className="p-3 italic text-amber-200/90">
                                {r.songRequest || "-"}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteRsvp(r.id)}
                                  className="p-1.5 text-rose-400 hover:text-rose-200 rounded hover:bg-rose-900/40"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* GIFTS TAB */}
              {activeTab === "gifts" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-serif font-bold text-gold-gradient">
                      Presentes Cadastrados
                    </h4>
                    <button
                      onClick={() => setShowAddGift(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Cadastrar Novo Presente
                    </button>
                  </div>

                  {/* Add Gift Sub-Form */}
                  {showAddGift && (
                    <form
                      onSubmit={handleCreateGift}
                      className="p-4 rounded-2xl bg-[#1a060b] border border-[#D4AF37] space-y-3"
                    >
                      <h5 className="text-xs font-bold text-[#D4AF37] uppercase">
                        Novo Item de Presente
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Título do presente *"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="bg-[#2b0811] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-rose-100"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Valor (R$) *"
                          required
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="bg-[#2b0811] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-rose-100"
                        />
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="bg-[#2b0811] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-rose-100"
                        >
                          <option value="Bolsas">Bolsas</option>
                          <option value="Acessórios">Acessórios</option>
                          <option value="Maquiagem">Maquiagem</option>
                          <option value="Skin Care">Skin Care</option>
                          <option value="Unha">Unha</option>
                        </select>
                        <input
                          type="url"
                          placeholder="URL da Foto do Presente"
                          value={newImage}
                          onChange={(e) => setNewImage(e.target.value)}
                          className="bg-[#2b0811] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-rose-100"
                        />
                      </div>
                      <textarea
                        placeholder="Descrição curta"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full bg-[#2b0811] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-rose-100"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="quotaChk"
                          checked={newIsQuota}
                          onChange={(e) => setNewIsQuota(e.target.checked)}
                        />
                        <label htmlFor="quotaChk" className="text-xs text-rose-200">
                          Este item é uma Cota Coletiva (várias pessoas podem contribuir)?
                        </label>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowAddGift(false)}
                          className="px-3 py-1.5 text-xs text-rose-300 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#58111a] text-amber-200 text-xs font-bold uppercase rounded-lg border border-[#D4AF37]"
                        >
                          Salvar Presente
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {giftsList.map((g) => (
                      <div
                        key={g.id}
                        className="p-3 rounded-xl bg-[#1a060b] border border-[#D4AF37]/20 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={g.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h5 className="text-xs font-bold text-rose-100">{g.title}</h5>
                            <span className="text-[10px] text-[#D4AF37]">
                              R$ {parseFloat(g.price).toFixed(2)}{" "}
                              {g.isQuota ? "(Cota)" : ""}
                            </span>
                            {g.isReserved && (
                              <p className="text-[9px] text-emerald-400">
                                Escolhido por: {g.reservedByName}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteGift(g.id)}
                          className="text-rose-400 hover:text-rose-200 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-rose-200">Nome da Aniversariante</label>
                      <input
                        type="text"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-rose-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-rose-200">Idade Completa</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-rose-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-rose-200">Subtítulo / Tagline</label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-rose-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-rose-200">Data e Horário do Evento</label>
                      <input
                        type="datetime-local"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-rose-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-rose-200">Nome do Salão de Festas</label>
                      <input
                        type="text"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-rose-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-rose-200">Endereço Completo</label>
                      <input
                        type="text"
                        value={venueAddress}
                        onChange={(e) => setVenueAddress(e.target.value)}
                        className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-rose-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-rose-200">Chave PIX</label>
                      <input
                        type="text"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-rose-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-rose-200">Nome do Titular do PIX</label>
                      <input
                        type="text"
                        value={pixName}
                        onChange={(e) => setPixName(e.target.value)}
                        className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-rose-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-rose-200">Mensagem de Boas-Vindas</label>
                    <textarea
                      rows={3}
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-rose-100"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1a060b] border border-[#D4AF37]/30 space-y-4">
                    <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                      Configurações do Formulário de Presença
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setShowSongRequest(!showSongRequest)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            showSongRequest ? "bg-emerald-600" : "bg-rose-800"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                              showSongRequest ? "left-[22px]" : "left-0.5"
                            }`}
                          />
                        </div>
                        <span className="text-xs text-rose-200">Exibir campo "Pedido de Música"</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setShowDietaryNotes(!showDietaryNotes)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            showDietaryNotes ? "bg-emerald-600" : "bg-rose-800"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                              showDietaryNotes ? "left-[22px]" : "left-0.5"
                            }`}
                          />
                        </div>
                        <span className="text-xs text-rose-200">Exibir campo "Restrição Alimentar"</span>
                      </label>
                    </div>
                  </div>

                  {saveSuccess && (
                    <div className="p-2 bg-emerald-950 text-emerald-300 text-xs rounded-xl text-center">
                      ✓ Configurações salvas com sucesso!
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Salvar Alterações da Festa
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
