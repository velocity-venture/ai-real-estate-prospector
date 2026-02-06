import sgMail from "@sendgrid/mail";

let _initialized = false;

function init() {
  if (!_initialized) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error("SENDGRID_API_KEY is not configured");
    sgMail.setApiKey(apiKey);
    _initialized = true;
  }
}

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  init();
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  if (!fromEmail) throw new Error("SENDGRID_FROM_EMAIL is not configured");

  await sgMail.send({
    to,
    from: fromEmail,
    subject,
    text: body,
    html: body.replace(/\n/g, "<br>"),
  });
}
