// Cartilla Nacional de Vacunación (México) + Influenza.
// Esquema de referencia segun el Esquema de Vacunacion Universal.
// IMPORTANTE: es una guia; el doctor siempre verifica contra la cartilla oficial vigente.

export type Dosis = {
  etiqueta: string; // "1a dosis", "Refuerzo", etc.
  edad: string; // a que edad toca (texto para mostrar)
  intervaloMeses: number | null; // meses hasta la siguiente dosis; null = es la ultima
};

export type VacunaCartilla = {
  id: string;
  nombre: string;
  protege: string; // contra que protege
  dosis: Dosis[];
};

export const CARTILLA: VacunaCartilla[] = [
  {
    id: "bcg",
    nombre: "BCG",
    protege: "Tuberculosis",
    dosis: [{ etiqueta: "Dosis unica", edad: "Al nacer", intervaloMeses: null }],
  },
  {
    id: "hepb",
    nombre: "Hepatitis B",
    protege: "Hepatitis B",
    dosis: [
      { etiqueta: "1a dosis", edad: "Al nacer", intervaloMeses: 2 },
      { etiqueta: "2a dosis", edad: "2 meses", intervaloMeses: 4 },
      { etiqueta: "3a dosis", edad: "6 meses", intervaloMeses: null },
    ],
  },
  {
    id: "pentavalente",
    nombre: "Pentavalente acelular",
    protege: "Difteria, tosferina, tetanos, polio (VIP) y Hib",
    dosis: [
      { etiqueta: "1a dosis", edad: "2 meses", intervaloMeses: 2 },
      { etiqueta: "2a dosis", edad: "4 meses", intervaloMeses: 2 },
      { etiqueta: "3a dosis", edad: "6 meses", intervaloMeses: 12 },
      { etiqueta: "4a dosis (refuerzo)", edad: "18 meses", intervaloMeses: null },
    ],
  },
  {
    id: "rotavirus",
    nombre: "Rotavirus",
    protege: "Diarrea por rotavirus",
    dosis: [
      { etiqueta: "1a dosis", edad: "2 meses", intervaloMeses: 2 },
      { etiqueta: "2a dosis", edad: "4 meses", intervaloMeses: null },
    ],
  },
  {
    id: "neumococo",
    nombre: "Neumococica conjugada",
    protege: "Neumonia y meningitis por neumococo",
    dosis: [
      { etiqueta: "1a dosis", edad: "2 meses", intervaloMeses: 2 },
      { etiqueta: "2a dosis", edad: "4 meses", intervaloMeses: 8 },
      { etiqueta: "Refuerzo", edad: "12 meses", intervaloMeses: null },
    ],
  },
  {
    id: "influenza",
    nombre: "Influenza (estacional)",
    protege: "Influenza / gripe",
    dosis: [
      { etiqueta: "1a dosis", edad: "6 meses", intervaloMeses: 1 },
      { etiqueta: "2a dosis", edad: "4 semanas despues", intervaloMeses: 12 },
      { etiqueta: "Refuerzo anual", edad: "Cada ano (temporada invernal)", intervaloMeses: 12 },
    ],
  },
  {
    id: "srp",
    nombre: "Triple viral (SRP)",
    protege: "Sarampion, rubeola y parotiditis",
    dosis: [
      { etiqueta: "1a dosis", edad: "12 meses", intervaloMeses: 60 },
      { etiqueta: "2a dosis", edad: "6 anos", intervaloMeses: null },
    ],
  },
  {
    id: "dpt",
    nombre: "DPT (refuerzo)",
    protege: "Difteria, tosferina y tetanos",
    dosis: [{ etiqueta: "Refuerzo", edad: "4 anos", intervaloMeses: null }],
  },
  {
    id: "vph",
    nombre: "VPH",
    protege: "Virus del papiloma humano",
    dosis: [
      { etiqueta: "1a dosis", edad: "11 anos / 5o de primaria", intervaloMeses: 6 },
      { etiqueta: "2a dosis", edad: "6 meses despues", intervaloMeses: null },
    ],
  },
  {
    id: "td",
    nombre: "Td (Tetanos-Difteria)",
    protege: "Tetanos y difteria (adolescentes y adultos)",
    dosis: [
      { etiqueta: "Refuerzo", edad: "Cada 10 anos", intervaloMeses: 120 },
    ],
  },
];
