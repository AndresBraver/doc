import { createClient } from "@/lib/supabase/server";
import { agregarVacuna, agregarCita, borrarPaciente, aplicarCartilla, borrarVacuna } from "../actions";
import { CARTILLA } from "@/lib/cartilla";
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

  // Mapa de dosis ya aplicadas (por nombre) -> fecha
  const aplicadas = new Map<string, string>();
  (vacunas || []).forEach((v) => {
    if (v.fecha_aplicada) aplicadas.set(v.nombre, v.fecha_aplicada);
  });

  const fmt = (d: string | null) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—";
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

      {/* CARTILLA NACIONAL */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-semibold">Cartilla Nacional de Vacunación</h2>
        <p className="text-xs text-slate-400 mb-4">
          Toca “Aplicar” cuando le pongas la dosis. La próxima cita se calcula sola y el
          recordatorio sale una semana antes.
        </p>

        <div className="space-y-5">
          {CARTILLA.map((vac) => (
            <div key={vac.id}>
              <div className="font-medium text-sm">{vac.nombre}</div>
              <div className="text-xs text-slate-400 mb-2">Protege contra: {vac.protege}</div>
              <ul className="space-y-1.5">
                {vac.dosis.map((d, i) => {
                  const nombreCompleto = `${vac.nombre} — ${d.etiqueta}`;
                  const yaAplicada = aplicadas.get(nombreCompleto);
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 text-sm border-b border-slate-100 pb-1.5"
                    >
                      <div className="min-w-0">
                        <div className={yaAplicada ? "line-through text-slate-400" : ""}>
                          {d.etiqueta}
                        </div>
                        <div className="text-xs text-slate-400">{d.edad}</div>
                      </div>
                      {yaAplicada ? (
                        <span className="text-green-600 text-xs whitespace-nowrap">
                          ✅ {fmt(yaAplicada)}
                        </span>
                      ) : (
                        <form action={aplicarCartilla}>
                          <input type="hidden" name="paciente_id" value={p.id} />
                          <input type="hidden" name="nombre" value={nombreCompleto} />
                          <input type="hidden" name="intervalo_meses" value={d.intervaloMeses ?? ""} />
                          <button className="bg-marca text-white rounded-lg px-3 py-1.5 text-xs whitespace-nowrap active:bg-marcaOscuro">
                            Aplicar hoy
                          </button>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Próximas dosis (calculadas) */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Vacunas aplicadas y próximas dosis</h2>
        {vacunas && vacunas.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {vacunas.map((v) => (
              <li key={v.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="min-w-0">{v.nombre}</span>
                <span className="flex items-center gap-2 text-slate-500 whitespace-nowrap">
                  {v.proxima_dosis ? `próx: ${fmt(v.proxima_dosis)}` : "—"}
                  {v.recordatorio_enviado ? "✅" : ""}
                  <form action={borrarVacuna}>
                    <input type="hidden" name="vacuna_id" value={v.id} />
                    <input type="hidden" name="paciente_id" value={p.id} />
                    <button className="text-red-400 text-xs">✕</button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 mb-4">Sin vacunas registradas.</p>
        )}

        {/* Vacuna manual (fuera de cartilla) */}
        <details>
          <summary className="text-sm text-slate-500 cursor-pointer">Agregar vacuna manual</summary>
          <form action={agregarVacuna} className="space-y-2 mt-3">
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
            <button className="w-full bg-slate-800 text-white rounded-lg py-2 text-sm">+ Agregar</button>
          </form>
        </details>
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
