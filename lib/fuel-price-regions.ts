export const FUEL_PRICE_REGIONS = [
  "Abruzzo",
  "Basilicata",
  "Calabria",
  "Campania",
  "Emilia-Romagna",
  "Friuli Venezia Giulia",
  "Lazio",
  "Liguria",
  "Lombardia",
  "Marche",
  "Molise",
  "Piemonte",
  "Puglia",
  "Sardegna",
  "Sicilia",
  "Toscana",
  "Umbria",
  "Valle d'Aosta",
  "Veneto",
  "Provincia di Bolzano",
  "Provincia di Trento",
] as const;

export type FuelPriceRegion = (typeof FUEL_PRICE_REGIONS)[number];

export const FUEL_PRICE_FUELS = ["BENZINA", "GASOLIO", "GPL", "METANO"] as const;

export type RegionalFuelCode = (typeof FUEL_PRICE_FUELS)[number];
