import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { senderName, imageUrl, isApproved } = await request.json();

  if (!senderName || !imageUrl) {
    return NextResponse.json({ error: "senderName e imageUrl são obrigatórios" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { data, error } = await supabase
    .from("guest_photos")
    .insert({ sender_name: senderName, image_url: imageUrl, ip_address: ip, is_approved: isApproved ?? true })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
