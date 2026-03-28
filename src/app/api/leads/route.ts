import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, brand, personality, vibe, size, config, event, urgency, language } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate a slug based on brand name for the presentation route /p/[brandname]
    let slug = "";
    if (brand && brand.name) {
      slug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    } else {
      // Fallback if no brand name
      slug = "lead-" + Date.now().toString(36);
    }

    const leadData = {
      email,
      brand: brand || null,
      brandUrl: brand?.url || null, // Keeping for backward compatibility
      personality: personality || null,
      vibe: vibe || null,
      size: size || null,
      config: config || null,
      event: event || null,
      urgency: urgency || null,
      language: language || "en",
      slug,
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("leads").add(leadData);

    return NextResponse.json({ success: true, lead: { id: docRef.id, ...leadData } });
  } catch (error) {
    console.error("Failed to insert lead:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
