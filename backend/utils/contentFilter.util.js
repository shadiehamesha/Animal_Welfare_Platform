// Dictionary of restricted medical and dosing terms
const restrictedTerms = [
  /mg\/kg/i,
  /\b(dosage|dose|dosing)\b/i,
  /\badminister\b/i,
  /\bprescription\b/i,
  /\bmilligram(s)?\b/i,
  /\b(ml|mg) per\b/i,
  /\btablet(s)?\b/i,
  /\b(antibiotic|steroid|painkiller)\b/i
];

export const checkContentForMedicalAdvice = (text) => {
  if (!text) return false;
  return restrictedTerms.some(regex => regex.test(text));
};