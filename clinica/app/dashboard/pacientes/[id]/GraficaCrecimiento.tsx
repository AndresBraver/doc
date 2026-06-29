import { valorEnZ, rangoMeses, Z_PERCENTILES } from "@/lib/percentiles";

export default function GraficaCrecimiento({
  medida,
  sexo,
  edadMeses,
  valor,
  titulo,
  unidad,
}: {
  medida: "weight" | "height";
  sexo: "male" | "female" | null;
  edadMeses: number | null;
  valor: number | null;
  titulo: string;
  unidad: string;
}) {
  if (!sexo || edadMeses == null) {
    return (
      <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-400">
        {titulo}: registra sexo y fecha de nacimiento para ver la gráfica.
      </div>
    );
  }

  const { max: tope } = rangoMeses(medida);
  const mMin = 0;
  const mMax = Math.min(tope, Math.max(24, Math.ceil((edadMeses + 6) / 6) * 6));

  // generar curvas
  const paso = mMax <= 60 ? 1 : 3;
  const meses: number[] = [];
  for (let m = mMin; m <= mMax; m += paso) meses.push(m);

  const curva = (z: number) =>
    meses.map((m) => ({ m, v: valorEnZ(medida, sexo, m, z) })).filter((p) => p.v != null) as {
      m: number;
      v: number;
    }[];

  const p3 = curva(Z_PERCENTILES.p3);
  const p50 = curva(Z_PERCENTILES.p50);
  const p97 = curva(Z_PERCENTILES.p97);

  // rango Y
  let yMin = Math.min(...p3.map((p) => p.v));
  let yMax = Math.max(...p97.map((p) => p.v));
  if (valor != null) {
    yMin = Math.min(yMin, valor);
    yMax = Math.max(yMax, valor);
  }
  const pad = (yMax - yMin) * 0.08 || 1;
  yMin -= pad;
  yMax += pad;

  // dimensiones SVG
  const W = 360,
    H = 240,
    ml = 34,
    mr = 12,
    mt = 12,
    mb = 26;
  const pw = W - ml - mr;
  const ph = H - mt - mb;

  const x = (m: number) => ml + ((m - mMin) / (mMax - mMin)) * pw;
  const y = (v: number) => mt + (1 - (v - yMin) / (yMax - yMin)) * ph;

  const path = (pts: { m: number; v: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.m).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");

  // banda normal (entre p3 y p97)
  const banda =
    path(p3) +
    " " +
    [...p97].reverse().map((p) => `L${x(p.m).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ") +
    " Z";

  // ticks
  const xticks: number[] = [];
  const stepX = mMax <= 24 ? 6 : mMax <= 60 ? 12 : 24;
  for (let m = 0; m <= mMax; m += stepX) xticks.push(m);
  const yticks = [yMin, (yMin + yMax) / 2, yMax].map((v) => Math.round(v));

  const bx = valor != null ? x(edadMeses) : null;
  const by = valor != null ? y(valor) : null;

  return (
    <div>
      <div className="text-sm font-medium mb-1">{titulo}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        {/* banda normal */}
        <path d={banda} fill="#55B58422" stroke="none" />
        {/* lineas guia Y */}
        {yticks.map((v, i) => (
          <g key={i}>
            <line x1={ml} y1={y(v)} x2={W - mr} y2={y(v)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={ml - 4} y={y(v) + 3} textAnchor="end" fontSize={9} fill="#94a3b8">
              {v}
            </text>
          </g>
        ))}
        {/* ticks X */}
        {xticks.map((m, i) => (
          <text key={i} x={x(m)} y={H - 8} textAnchor="middle" fontSize={9} fill="#94a3b8">
            {m}m
          </text>
        ))}
        {/* curvas */}
        <path d={path(p97)} fill="none" stroke="#cbd5e1" strokeWidth={1} />
        <path d={path(p3)} fill="none" stroke="#cbd5e1" strokeWidth={1} />
        <path d={path(p50)} fill="none" stroke="#16a34a" strokeWidth={2} />
        {/* etiquetas de curvas */}
        <text x={W - mr} y={y(p97[p97.length - 1].v) - 3} textAnchor="end" fontSize={8} fill="#94a3b8">
          p97
        </text>
        <text x={W - mr} y={y(p3[p3.length - 1].v) + 9} textAnchor="end" fontSize={8} fill="#94a3b8">
          p3
        </text>
        {/* punto del bebe */}
        {bx != null && by != null && (
          <>
            <circle cx={bx} cy={by} r={5} fill="#2563eb" stroke="#fff" strokeWidth={2} />
            <text x={bx} y={by - 9} textAnchor="middle" fontSize={9} fill="#2563eb" fontWeight="bold">
              {valor}
              {unidad}
            </text>
          </>
        )}
      </svg>
      <div className="flex gap-4 text-xs text-slate-500 mt-1 flex-wrap">
        <span><span className="inline-block w-3 border-t-2 border-green-600 align-middle" /> Promedio (OMS · México)</span>
        <span><span className="inline-block w-3 border-t border-slate-300 align-middle" /> Límites normales (p3–p97)</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-blue-600 align-middle" /> Tu paciente</span>
      </div>
    </div>
  );
}
