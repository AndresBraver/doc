import { Resend } from "resend";

export async function enviarEmail(para: string, asunto: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "Sin RESEND_API_KEY" };
  try {
    const resend = new Resend(key);
    await resend.emails.send({
      from: process.env.RESEND_FROM || "Clinica <onboarding@resend.dev>",
      to: para,
      subject: asunto,
      html,
    });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "error email" };
  }
}
