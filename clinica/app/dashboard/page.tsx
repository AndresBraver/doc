import { createClient } from "@/lib/supabase/server";
import { calcEdad } from "@/lib/fechas";
import Link from "next/link";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("pacientes")
    .select("id, nombre, fecha_nacimiento, telefono, email")
    .order("creado_en", { ascending: false });

  if (q && q.trim()) {
    query = query.ilike("nombre", `%${q.trim()}%`);
  }

  const { data: pacientes } = await query;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Pacientes</h1>
        <Link
          href="/dashboard/pacientes/nuevo"
          className="bg-marca text-white text-sm rounded-lg px-4 py-2 font-medium active:bg-marcaOscuro"
        >
          + Nuevo
        </Link>
      </div>

      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Buscar paciente por nombre…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 bg-white"
        />
        <button className="bg-slate-800 text-white rounded-lg px-4 text-sm">Buscar</button>
      </form>
      {q && (
        <Link href="/dashboard" className="text-sm text-marca">
          ← Ver todos
        </Link>
      )}

      {!pacientes || pacientes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
          {q
            ? `No se encontró ningún paciente con "${q}".`
            : "Aún no hay pacientes. Toca + Nuevo para registrar el primero."}
        </div>
      ) : (
        <ul className="space-y-2">
          {pacientes.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/pacientes/${p.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm active:bg-slate-50"
              >
                <div className="font-medium">{p.nombre}</div>
                <div className="text-sm text-slate-500">
                  {p.fecha_nacimiento ? `${calcEdad(p.fecha_nacimiento)} · ` : ""}
                  {p.telefono || p.email || "sin contacto"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
