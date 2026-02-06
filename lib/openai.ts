import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

export async function generateOutreachMessages(
  ownerName: string,
  address: string,
  equityPercent: number,
  yearsOwned: number
): Promise<{ emailContent: string; smsContent: string }> {
  const openai = getClient();

  const prompt = `You are a real estate investor's outreach assistant. Generate a personalized cold email and SMS for a potential seller.

Property details:
- Owner: ${ownerName}
- Address: ${address}
- Equity: ${equityPercent}%
- Years owned: ${yearsOwned}

Generate TWO messages:

1. EMAIL: A professional but warm cold email (3-4 paragraphs) expressing interest in purchasing their property. Mention specific details about ownership duration and equity position. Include a clear call-to-action.

2. SMS: A brief, friendly text message (under 160 characters) introducing yourself as an interested buyer.

Format your response as:
EMAIL:
[email content]

SMS:
[sms content]`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 800,
  });

  const text = response.choices[0]?.message?.content || "";
  const emailMatch = text.match(/EMAIL:\s*([\s\S]*?)(?=SMS:|$)/i);
  const smsMatch = text.match(/SMS:\s*([\s\S]*?)$/i);

  return {
    emailContent: emailMatch?.[1]?.trim() || "Unable to generate email content.",
    smsContent: smsMatch?.[1]?.trim() || "Hi, interested in your property. Can we chat?",
  };
}
