"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function edadDesde(fecha: string | null): number | null {
  if (!fecha) return null;
  const n = new Date(fecha);
  const hoy = new Date();
  let e = hoy.getFullYear() - n.getFullYear();
  const m = hoy.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) e--;
  return e >= 0 ? e : null;
}

export async function crearPaciente(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fecha_nacimiento = (String(formData.get("fecha_nacimiento")) || "") || null;
  const edadManual = formData.get("edad");
  const edad = edadManual ? Number(edadManual) : edadDesde(fecha_nacimiento);
  const pesoVal = formData.get("peso");

  const { error } = await supabase.from("pacientes").insert({
    nombre: String(formData.get("nombre")),
    fecha_nacimiento,
    edad,
    peso: pesoVal ? Number(pesoVal) : null,
    email: (String(formData.get("email")) || "") || null,
    telefono: (String(formData.get("telefono")) || "") || null,
    notas: (String(formData.get("notas")) || "") || null,
    creado_por: user?.id,
  });

  if (error) redirect("/dashboard/pacientes/nuevo?error=" + encodeURIComponent(error.message));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function agregarVacuna(formData: FormData) {
  const supabase = await createClient();
  const paciente_id = String(formData.get("paciente_id"));
  const { error } = await supabase.from("vacunas").insert({
    paciente_id,
    nombre: String(formData.get("nombre")),
    fecha_aplicada: (String(formData.get("fecha_aplicada")) || "") || null,
    proxima_dosis: (String(formData.get("proxima_dosis")) || "") || null,
  });
  if (!error) revalidatePath(`/dashboard/pacientes/${paciente_id}`);
}

export async function agregarCita(formData: FormData) {
  const supabase = await createClient();
  const paciente_id = String(formData.get("paciente_id"));
  const { error } = await supabase.from("citas").insert({
    paciente_id,
    fecha: String(formData.get("fecha")),
    motivo: (String(formData.get("motivo")) || "") || null,
  });
  if (!error) revalidatePath(`/dashboard/pacientes/${paciente_id}`);
}

export async function aplicarCartilla(formData: FormData) {
  const supabase = await createClient();
  const paciente_id = String(formData.get("paciente_id"));
  const nombre = String(formData.get("nombre")); // "Pentavalente acelular — 1a dosis"
  const intervalo = formData.get("intervalo_meses");

  const hoy = new Date();
  let proxima: string | null = null;
  if (intervalo && Number(intervalo) > 0) {
    const d = new Date(hoy);
    d.setMonth(d.getMonth() + Number(intervalo));
    proxima = d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  const { error } = await supabase.from("vacunas").insert({
    paciente_id,
    nombre,
    fecha_aplicada: hoy.toISOString().slice(0, 10),
    proxima_dosis: proxima,
    recordatorio_enviado: false,
  });

  if (!error) revalidatePath(`/dashboard/pacientes/${paciente_id}`);
}

export async function borrarVacuna(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("vacuna_id"));
  const paciente_id = String(formData.get("paciente_id"));
  await supabase.from("vacunas").delete().eq("id", id);
  revalidatePath(`/dashboard/pacientes/${paciente_id}`);
}

export async function borrarPaciente(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("paciente_id"));
  await supabase.from("pacientes").delete().eq("id", id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
