// Shared helpers for the FAA / NTSB data scripts.
import { readFileSync, createReadStream } from 'fs';
import { createInterface } from 'readline';
import XLSX from 'xlsx';

// "N-4827K", "4827k", "N4827K" -> "N4827K". Returns null for anything that isn't a US N-number.
export function normTail(raw) {
  let t = String(raw ?? '').toUpperCase().replace(/[\s-]/g, '');
  if (/^[1-9][0-9A-Z]{0,4}$/.test(t)) t = 'N' + t;
  return /^N[1-9][0-9A-Z]{0,4}$/.test(t) ? t : null;
}

const alnum = s => String(s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const digits = s => String(s ?? '').replace(/\D/g, '').replace(/^0+/, '');

// Do two serial numbers name the same airframe? Tolerates prefixes and punctuation
// ("C208B0419" vs "208B0419", "560-0690" vs "5600690").
export function sameSerial(a, b) {
  const x = alnum(a), y = alnum(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const [s, l] = x.length <= y.length ? [x, y] : [y, x];
  if (s.length >= 3 && l.endsWith(s)) return true;
  const dx = digits(x), dy = digits(y);
  return dx.length >= 2 && dx === dy;
}

// Minimal CSV parser (handles quoted fields, commas and newlines inside quotes).
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().map(h => h.replace(/^\uFEFF/, '').trim());
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

// Tails we list on the site, from the FAA Part 135 spreadsheet: tail -> { serial, mms }.
export function readPart135(xlsxPath) {
  const wb = XLSX.read(readFileSync(xlsxPath), { type: 'buffer' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  const tails = new Map();
  for (const row of rows) {
    const tail = normTail(row['Registration No.']);
    if (!tail) continue;
    const prev = tails.get(tail);
    const serial = String(row['Serial No.'] || '').trim();
    if (!prev || (!prev.serial && serial)) tails.set(tail, { serial, mms: String(row['Aircraft M/M/S'] || '').trim() });
  }
  return tails;
}

// FAA Releasable Aircraft registry MASTER.txt: tail -> { serial, year }.
// The file is ~200 MB of unquoted comma-separated lines, so it is streamed.
export async function readMaster(masterPath) {
  const out = new Map();
  const lines = createInterface({ input: createReadStream(masterPath, 'latin1'), crlfDelay: Infinity });
  let idx = null;
  for await (const line of lines) {
    const cols = line.split(',');
    if (!idx) {
      const h = cols.map(c => c.replace(/^\uFEFF|^ï»¿/, '').trim());
      idx = { n: h.indexOf('N-NUMBER'), serial: h.indexOf('SERIAL NUMBER'), year: h.indexOf('YEAR MFR') };
      continue;
    }
    const tail = normTail(cols[idx.n]);
    if (tail) out.set(tail, { serial: (cols[idx.serial] || '').trim(), year: (cols[idx.year] || '').trim() });
  }
  return out;
}
