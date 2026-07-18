import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface EmailPayload {
  to_email: string;
  to_name: string;
  status: "confirmed" | "declined";
  vip_code?: string;
  person_name: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_address: string;
  adult_count: number;
  child_count: number;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload: EmailPayload = await req.json();

    const subject =
      payload.status === "confirmed"
        ? "Presença Confirmada - Baile de Máscaras da " + payload.person_name
        : "Confirmação Recebida - Baile de Máscaras da " + payload.person_name;

    const html =
      payload.status === "confirmed"
        ? `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1a060b; color: #fce4ec; padding: 40px; border-radius: 16px; border: 2px solid #D4AF37;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; font-size: 28px; margin: 0;">Baile de Máscaras</h1>
          <p style="color: #D4AF37; font-size: 14px; text-transform: uppercase; letter-spacing: 4px;">15 Anos da ${payload.person_name}</p>
        </div>

        <div style="background: #2b0811; border-radius: 12px; padding: 30px; border: 1px solid #D4AF37/30; text-align: center;">
          <h2 style="color: #D4AF37; font-size: 22px; margin-top: 0;">Presença Confirmada! 🎭</h2>
          <p style="font-size: 16px; line-height: 1.6;">Olá <strong style="color: #D4AF37;">${payload.to_name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">É com muita alegria que confirmamos sua presença no Baile de Máscaras da <strong style="color: #D4AF37;">${payload.person_name}</strong>!</p>

          <div style="background: #1a060b; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #D4AF37;">
            <p style="margin: 8px 0;"><strong style="color: #D4AF37;">Data:</strong> ${payload.event_date}</p>
            <p style="margin: 8px 0;"><strong style="color: #D4AF37;">Horário:</strong> ${payload.event_time}</p>
            <p style="margin: 8px 0;"><strong style="color: #D4AF37;">Local:</strong> ${payload.venue_name}</p>
            <p style="margin: 8px 0; font-size: 13px;">${payload.venue_address}</p>
          </div>

          ${payload.vip_code ? `
          <div style="background: #400B12; border-radius: 8px; padding: 15px; margin: 20px 0; border: 2px solid #D4AF37;">
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; margin: 0 0 5px;">Seu Passe VIP</p>
            <p style="font-size: 24px; font-family: monospace; color: #D4AF37; margin: 0; letter-spacing: 4px;">${payload.vip_code}</p>
            <p style="font-size: 11px; color: #fce4ec; margin: 8px 0 0;">Apresente este código na recepção do evento</p>
          </div>
          ` : ""}

          <p style="font-size: 13px; color: #fce4ec/70; margin-top: 20px;">Traje: Esporte Fino / Gala com Máscara Decorativa</p>
          <p style="font-size: 13px; color: #fce4ec/70;">A cor Marsala é exclusiva da aniversariante!</p>
        </div>

        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #D4AF37/60;">
          <p>Aguardamos você para esta noite mágica!</p>
          <p style="font-size: 11px;">🎭 ${payload.person_name} & Família</p>
        </div>
      </div>
      `
        : `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1a060b; color: #fce4ec; padding: 40px; border-radius: 16px; border: 2px solid #D4AF37;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; font-size: 28px; margin: 0;">Baile de Máscaras</h1>
          <p style="color: #D4AF37; font-size: 14px; text-transform: uppercase; letter-spacing: 4px;">15 Anos da ${payload.person_name}</p>
        </div>

        <div style="background: #2b0811; border-radius: 12px; padding: 30px; border: 1px solid #D4AF37/30; text-align: center;">
          <h2 style="color: #D4AF37; font-size: 22px; margin-top: 0;">Confirmação Recebida 💌</h2>
          <p style="font-size: 16px; line-height: 1.6;">Olá <strong style="color: #D4AF37;">${payload.to_name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">Recebemos sua confirmação e agradecemos o aviso. <strong style="color: #D4AF37;">Sentiremos sua falta</strong> nesta noite tão especial, mas compreendemos perfeitamente.</p>
          <p style="font-size: 16px; line-height: 1.6;">Que possamos celebrar juntos em uma próxima ocasião!</p>
        </div>

        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #D4AF37/60;">
          <p>Com carinho,</p>
          <p style="font-size: 11px;">🎭 ${payload.person_name} & Família</p>
        </div>
      </div>
      `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Baile de Máscaras <onboarding@resend.dev>`,
        to: payload.to_email,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
};

serve(handler);
