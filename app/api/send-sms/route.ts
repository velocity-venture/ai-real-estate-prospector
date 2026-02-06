import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendSMS } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zip_code } = body;

    if (!zip_code) {
      return NextResponse.json({ error: "zip_code is required" }, { status: 400 });
    }

    const isDemo = process.env.DEMO_MODE === "true" || !process.env.TWILIO_ACCOUNT_SID;

    // Fetch top 10 leads with SMS content that haven't been sent
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("zip_code", zip_code)
      .eq("sms_sent", false)
      .not("sms_content", "is", null)
      .not("owner_phone", "is", null)
      .order("intent_score", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: "No unsent leads with SMS content found" }, { status: 404 });
    }

    let sent = 0;
    const results: { id: string; status: string }[] = [];

    for (const lead of leads) {
      try {
        if (isDemo) {
          // Simulate sending
          await new Promise((r) => setTimeout(r, 100));
        } else {
          await sendSMS(lead.owner_phone, lead.sms_content);
        }

        // Mark as sent
        await supabase.from("leads").update({ sms_sent: true, updated_at: new Date().toISOString() }).eq("id", lead.id);
        sent++;
        results.push({ id: lead.id, status: "sent" });
      } catch (err) {
        results.push({ id: lead.id, status: `failed: ${err instanceof Error ? err.message : "unknown"}` });
      }
    }

    return NextResponse.json({ sent, total: leads.length, results, demo: isDemo });
  } catch (err) {
    console.error("SMS sending error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send SMS" },
      { status: 500 }
    );
  }
}
