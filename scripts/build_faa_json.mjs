// Builds data/faa-part135.json from the FAA's "Part 135 operators and aircraft" spreadsheet.
// Usage: node scripts/build_faa_json.mjs path/to/faa_part135_operators_aircraft.xlsx [YYYY-MM-DD]
// The date defaults to the workbook's own "modified" date.
import { readFileSync, writeFileSync } from 'fs';
import XLSX from 'xlsx';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/build_faa_json.mjs <faa.xlsx> [YYYY-MM-DD]');
  process.exit(1);
}

const wb = XLSX.read(readFileSync(file), { type: 'buffer' });
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });

const tails = new Set();
for (const row of rows) {
  const tail = String(row['Registration No.'] || '').trim().toUpperCase();
  if (tail) tails.add(tail);
}

const modified = wb.Props?.ModifiedDate ? new Date(wb.Props.ModifiedDate).toISOString().slice(0, 10) : null;
const sourceDate = process.argv[3] || modified;

const out = {
  source: 'FAA Part 135 operators and aircraft list',
  source_date: sourceDate,
  count: tails.size,
  tails: Array.from(tails).sort(),
};

writeFileSync(new URL('../data/faa-part135.json', import.meta.url), JSON.stringify(out) + '\n');
console.log(`Wrote ${tails.size} tails (source date ${sourceDate}) to data/faa-part135.json`);
