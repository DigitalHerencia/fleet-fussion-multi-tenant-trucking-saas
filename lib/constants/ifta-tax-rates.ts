// IFTA tax rates (per gallon) for Federal, NM, TX, and Dona Ana County
// All rates in USD per gallon
export const IFTA_TAX_RATES: Record<string, number> = {
  FEDERAL: 0.184, // Federal gasoline excise tax
  LUST: 0.001, // Leaking Underground Storage Tank fee
  NM: 0.17, // New Mexico state excise tax
  TX: 0.2, // Texas state excise tax
  "NM-DA": 0.21, // Example: Dona Ana County, NM (if county-specific, adjust as needed)
};
