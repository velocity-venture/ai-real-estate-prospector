import twilio from "twilio";

let _client: twilio.Twilio | null = null;

function getClient(): twilio.Twilio {
  if (!_client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) throw new Error("Twilio credentials not configured");
    _client = twilio(sid, token);
  }
  return _client;
}

export async function sendSMS(to: string, body: string): Promise<string> {
  const client = getClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) throw new Error("TWILIO_PHONE_NUMBER is not configured");

  const message = await client.messages.create({
    body,
    from: fromNumber,
    to,
  });

  return message.sid;
}
