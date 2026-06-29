import { percentilOMS, valorEnZ } from "@/lib/percentiles";

export default function ExplicacionCrecimiento({
  medida,
  sexo,
  edadMeses,
  edadTexto,
  valor,
  unidad,
}: {
  medida: "weight" | "height";
  sexo: "male" | "female" | null;
  edadMeses: number | null;
  edadTexto: string;
  valor: number | null;
  unidad: string;
}) {
  const esPeso = medida === "weight";
  const titulo = esPeso ? "Peso" : "Estatura";

  if (!sexo || edadMeses == null || valor == null) {
    return (
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="text-sm font-medium">{titulo}</div>
        <p className="text-sm text-slate-400 mt-1">
          Falta registrar {[
            !sexo && "sexo",
            edadMeses == null && "fecha de nacimiento",
            valor == null && (esPeso ? "peso" : "estatura"),
          ]
            .filter(Boolean)
            .join(", ")}{" "}
          para calcularlo.
        </p>
      </div>
    );
  }

  const res = percentilOMS(medida, sexo, edadMeses, valor);
  const promedio = valorEnZ(medida, sexo, edadMeses, 0);
  const nino = sexo === "male";
  const ninos = nino ? "niños" : "niñas";

  if (!res || promedio == null) {
    return (
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="text-sm font-medium">{titulo}</div>
        <p className="text-sm text-slate-400 mt-1">No hay datos OMS para esta edad.</p>
      </div>
    );
  }

  const p = res.percentil;
  const verbo = esPeso ? "pesa" : "mide";
  const masQue = esPeso ? "pesa más que" : "es más alto/a que";

  // estado
  let estado = "Está dentro de lo normal para su edad.";
  let colorEstado = "#16a34a";
  if (res.z < -2) {
    estado = esPeso
      ? "Está por debajo de lo normal. Conviene valorarlo."
      : "Está por debajo de lo esperado. Conviene valorarlo.";
    colorEstado = "#dc2626";
  } else if (res.z > 2) {
    estado = "Está por arriba de lo normal. Conviene valorarlo.";
    colorEstado = "#d97706";
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium">{titulo}</div>
        <div className="text-2xl font-bold">
          {valor}
          <span className="text-base font-normal text-slate-400"> {unidad}</span>
        </div>
      </div>

      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
        El promedio para {nino ? "un niño" : "una niña"} de {edadTexto} es{" "}
        <b>{Math.round(promedio * 10) / 10} {unidad}</b>. Tu paciente {verbo} <b>{valor} {unidad}</b>,
        así que está en el <b>percentil {p}</b>: {masQue} el <b>{p}%</b> de los {ninos} de su edad.
      </p>

      {/* barra visual simple del percentil */}
      <div className="mt-3">
        <div className="h-2 rounded-full bg-slate-100 relative">
          <div
            className="absolute -top-1 w-4 h-4 rounded-full border-2 border-white"
            style={{ left: `calc(${Math.min(98, Math.max(2, p))}% - 8px)`, background: "#2563eb" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>0%</span>
          <span>promedio (50%)</span>
          <span>100%</span>
        </div>
      </div>

      <p className="text-xs mt-2" style={{ color: colorEstado }}>
        {estado}
      </p>
    </div>
  );
}
