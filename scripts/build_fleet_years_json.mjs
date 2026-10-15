// Builds data/fleet-years.json: year of manufacture per tail, from the FAA
// Releasable Aircraft registry (MASTER.txt, "YEAR MFR").
//
// Usage:
//   1. Download https://registry.faa.gov/database/ReleasableAircraft.zip and unzip MASTER.txt
//   2. node scripts/build_fleet_years_json.mjs path/to/MASTER.txt path/to/faa_part135_operators_aircraft.xlsx [YYYY-MM-DD]
// The date is the registry file's date (defaults to MASTER.txt's modified time).
//
// Only tails on the FAA Part 135 list are kept. If the registry's serial number for a tail
// disagrees with the Part 135 list's serial, the tail was likely re-registered to another
// airframe, so no year is recorded for it.
import { writeFileSync, statSync } from 'fs';
import { readPart135, readMaster, sameSerial } from './lib/registry.mjs';

const [masterPath, xlsxPath, dateArg] = process.argv.slice(2);
if (!masterPath || !xlsxPath) {
  console.error('Usage: node scripts/build_fleet_years_json.mjs <MASTER.txt> <part135.xlsx> [YYYY-MM-DD]');
  process.exit(1);
}

const part135 = readPart135(xlsxPath);
const master = await readMaster(masterPath);
const thisYear = new Date().getFullYear();
const years = {};
let notInRegistry = 0, noYear = 0, serialMismatch = 0;

for (const [tail, info] of [...part135].sort(([a], [b]) => a.localeCompare(b))) {
  const reg = master.get(tail);
  if (!reg) { notInRegistry++; continue; }
  if (info.serial && reg.serial && !sameSerial(info.serial, reg.serial)) { serialMismatch++; continue; }
  const y = Number(reg.year);
  if (!Number.isInteger(y) || y < 1920 || y > thisYear + 1) { noYear++; continue; }
  years[tail] = y;
}

const out = {
  source: 'FAA Releasable Aircraft Registry (MASTER.txt, YEAR MFR)',
  source_date: dateArg || statSync(masterPath).mtime.toISOString().slice(0, 10),
  count: Object.keys(years).length,
  years,
};
writeFileSync(new URL('../data/fleet-years.json', import.meta.url), JSON.stringify(out) + '\n');
console.log(`Part 135 tails: ${part135.size}; with a year: ${out.count}; not in registry: ${notInRegistry}; ` +
  `no year: ${noYear}; serial mismatch (skipped): ${serialMismatch}. Source date ${out.source_date}.`);
