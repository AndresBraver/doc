import { OMS, type LMS } from "./percentiles-data";

// CDF normal estándar (aprox. de Abramowitz-Stegun)
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return 1 - p;
}

function interp(tabla: LMS[], m: number): LMS | null {
  if (!tabla.length) return null;
  if (m <= tabla[0].m) return tabla[0];
  if (m >= tabla[tabla.length - 1].m) return tabla[tabla.length - 1];
  for (let i = 0; i < tabla.length - 1; i++) {
    const a = tabla[i],
      b = tabla[i + 1];
    if (m >= a.m && m <= b.m) {
      const f = (m - a.m) / (b.m - a.m);
      return {
        m,
        L: a.L + (b.L - a.L) * f,
        M: a.M + (b.M - a.M) * f,
        S: a.S + (b.S - a.S) * f,
      };
    }
  }
  return null;
}

export type ResultadoPercentil = {
  percentil: number; // 0-100
  z: number;
  etiqueta: "Bajo" | "Normal" | "Alto";
  color: string;
};

export function percentilOMS(
  medida: "weight" | "height",
  sexo: "male" | "female" | null,
  edadMeses: number | null,
  valor: number | null
): ResultadoPercentil | null {
  if (!sexo || edadMeses == null || valor == null || valor <= 0) return null;
  const tabla = OMS[medida]?.[sexo];
  const lms = interp(tabla, edadMeses);
  if (!lms) return null;

  const { L, M, S } = lms;
  const z = L !== 0 ? (Math.pow(valor / M, L) - 1) / (L * S) : Math.log(valor / M) / S;
  if (!isFinite(z)) return null;

  const percentil = Math.round(normalCdf(z) * 1000) / 10;
  let etiqueta: ResultadoPercentil["etiqueta"] = "Normal";
  let color = "#16a34a"; // verde
  if (z < -2) {
    etiqueta = "Bajo";
    color = "#dc2626";
  } else if (z > 2) {
    etiqueta = "Alto";
    color = "#d97706";
  }
  return { percentil, z: Math.round(z * 100) / 100, etiqueta, color };
}

// Edad en meses (con decimales) a partir de la fecha de nacimiento
// Z de percentiles clave
export const Z_PERCENTILES = { p3: -1.88079, p15: -1.03643, p50: 0, p85: 1.03643, p97: 1.88079 };

// Valor de la medida para un z dado (inverso de LMS): para dibujar las curvas.
export function valorEnZ(
  medida: "weight" | "height",
  sexo: "male" | "female",
  edadMeses: number,
  z: number
): number | null {
  const lms = interp(OMS[medida]?.[sexo] ?? [], edadMeses);
  if (!lms) return null;
  const { L, M, S } = lms;
  const v = L !== 0 ? M * Math.pow(1 + L * S * z, 1 / L) : M * Math.exp(S * z);
  return isFinite(v) ? v : null;
}

// Rango de edad disponible para una medida (en meses)
export function rangoMeses(medida: "weight" | "height"): { min: number; max: number } {
  const t = OMS[medida]?.male ?? [];
  return { min: t[0]?.m ?? 0, max: t[t.length - 1]?.m ?? 60 };
}

export function edadEnMeses(fechaNacimiento: string | null): number | null {
  if (!fechaNacimiento) return null;
  const n = new Date(fechaNacimiento + "T00:00:00");
  const hoy = new Date();
  const dias = (hoy.getTime() - n.getTime()) / 86400000;
  if (dias < 0) return null;
  return Math.round((dias / 30.4375) * 10) / 10;
}
