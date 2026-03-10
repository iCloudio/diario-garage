export type PlateLookupResult = {
  plate: string;
  make: string;
  model: string;
  year?: number;
  source: "mock";
};

const MOCK_DATA: Record<string, Omit<PlateLookupResult, "plate">> = {
  AB123CD: {
    make: "Fiat",
    model: "Panda",
    year: 2019,
    source: "mock",
  },
  EF456GH: {
    make: "Volkswagen",
    model: "Golf",
    year: 2021,
    source: "mock",
  },
  IJ789KL: {
    make: "Toyota",
    model: "Yaris",
    year: 2018,
    source: "mock",
  },
};

export function lookupPlate(plate: string): PlateLookupResult | null {
  const normalized = plate.replace(/\s+/g, "").toUpperCase();
  const match = MOCK_DATA[normalized];
  if (!match) return null;
  return { plate: normalized, ...match };
}
