import { crearPaciente } from "../actions";
import Link from "next/link";

export default async function NuevoPaciente({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-slate-500">←</Link>
        <h1 className="text-xl font-bold">Nuevo paciente</h1>
      </div>

      {sp.error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{sp.error}</div>
      )}

      <form action={crearPaciente} className="bg-white rounded-2xl p-5 space-y-4">
        <Campo label="Nombre completo" name="nombre" required />
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Fecha de nacimiento" name="fecha_nacimiento" type="date" />
          <Campo label="Edad (opcional)" name="edad" type="number" />
        </div>
        <Campo label="Peso (kg)" name="peso" type="number" step="0.1" />
        <Campo label="Correo" name="email" type="email" />
        <Campo label="Teléfono (con lada, ej. +52...)" name="telefono" type="tel" />
        <div>
          <label className="block text-sm text-slate-600 mb-1">Notas</label>
          <textarea name="notas" rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
        </div>
        <button className="w-full bg-marca text-white rounded-lg py-3 font-medium active:bg-marcaOscuro">
          Guardar paciente
        </button>
      </form>
    </div>
  );
}

function Campo({
  label, name, type = "text", required = false, step,
}: {
  label: string; name: string; type?: string; required?: boolean; step?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      <input name={name} type={type} required={required} step={step}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
    </div>
  );
}
