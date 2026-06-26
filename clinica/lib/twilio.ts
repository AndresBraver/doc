import twilio from "twilio";

export async function enviarSMS(para: string, texto: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) return { ok: false, error: "Sin credenciales Twilio" };
  try {
    const client = twilio(sid, token);
    await client.messages.create({ body: texto, from, to: para });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "error sms" };
  }
}
