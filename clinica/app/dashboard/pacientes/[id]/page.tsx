import { createClient } from "@/lib/supabase/server";
import { agregarVacuna, agregarCita, borrarPaciente } from "../actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DetallePaciente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: p } = await supabase.from("pacientes").select("*").eq("id", id).single();
  if (!p) notFound();

  const { data: vacunas } = await supabase
    .from("vacunas").select("*").eq("paciente_id", id)
    .order("proxima_dosis", { ascending: true });

  const { data: citas } = await supabase
    .from("citas").select("*").eq("paciente_id", id)
    .order("fecha", { ascending: true });

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const fmtH = (d: string) =>
    new Date(d).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-slate-500">←</Link>
        <h1 className="text-xl font-bold flex-1">{p.nombre}</h1>
        <form action={borrarPaciente}>
          <input type="hidden" name="paciente_id" value={p.id} />
          <button className="text-sm text-red-600">Eliminar</button>
        </form>
      </div>

      {/* Datos */}
      <div className="bg-white rounded-2xl p-5 grid grid-cols-2 gap-y-3 text-sm">
        <Dato k="Edad" v={p.edad ? `${p.edad} años` : "—"} />
        <Dato k="Peso" v={p.peso ? `${p.peso} kg` : "—"} />
        <Dato k="Nacimiento" v={fmt(p.fecha_nacimiento)} />
        <Dato k="Teléfono" v={p.telefono || "—"} />
        <Dato k="Correo" v={p.email || "—"} full />
        {p.notas && <Dato k="Notas" v={p.notas} full />}
      </div>

      {/* Vacunas */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Vacunas</h2>
        {vacunas && vacunas.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {vacunas.map((v) => (
              <li key={v.id} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span>{v.nombre}</span>
                <span className="text-slate-500">
                  próx: {fmt(v.proxima_dosis)} {v.recordatorio_enviado ? "✅" : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 mb-4">Sin vacunas registradas.</p>
        )}
        <form action={agregarVacuna} className="space-y-2">
          <input type="hidden" name="paciente_id" value={p.id} />
          <input name="nombre" required placeholder="Nombre de la vacuna"
            className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500">Aplicada</label>
              <input name="fecha_aplicada" type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Próxima dosis</label>
              <input name="proxima_dosis" type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
          </div>
          <button className="w-full bg-slate-800 text-white rounded-lg py-2 text-sm">+ Agregar vacuna</button>
        </form>
      </section>

      {/* Citas */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Citas</h2>
        {citas && citas.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {citas.map((c) => (
              <li key={c.id} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span>{c.motivo || "Cita"}</span>
                <span className="text-slate-500">
                  {fmtH(c.fecha)} {c.recordatorio_enviado ? "✅" : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 mb-4">Sin citas registradas.</p>
        )}
        <form action={agregarCita} className="space-y-2">
          <input type="hidden" name="paciente_id" value={p.id} />
          <input name="motivo" placeholder="Motivo (opcional)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <input name="fecha" type="datetime-local" required
            className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <button className="w-full bg-slate-800 text-white rounded-lg py-2 text-sm">+ Agregar cita</button>
        </form>
      </section>
    </div>
  );
}

function Dato({ k, v, full }: { k: string; v: string; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="text-slate-400 text-xs">{k}</div>
      <div>{v}</div>
    </div>
  );
}
