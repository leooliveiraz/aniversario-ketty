"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { VenetianMaskSvg } from "./VenetianMaskSvg";
import { supabase, generateVipCode } from "@/lib/supabase";
import {
  CalendarCheck,
  User,
  Phone,
  Mail,
  Users,
  Music2,
  UtensilsCrossed,
  CheckCircle,
  QrCode,
  Download,
  Share2,
  XCircle,
  Sparkles,
} from "lucide-react";

interface RsvpFormProps {
  personName: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  showSongRequest?: boolean;
  showDietaryNotes?: boolean;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const RsvpForm: React.FC<RsvpFormProps> = ({
  personName,
  eventDate,
  venueName,
  venueAddress,
  showSongRequest = true,
  showDietaryNotes = true,
}) => {
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"confirmed" | "declined">("confirmed");
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [companionNames, setCompanionNames] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [songRequest, setSongRequest] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rsvpResult, setRsvpResult] = useState<{
    id: number;
    guestName: string;
    vipCode: string;
    status: string;
    adultCount: number;
    childCount: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMessage("Por favor, preencha seu nome completo.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const vipCode = generateVipCode();

      const { data, error } = await supabase.from("rsvps").insert({
        guest_name: guestName,
        email,
        phone,
        status,
        adult_count: adultCount,
        child_count: childCount,
        companion_names: companionNames,
        dietary_notes: dietaryNotes,
        song_request: songRequest,
        vip_code: vipCode,
      }).select().single();

      if (error) throw new Error(error.message);

      setRsvpResult({
        id: data.id,
        guestName: data.guest_name,
        vipCode: data.vip_code,
        status: data.status,
        adultCount: Number(data.adult_count) || 0,
        childCount: Number(data.child_count) || 0,
      });
      setLoading(false);

      if (status === "confirmed") {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#7A1C28", "#D4AF37", "#F3E5AB", "#FFFFFF"],
        });
      }

      // Send confirmation email via Supabase Edge Function
      if (email) {
        supabase.functions.invoke("send-rsvp-email", {
          body: {
            to_email: email,
            to_name: data.guest_name,
            status: data.status,
            vip_code: data.vip_code,
            person_name: personName,
            event_date: new Date(eventDate).toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            event_time: "21h",
            venue_name: venueName,
            venue_address: venueAddress,
            adult_count: data.adult_count,
            child_count: data.child_count,
          },
        }).catch((err) => console.error("Edge function error:", err));
      }
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro ao processar a confirmação.");
      }
    }
  };

  const handleReset = () => {
    setRsvpResult(null);
    setGuestName("");
    setEmail("");
    setPhone("");
    setAdultCount(1);
    setChildCount(0);
    setCompanionNames("");
    setDietaryNotes("");
    setSongRequest("");
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(eventDate).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section id="confirmacao" className="py-20 px-4 bg-marsala-pattern relative">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58111a]/80 border border-[#D4AF37]/40 text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            <CalendarCheck className="w-3.5 h-3.5" /> Confirmação de Presença
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-gold-gradient">
            Confirme sua Presença no Baile
          </h2>
          <p className="text-sm sm:text-base text-rose-200/80 max-w-xl mx-auto">
            Sua presença tornará a noite da {personName} ainda mais inesquecível.
            Por favor, confirme até 15 dias antes do evento.
          </p>
        </div>

        {/* Form or Result Card */}
        {rsvpResult ? (
          <div className="marsala-glass border-2 border-[#D4AF37] p-6 sm:p-10 rounded-3xl space-y-8 animate-fadeIn text-center shadow-2xl">
            {rsvpResult.status === "confirmed" ? (
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                    Presença Confirmada com Sucesso!
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-rose-100">
                    Aguardamos você no Baile Real!
                  </h3>
                  <p className="text-xs sm:text-sm text-rose-200/80">
                    Apresente seu Passe VIP de Entrada na recepção do salão.
                  </p>
                </div>

                {/* VIP Pass Ticket Box */}
                <div id="vip-ticket" className="relative max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-[#400B12] via-[#7A1C28] to-[#26070e] border-2 border-[#D4AF37] shadow-2xl text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
                    <div className="flex items-center gap-2">
                      <VenetianMaskSvg variant="gold" className="w-8 h-8" />
                      <div>
                        <p className="text-xs font-bold font-serif text-gold-gradient uppercase">
                          Passe VIP • 15 Anos
                        </p>
                        <p className="text-[10px] text-rose-300">Baile de Máscaras</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#1a060b] border border-[#D4AF37] rounded text-[10px] font-mono text-amber-300">
                      {rsvpResult.vipCode}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-rose-300 tracking-wider">Convidado Principal</p>
                    <p className="text-lg font-serif font-bold text-amber-200">{rsvpResult.guestName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-rose-100 bg-[#1a060b]/60 p-3 rounded-xl border border-[#D4AF37]/20">
                    <div>
                      <span className="block text-[10px] text-rose-300">Data</span>
                      <span className="font-semibold">{formattedDate}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-rose-300">Total Pessoas</span>
                      <span className="font-semibold">
                        {rsvpResult.adultCount + rsvpResult.childCount}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-[#D4AF37]/10">
                      <span className="block text-[10px] text-rose-300">Local</span>
                      <span className="font-medium">{venueName}</span>
                    </div>
                  </div>

                  {/* QR Code Mockup */}
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-amber-300">
                      <QrCode className="w-8 h-8 text-[#D4AF37]" />
                      <span>Traje: Gala / Esporte Fino com Máscara</span>
                    </div>
                    <div className="text-[9px] text-rose-300 italic">Entrada Individual/Grupo</div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    onClick={handlePrint}
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-amber-950 rounded-xl shadow transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Imprimir / Salvar Passe VIP
                  </button>

                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#58111a] hover:bg-[#7A1C28] text-rose-100 border border-[#D4AF37]/40 rounded-xl transition-all cursor-pointer"
                  >
                    Confirmar Outro Convidado
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-950/80 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-rose-100">
                  Agradecemos seu aviso
                </h3>
                <p className="text-sm text-rose-200/80">
                  Sentiremos sua falta nesta noite tão especial. Sua mensagem foi registrada carinhosamente.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#58111a] hover:bg-[#7A1C28] text-rose-100 border border-[#D4AF37]/40 rounded-xl cursor-pointer"
                >
                  Voltar ao Formulário
                </button>
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="marsala-glass border border-[#D4AF37]/40 p-6 sm:p-10 rounded-3xl space-y-6 shadow-2xl"
          >
            {/* Attendance Toggle */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#D4AF37]">
                Você poderá comparecer ao Baile? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("confirmed")}
                  className={`py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    status === "confirmed"
                      ? "bg-gradient-to-r from-[#7A1C28] to-[#58111a] border-2 border-[#D4AF37] text-amber-200 shadow-lg"
                      : "bg-[#1a060b]/60 border border-[#D4AF37]/20 text-rose-200/60 hover:border-[#D4AF37]/50"
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                  Sim! Estarei presente com certeza
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("declined")}
                  className={`py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    status === "declined"
                      ? "bg-rose-950 border-2 border-rose-500 text-rose-200 shadow-lg"
                      : "bg-[#1a060b]/60 border border-[#D4AF37]/20 text-rose-200/60 hover:border-[#D4AF37]/50"
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Infelizmente não poderei ir
                </button>
              </div>
            </div>

            {/* Name & Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-rose-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#D4AF37]" /> Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Clara Silva"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-sm text-rose-100 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-rose-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> WhatsApp / Telefone
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-sm text-rose-100 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-rose-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" /> E-mail (para envio do comprovante)
              </label>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-sm text-rose-100 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>

            {/* Companion details if confirmed */}
            {status === "confirmed" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#3c0b17]/40 border border-[#D4AF37]/20">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-rose-200 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> Quantidade de Adultos (você incluso)
                    </label>
                    <select
                      value={adultCount}
                      onChange={(e) => setAdultCount(Number(e.target.value))}
                      className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-sm text-rose-100 focus:outline-none focus:border-[#D4AF37]"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Pessoa" : "Pessoas"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-rose-200 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> Crianças (até 10 anos)
                    </label>
                    <select
                      value={childCount}
                      onChange={(e) => setChildCount(Number(e.target.value))}
                      className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-sm text-rose-100 focus:outline-none focus:border-[#D4AF37]"
                    >
                      {[0, 1, 2, 3, 4].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Criança" : "Crianças"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5 pt-2">
                    <label className="block text-xs font-medium text-rose-200">
                      Nome dos Acompanhantes
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos Eduardo (Esposo), Julia (Filha)"
                      value={companionNames}
                      onChange={(e) => setCompanionNames(e.target.value)}
                      className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2 text-xs text-rose-100 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {(showDietaryNotes || showSongRequest) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {showDietaryNotes && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-rose-200 flex items-center gap-1.5">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-[#D4AF37]" /> Restrição
                          Alimentar / Alergias
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Vegetariano, Sem Glúten..."
                          value={dietaryNotes}
                          onChange={(e) => setDietaryNotes(e.target.value)}
                          className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-sm text-rose-100 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    )}

                    {showSongRequest && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-rose-200 flex items-center gap-1.5">
                          <Music2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Pedido de Música para o
                          DJ
                        </label>
                        <input
                          type="text"
                          placeholder="Qual música não pode faltar na pista?"
                          value={songRequest}
                          onChange={(e) => setSongRequest(e.target.value)}
                          className="w-full bg-[#1a060b] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-sm text-rose-100 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Error Display */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-900/80 border border-rose-500 text-rose-200 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-950 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] hover:brightness-110 rounded-2xl shadow-xl shadow-[#D4AF37]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Confirmando Presença...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-amber-950" />
                  <span>Finalizar Confirmação do Convite</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
