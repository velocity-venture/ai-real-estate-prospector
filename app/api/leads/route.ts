import { NextRequest, NextResponse } from "next/server";
import { supabase, Lead } from "@/lib/supabase";
import { calculateIntentScore } from "@/lib/scoring";
import { fetchPropertiesByZip } from "@/lib/attom";
import { generateOutreachMessages } from "@/lib/openai";

export const dynamic = "force-dynamic";

const DEMO_STREETS = [
  "Oak", "Maple", "Cedar", "Pine", "Elm", "Birch", "Walnut", "Willow",
  "Hickory", "Magnolia", "Cherry", "Peach", "Dogwood", "Spruce", "Poplar",
  "Ash", "Cypress", "Juniper", "Redwood", "Sycamore", "Chestnut", "Hemlock",
  "Cottonwood", "Aspen", "Beech", "Alder", "Sequoia", "Holly", "Laurel", "Ivy",
  "Hawthorn", "Mesquite", "Mulberry", "Olive", "Persimmon", "Tamarack", "Yew",
  "Linden", "Buckeye", "Palmetto", "Sassafras", "Catalpa", "Mimosa", "Locust",
  "Sumac", "Sweetgum", "Tulip", "Basswood", "Hackberry", "Boxelder",
];

const DEMO_FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Barbara", "William", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
  "Timothy", "Deborah",
];

const DEMO_LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts",
];

function generateDemoLeads(zipCode: string): Lead[] {
  return Array.from({ length: 50 }, (_, i) => {
    const equityPercent = Math.round(50 + Math.random() * 50);
    const yearsOwned = Math.round(7 + Math.random() * 25);
    const intentScore = calculateIntentScore(equityPercent, yearsOwned);
    const firstName = DEMO_FIRST_NAMES[i % DEMO_FIRST_NAMES.length];
    const lastName = DEMO_LAST_NAMES[i % DEMO_LAST_NAMES.length];
    const streetNum = 100 + Math.floor(Math.random() * 9900);
    const street = DEMO_STREETS[i % DEMO_STREETS.length];

    return {
      zip_code: zipCode,
      address: `${streetNum} ${street} St, ${zipCode}`,
      owner_name: `${lastName}, ${firstName}`,
      owner_phone: `(${Math.floor(200 + Math.random() * 800)}) ${Math.floor(200 + Math.random() * 800)}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      owner_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      equity_percent: equityPercent,
      years_owned: yearsOwned,
      intent_score: intentScore,
      email_content: `Dear ${firstName},\n\nI noticed you've owned your property at ${streetNum} ${street} St for ${yearsOwned} years. With approximately ${equityPercent}% equity, your property is an excellent investment.\n\nI'm a local real estate investor interested in making you a fair cash offer. This would be a quick, hassle-free transaction with no agent commissions.\n\nWould you be open to a brief conversation? I'd love to discuss the possibilities.\n\nBest regards,\nYour Real Estate Partner`,
      sms_content: `Hi ${firstName}! I'm interested in your property on ${street} St. Would you consider a cash offer? Reply YES to learn more.`,
      email_sent: false,
      sms_sent: false,
    };
  });
}

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip");

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Valid 5-digit ZIP code required" }, { status: 400 });
  }

  const isDemo = process.env.DEMO_MODE === "true" || (!process.env.ATTOM_API_KEY && !process.env.OPENAI_API_KEY);

  try {
    let leads: Lead[];

    if (isDemo) {
      leads = generateDemoLeads(zip);
    } else {
      const properties = await fetchPropertiesByZip(zip);

      leads = await Promise.all(
        properties.map(async (prop) => {
          const intentScore = calculateIntentScore(prop.equityPercent, prop.yearsOwned);
          let emailContent: string | null = null;
          let smsContent: string | null = null;

          try {
            const messages = await generateOutreachMessages(
              prop.ownerName,
              prop.address,
              prop.equityPercent,
              prop.yearsOwned
            );
            emailContent = messages.emailContent;
            smsContent = messages.smsContent;
          } catch {
            emailContent = null;
            smsContent = null;
          }

          return {
            zip_code: zip,
            address: prop.address,
            owner_name: prop.ownerName,
            owner_phone: prop.ownerPhone,
            owner_email: prop.ownerEmail,
            equity_percent: prop.equityPercent,
            years_owned: prop.yearsOwned,
            intent_score: intentScore,
            email_content: emailContent,
            sms_content: smsContent,
            email_sent: false,
            sms_sent: false,
          };
        })
      );
    }

    // Save to Supabase
    try {
      const { error } = await supabase.from("leads").insert(leads);
      if (error) console.error("Supabase insert error:", error);
    } catch {
      console.error("Supabase not configured — leads returned but not persisted");
    }

    return NextResponse.json({ leads, count: leads.length, demo: isDemo });
  } catch (err) {
    console.error("Lead generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
