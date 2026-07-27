"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { EventDetails } from "@/components/EventDetails";
import { RsvpForm } from "@/components/RsvpForm";
import { GiftRegistry } from "@/components/GiftRegistry";
import { MessageBoard } from "@/components/MessageBoard";
import { PhotoGallery } from "@/components/PhotoGallery";
import { Footer } from "@/components/Footer";
import { AdminPanel } from "@/components/AdminPanel";
import { supabase } from "@/lib/supabase";

const defaultEventData = {
  personName: "Ketty",
  age: 15,
  tagline: "Um Grandioso Baile de Máscaras em Marsala & Ouro",
  eventDate: "2026-09-25T21:00:00-03:00",
  venueName: "Buffet Ana Jacob & Eventos",
  venueAddress: "Avenida José Carlos Fernandes, 113 - Terras de São João, Jacareí - SP",
  mapUrl: "https://share.google/FYdTBcdrhYhiPER2I",
  dressCodeTitle: "Traje Esporte Fino / Gala com Máscara Decorativa",
  dressCodeDesc: "Venha vestido com requinte e traga sua máscara misteriosa. LEMBRE-SE: A cor MARSALA é exclusiva da aniversariante!",
  pixKey: "aniversariodaketty15anos@gmail.com",
  pixKeyType: "Chave E-mail",
  pixName: "Ketty (15 Anos)",
  pixCity: "São Paulo",
  welcomeMessage: "É com imenso carinho e alegria que convido você para compartilhar comigo a celebração mágica do meu aniversário de 15 anos em um misterioso e inesquecível Baile de Máscaras!",
  showSongRequest: true,
  showDietaryNotes: true,
};

export default function HomePage() {
  const [eventData, setEventData] = useState(defaultEventData);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const fetchEventData = async () => {
    const { data } = await supabase.from("event_info").select("*").limit(1).single();
    if (data) {
      setEventData({
        personName: data.person_name,
        age: data.age,
        tagline: data.tagline,
        eventDate: data.event_date,
        venueName: data.venue_name,
        venueAddress: data.venue_address,
        mapUrl: data.map_url,
        dressCodeTitle: data.dress_code_title,
        dressCodeDesc: data.dress_code_desc,
        pixKey: data.pix_key,
        pixKeyType: data.pix_key_type,
        pixName: data.pix_name,
        pixCity: data.pix_city,
        welcomeMessage: data.welcome_message,
        showSongRequest: data.show_song_request ?? true,
        showDietaryNotes: data.show_dietary_notes ?? true,
      });
    }
  };

  useEffect(() => {
    fetchEventData();
  }, []);

  const scrollToRsvp = () => {
    const el = document.getElementById("confirmacao");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#1a060b] text-rose-100 selection:bg-[#7A1C28] selection:text-[#D4AF37]">
      <Navbar
        personName={eventData.personName}
        age={eventData.age}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenRsvpModal={scrollToRsvp}
      />

      <main>
        <HeroSection
          personName={eventData.personName}
          age={eventData.age}
          tagline={eventData.tagline}
          eventDate={eventData.eventDate}
          venueName={eventData.venueName}
          welcomeMessage={eventData.welcomeMessage}
          onOpenRsvp={scrollToRsvp}
        />

        <EventDetails
          personName={eventData.personName}
          eventDate={eventData.eventDate}
          venueName={eventData.venueName}
          venueAddress={eventData.venueAddress}
          mapUrl={eventData.mapUrl}
          dressCodeTitle={eventData.dressCodeTitle}
          dressCodeDesc={eventData.dressCodeDesc}
        />

        <RsvpForm
          personName={eventData.personName}
          eventDate={eventData.eventDate}
          venueName={eventData.venueName}
          venueAddress={eventData.venueAddress}
          showSongRequest={eventData.showSongRequest}
          showDietaryNotes={eventData.showDietaryNotes}
        />

        <GiftRegistry
          pixKey={eventData.pixKey}
          pixKeyType={eventData.pixKeyType}
          pixName={eventData.pixName}
          pixCity={eventData.pixCity}
        />

        <MessageBoard />

        <PhotoGallery personName={eventData.personName} />
      </main>

      <Footer
        personName={eventData.personName}
        age={eventData.age}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onEventUpdated={fetchEventData}
      />
    </div>
  );
}
