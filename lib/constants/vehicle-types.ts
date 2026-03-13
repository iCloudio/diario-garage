/**
 * Type definitions e costanti per veicoli
 */

export const DEADLINE_TYPES = ["ASSICURAZIONE", "BOLLO", "REVISIONE"] as const;

export type DeadlineType = (typeof DEADLINE_TYPES)[number];
