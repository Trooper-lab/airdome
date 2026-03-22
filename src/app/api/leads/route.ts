import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, brandUrl, personality, vibe, size, config, event } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const leadData = {
      email,
      brandUrl: brandUrl || null,
      personality: personality || null,
      vibe: vibe || null,
      size: size || null,
      config: config || null,
      event: event || null,
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("leads").add(leadData);

    return NextResponse.json({ success: true, lead: { id: docRef.id, ...leadData } });
  } catch (error) {
    console.error("Failed to insert lead:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
