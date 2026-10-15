// Builds data/ntsb-events.json: NTSB accidents and incidents for the tails we list.
//
// Usage:
//   1. Download avall.zip from https://data.ntsb.gov/avdata (NTSB CAROL / aviation data,
//      2008 to present) and unzip avall.mdb. Install mdbtools (brew install mdbtools / apt install mdbtools).
//   2. node scripts/build_ntsb_json.mjs path/to/avall.mdb path/to/faa_part135_operators_aircraft.xlsx [path/to/MASTER.txt] [YYYY-MM-DD]
// The date is the NTSB file's date (defaults to avall.mdb's modified time).
//
// Matching is conservative: an event counts for a tail only if the N-number matches AND the
// airframe serial number in the NTSB record matches the serial on the FAA Part 135 list (or the
// FAA registry). N-numbers get reassigned, so a number match alone would pin old accidents of
// other aircraft on today's fleet. When the NTSB record has no serial, the model must match.
import { execFileSync } from 'child_process';
import { writeFileSync, statSync } from 'fs';
import { normTail, sameSerial, parseCsv, readPart135, readMaster } from './lib/registry.mjs';

const args = process.argv.slice(2);
const dateArg = args.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
const [mdbPath, xlsxPath, masterPath] = args.filter(a => a !== dateArg);
if (!mdbPath || !xlsxPath) {
  console.error('Usage: node scripts/build_ntsb_json.mjs <avall.mdb> <part135.xlsx> [MASTER.txt] [YYYY-MM-DD]');
  process.exit(1);
}

const exportTable = t => parseCsv(execFileSync('mdb-export', [mdbPath, t], { maxBuffer: 1 << 30 }).toString('utf8'));
const events = new Map(exportTable('events').map(e => [e.ev_id, e]));
const ntsbAircraft = exportTable('aircraft');
const part135 = readPart135(xlsxPath);
const master = masterPath ? await readMaster(masterPath) : new Map();

const alnum = s => String(s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const INJURY = { FATL: 'Fatal', SERS: 'Serious', MINR: 'Minor', NONE: 'None' };
const TYPE = { ACC: 'Accident', INC: 'Incident' };
const DAMAGE = { DEST: 'Destroyed', SUBS: 'Substantial', MINR: 'Minor', NONE: 'None' };

// "01/15/08 00:00:00" -> "2008-01-15"
function isoDate(d) {
  const m = /^(\d{2})\/(\d{2})\/(\d{2})/.exec(d || '');
  if (!m) return null;
  const yy = Number(m[3]);
  return `${yy < 50 ? 2000 + yy : 1900 + yy}-${m[1]}-${m[2]}`;
}

const tails = {};
let candidates = 0, kept = 0, rejected = 0, earliest = null;
for (const a of ntsbAircraft) {
  const tail = normTail(a.regis_no);
  const ours = tail && part135.get(tail);
  const ev = events.get(a.ev_id);
  if (!ev) continue;
  const date = isoDate(ev.ev_date);
  if (date && (!earliest || date < earliest)) earliest = date;
  if (!ours) continue;
  candidates++;
  const serials = [ours.serial, master.get(tail)?.serial].filter(Boolean);
  let match;
  if (alnum(a.acft_serial_no)) match = serials.some(s => sameSerial(a.acft_serial_no, s));
  else {
    const model = alnum(a.acft_model), mms = alnum(ours.mms);
    match = model.length >= 3 && !!mms && (mms.includes(model) || model.includes(mms));
  }
  if (!match) { rejected++; continue; }
  kept++;
  (tails[tail] ||= []).push({
    date,
    type: TYPE[ev.ev_type] || ev.ev_type || 'Event',
    injury: INJURY[ev.ev_highest_injury] || 'Not reported',
    fatal: Number(ev.inj_tot_f) || 0,
    serious: Number(ev.inj_tot_s) || 0,
    damage: DAMAGE[a.damage] || null,
    far_part: a.far_part ? a.far_part.replace(/^0+/, '').replace(/^NUSN$/, 'non-US') : null,
    location: [ev.ev_city, ev.ev_state || (ev.ev_country !== 'USA' ? ev.ev_country : '')].filter(Boolean).join(', ') || null,
    ntsb_no: ev.ntsb_no,
  });
}
for (const list of Object.values(tails)) list.sort((x, y) => (y.date || '').localeCompare(x.date || ''));

const sorted = Object.fromEntries(Object.keys(tails).sort().map(k => [k, tails[k]]));
const out = {
  source: 'NTSB aviation accident database (avall)',
  source_date: dateArg || statSync(mdbPath).mtime.toISOString().slice(0, 10),
  since_year: earliest ? Number(earliest.slice(0, 4)) : 2008,
  event_count: kept,
  tail_count: Object.keys(sorted).length,
  tails: sorted,
};
writeFileSync(new URL('../data/ntsb-events.json', import.meta.url), JSON.stringify(out) + '\n');
console.log(`N-number matches: ${candidates}; kept (serial/model verified): ${kept} on ${out.tail_count} tails; ` +
  `rejected as a different airframe: ${rejected}. Data since ${out.since_year}, file date ${out.source_date}.`);
