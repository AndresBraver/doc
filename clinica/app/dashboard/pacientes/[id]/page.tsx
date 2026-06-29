import { createClient } from "@/lib/supabase/server";
import {
  agregarVacuna, borrarPaciente, aplicarCartilla, borrarVacuna, actualizarMedidas,
} from "../actions";
import { CARTILLA } from "@/lib/cartilla";
import { calcEdad, fechaEsperada, sumarMeses } from "@/lib/fechas";
import { percentilOMS, edadEnMeses } from "@/lib/percentiles";
import GraficaCrecimiento from "./GraficaCrecimiento";
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

  const aplicadas = new Map<string, string>();
  (vacunas || []).forEach((v) => {
    if (v.fecha_aplicada) aplicadas.set(v.nombre, v.fecha_aplicada);
  });

  const nac = p.fecha_nacimiento as string | null;
  const sexo = (p.sexo as "male" | "female" | null) ?? null;
  const mesesExactos = edadEnMeses(nac);
  const hoy = new Date();

  const pPeso = percentilOMS("weight", sexo, mesesExactos, p.peso);
  const pTalla = percentilOMS("height", sexo, mesesExactos, p.talla);

  const fmt = (d: string | null) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const fmtH = (d: string) =>
    new Date(d).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const sexoTxt = sexo === "male" ? "Niño" : sexo === "female" ? "Niña" : "—";

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
        <Dato k="Edad" v={calcEdad(nac)} />
        <Dato k="Sexo" v={sexoTxt} />
        <Dato k="Nacimiento" v={fmt(nac)} />
        <Dato k="Teléfono" v={p.telefono || "—"} />
        <Dato k="Correo" v={p.email || "—"} full />
        {p.notas && <Dato k="Notas" v={p.notas} full />}
      </div>

      {/* CRECIMIENTO + PERCENTILES OMS */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-semibold mb-1">Crecimiento</h2>
        <p className="text-xs text-slate-400 mb-4">
          El punto azul es tu paciente; la línea verde es el promedio (OMS, el que usa México). Se
          recalcula con cada medición.
        </p>

        <div className="space-y-5 mb-4">
          <GraficaCrecimiento
            medida="weight" sexo={sexo} edadMeses={mesesExactos}
            valor={p.peso} titulo="Peso para la edad" unidad="kg"
          />
          <GraficaCrecimiento
            medida="height" sexo={sexo} edadMeses={mesesExactos}
            valor={p.talla} titulo="Estatura para la edad" unidad="cm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Medida titulo="Peso" valor={p.peso ? `${p.peso} kg` : "—"} res={pPeso} />
          <Medida titulo="Estatura/altura" valor={p.talla ? `${p.talla} cm` : "—"} res={pTalla} />
        </div>

        <details>
          <summary className="text-sm text-marca cursor-pointer">Actualizar medidas</summary>
          <form action={actualizarMedidas} className="grid grid-cols-3 gap-2 mt-3">
            <input type="hidden" name="paciente_id" value={p.id} />
            <div>
              <label className="text-xs text-slate-500">Peso (kg)</label>
              <input name="peso" type="number" step="0.1" defaultValue={p.peso ?? ""}
                className="w-full rounded-lg border border-slate-300 px-2 py-2" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Estatura/altura (cm)</label>
              <input name="talla" type="number" step="0.1" defaultValue={p.talla ?? ""}
                className="w-full rounded-lg border border-slate-300 px-2 py-2" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Sexo</label>
              <select name="sexo" defaultValue={sexo ?? ""}
                className="w-full rounded-lg border border-slate-300 px-2 py-2 bg-white">
                <option value="">—</option>
                <option value="male">Niño</option>
                <option value="female">Niña</option>
              </select>
            </div>
            <button className="col-span-3 bg-slate-800 text-white rounded-lg py-2 text-sm mt-1">
              Guardar y recalcular
            </button>
          </form>
        </details>
      </section>

      {/* CARTILLA NACIONAL */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-semibold">Cartilla Nacional de Vacunación</h2>
        <p className="text-xs text-slate-400 mb-4">
          {nac
            ? "Toca “Aplicar” cuando le pongas la dosis. La próxima queda agendada y el recordatorio para que agenden cita sale 2 semanas antes."
            : "⚠️ Registra la fecha de nacimiento para calcular las fechas de cada dosis."}
        </p>

        <div className="space-y-5">
          {CARTILLA.map((vac) => (
            <div key={vac.id}>
              <div className="font-medium text-sm">{vac.nombre}</div>
              <div className="text-xs text-slate-400 mb-2">Previene: {vac.protege}</div>
              <ul className="space-y-1.5">
                {vac.dosis.map((d, i) => {
                  const nombreCompleto = `${vac.nombre} — ${d.etiqueta}`;
                  const yaAplicada = aplicadas.get(nombreCompleto);
                  const esperadaEsta = fechaEsperada(nac, d.edadMeses);
                  const sig = vac.dosis[i + 1];
                  let proxima: string | null = null;
                  if (d.anual) proxima = sumarMeses(hoy, 12);
                  else if (sig)
                    proxima =
                      fechaEsperada(nac, sig.edadMeses) ||
                      (sig.edadMeses != null && d.edadMeses != null
                        ? sumarMeses(hoy, sig.edadMeses - d.edadMeses)
                        : null);

                  return (
                    <li key={i} className="flex items-center justify-between gap-2 text-sm border-b border-slate-100 pb-1.5">
                      <div className="min-w-0">
                        <div className={yaAplicada ? "line-through text-slate-400" : ""}>
                          {d.etiqueta} <span className="text-slate-400">· {d.edad}</span>
                        </div>
                        {!yaAplicada && esperadaEsta && (
                          <div className="text-xs text-marca">toca aprox: {fmt(esperadaEsta)}</div>
                        )}
                      </div>
                      {yaAplicada ? (
                        <span className="text-green-600 text-xs whitespace-nowrap">✅ {fmt(yaAplicada)}</span>
                      ) : (
                        <form action={aplicarCartilla}>
                          <input type="hidden" name="paciente_id" value={p.id} />
                          <input type="hidden" name="nombre" value={nombreCompleto} />
                          <input type="hidden" name="proxima_dosis" value={proxima ?? ""} />
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

      {/* Vacunas aplicadas y próximas */}
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

        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-sm font-medium mb-2">Agregar vacuna</h3>
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
        </div>
      </section>

      {/* Próximas citas (las agenda el paciente) */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-semibold mb-1">Citas</h2>
        <p className="text-xs text-slate-400 mb-3">
          Las citas las agenda el paciente. Cuando se acerca una dosis, le llega el recordatorio para agendar.
        </p>
        {citas && citas.length > 0 ? (
          <ul className="space-y-2">
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
          <p className="text-sm text-slate-400">Sin citas agendadas todavía.</p>
        )}
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

function Medida({
  titulo, valor, res,
}: {
  titulo: string;
  valor: string;
  res: { percentil: number; etiqueta: string; color: string } | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-xs text-slate-400">{titulo}</div>
      <div className="text-lg font-semibold">{valor}</div>
      {res ? (
        <div className="text-xs mt-1" style={{ color: res.color }}>
          Percentil {res.percentil} · {res.etiqueta}
        </div>
      ) : (
        <div className="text-xs mt-1 text-slate-300">sin percentil</div>
      )}
    </div>
  );
}
