import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { enviarEmail } from "@/lib/resend";
import { enviarSMS } from "@/lib/twilio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function enDias(n: number) {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export async function GET(req: NextRequest) {
  // Seguridad: Vercel Cron manda este header; o se valida ?secret=
  const auth = req.headers.get("authorization");
  const secretQuery = req.nextUrl.searchParams.get("secret");
  const ok =
    auth === `Bearer ${process.env.CRON_SECRET}` ||
    secretQuery === process.env.CRON_SECRET;
  if (!ok) return NextResponse.json({ error: "no autorizado" }, { status: 401 });

  const supabase = createAdminClient();
  const diasVacuna = Number(process.env.DIAS_AVISO_VACUNA || 14);
  const diasCita = Number(process.env.DIAS_AVISO_CITA || 1);
  const resultados: any[] = [];

  // ---------- VACUNAS próximas ----------
  const { data: vacunas } = await supabase
    .from("vacunas")
    .select("id, nombre, proxima_dosis, paciente:pacientes(nombre,email,telefono)")
    .eq("recordatorio_enviado", false)
    .not("proxima_dosis", "is", null)
    .lte("proxima_dosis", enDias(diasVacuna));

  for (const v of vacunas || []) {
    const pac: any = v.paciente;
    if (!pac) continue;
    const fecha = new Date(v.proxima_dosis).toLocaleDateString("es-MX");
    const msg = `Hola ${pac.nombre}: se acerca la próxima dosis de ${v.nombre} (aprox. ${fecha}). Por favor agenda tu cita comunicándote con el consultorio. — Tu clínica`;

    if (pac.email) await enviarEmail(pac.email, "Recordatorio de vacuna", `<p>${msg}</p>`);
    if (pac.telefono) await enviarSMS(pac.telefono, msg);

    await supabase.from("vacunas").update({ recordatorio_enviado: true }).eq("id", v.id);
    resultados.push({ tipo: "vacuna", paciente: pac.nombre });
  }

  // ---------- CITAS próximas ----------
  const { data: citas } = await supabase
    .from("citas")
    .select("id, fecha, motivo, paciente:pacientes(nombre,email,telefono)")
    .eq("recordatorio_enviado", false)
    .lte("fecha", enDias(diasCita));

  for (const c of citas || []) {
    const pac: any = c.paciente;
    if (!pac) continue;
    const fecha = new Date(c.fecha).toLocaleString("es-MX");
    const msg = `Hola ${pac.nombre}, te recordamos tu cita${c.motivo ? " (" + c.motivo + ")" : ""} el ${fecha}. — Tu clínica`;

    if (pac.email) await enviarEmail(pac.email, "Recordatorio de cita", `<p>${msg}</p>`);
    if (pac.telefono) await enviarSMS(pac.telefono, msg);

    await supabase.from("citas").update({ recordatorio_enviado: true }).eq("id", c.id);
    resultados.push({ tipo: "cita", paciente: pac.nombre });
  }

  return NextResponse.json({ enviados: resultados.length, detalle: resultados });
}
