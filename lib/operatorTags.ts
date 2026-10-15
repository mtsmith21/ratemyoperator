// Labels for listings that aren't typical charter operators, so visitors
// aren't misled (e.g. a jet card program or an air ambulance service).
// Keyed by exact operator name as stored in Supabase.
export const OPERATOR_TAGS: Record<string, string> = {
  'Sentient Jets': 'Jet card program',
  'Air Methods': 'Air medical',
};

export function operatorTag(name: string): string | undefined {
  return OPERATOR_TAGS[name];
}
