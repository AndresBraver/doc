// Utilidades de fecha compartidas

// Edad automática a partir de la fecha de nacimiento.
// Muestra meses si es menor de 2 años, si no años. Ej: "8 meses", "3 años".
export function calcEdad(fechaNacimiento: string | null): string {
  if (!fechaNacimiento) return "—";
  const n = new Date(fechaNacimiento + "T00:00:00");
  const hoy = new Date();
  let meses =
    (hoy.getFullYear() - n.getFullYear()) * 12 + (hoy.getMonth() - n.getMonth());
  if (hoy.getDate() < n.getDate()) meses--;
  if (meses < 0) return "—";
  if (meses < 24) return `${meses} ${meses === 1 ? "mes" : "meses"}`;
  const anios = Math.floor(meses / 12);
  return `${anios} ${anios === 1 ? "año" : "años"}`;
}

// Suma meses a una fecha y devuelve YYYY-MM-DD
export function sumarMeses(fecha: Date, meses: number): string {
  const d = new Date(fecha);
  d.setMonth(d.getMonth() + meses);
  return d.toISOString().slice(0, 10);
}

// Fecha esperada de una dosis = nacimiento + edadMeses (YYYY-MM-DD) o null
export function fechaEsperada(
  fechaNacimiento: string | null,
  edadMeses: number | null
): string | null {
  if (!fechaNacimiento || edadMeses == null) return null;
  return sumarMeses(new Date(fechaNacimiento + "T00:00:00"), edadMeses);
}
