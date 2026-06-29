// Cartilla Nacional de Vacunación (México) — basada en el Esquema de Vacunación.
// edadMeses = edad recomendada en meses (para calcular la fecha desde el nacimiento).
// IMPORTANTE: es una guia de referencia; el doctor verifica contra la cartilla oficial vigente.

export type Dosis = {
  etiqueta: string;
  edad: string;              // texto a mostrar
  edadMeses: number | null;  // edad en meses para calcular la fecha; null = adicional/campaña
  anual?: boolean;           // true = se revacuna cada año
};

export type VacunaCartilla = {
  id: string;
  nombre: string;
  protege: string;
  dosis: Dosis[];
};

export const CARTILLA: VacunaCartilla[] = [
  {
    id: "bcg",
    nombre: "BCG",
    protege: "Tuberculosis",
    dosis: [{ etiqueta: "Única", edad: "Al nacer", edadMeses: 0 }],
  },
  {
    id: "hepb",
    nombre: "Hepatitis B",
    protege: "Hepatitis B",
    dosis: [
      { etiqueta: "Primera", edad: "Al nacer", edadMeses: 0 },
      { etiqueta: "Segunda", edad: "2 meses", edadMeses: 2 },
      { etiqueta: "Tercera", edad: "6 meses", edadMeses: 6 },
    ],
  },
  {
    id: "pentavalente",
    nombre: "Pentavalente acelular (DPaT+VPI+Hib)",
    protege: "Difteria, tosferina, tétanos, poliomielitis e infecciones por H. influenzae b",
    dosis: [
      { etiqueta: "Primera", edad: "2 meses", edadMeses: 2 },
      { etiqueta: "Segunda", edad: "4 meses", edadMeses: 4 },
      { etiqueta: "Tercera", edad: "6 meses", edadMeses: 6 },
      { etiqueta: "Cuarta", edad: "18 meses", edadMeses: 18 },
    ],
  },
  {
    id: "dpt",
    nombre: "DPT",
    protege: "Difteria, tosferina y tétanos",
    dosis: [{ etiqueta: "Refuerzo", edad: "4 años", edadMeses: 48 }],
  },
  {
    id: "rotavirus",
    nombre: "Rotavirus",
    protege: "Diarrea por rotavirus",
    dosis: [
      { etiqueta: "Primera", edad: "2 meses", edadMeses: 2 },
      { etiqueta: "Segunda", edad: "4 meses", edadMeses: 4 },
    ],
  },
  {
    id: "neumococo",
    nombre: "Neumocócica conjugada",
    protege: "Infecciones por neumococo",
    dosis: [
      { etiqueta: "Primera", edad: "2 meses", edadMeses: 2 },
      { etiqueta: "Segunda", edad: "4 meses", edadMeses: 4 },
      { etiqueta: "Refuerzo (otras)", edad: "12 meses", edadMeses: 12 },
    ],
  },
  {
    id: "influenza",
    nombre: "Influenza",
    protege: "Influenza / gripe",
    dosis: [
      { etiqueta: "Primera", edad: "6 meses", edadMeses: 6 },
      { etiqueta: "Segunda", edad: "7 meses", edadMeses: 7 },
      { etiqueta: "Revacunación", edad: "Anual (hasta los 35 meses)", edadMeses: null, anual: true },
    ],
  },
  {
    id: "srp",
    nombre: "SRP (Triple viral)",
    protege: "Sarampión, rubéola y parotiditis",
    dosis: [
      { etiqueta: "Primera", edad: "1 año", edadMeses: 12 },
      { etiqueta: "Refuerzo", edad: "6 años", edadMeses: 72 },
    ],
  },
  {
    id: "sabin",
    nombre: "Sabin (VOP)",
    protege: "Poliomielitis",
    dosis: [{ etiqueta: "Adicionales", edad: "En campañas", edadMeses: null }],
  },
  {
    id: "sr",
    nombre: "SR",
    protege: "Sarampión y rubéola",
    dosis: [{ etiqueta: "Adicionales", edad: "En campañas", edadMeses: null }],
  },
];
