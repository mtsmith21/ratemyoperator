// Aircraft import script — uses Supabase REST API, no DB password needed
// Run with: node scripts/import_aircraft.mjs <SERVICE_ROLE_KEY>
// Get service role key from: https://supabase.com/dashboard/project/locibidteiwwinwjapro/settings/api

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://locibidteiwwinwjapro.supabase.co';
const SERVICE_KEY = process.argv[2];

if (!SERVICE_KEY) {
  console.error('Usage: node scripts/import_aircraft.mjs <SERVICE_ROLE_KEY>');
  console.error('Get it from: https://supabase.com/dashboard/project/locibidteiwwinwjapro/settings/api');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Parse the xlsx data
import openpyxlCompat from 'xlsx';
const { readFile, utils } = openpyxlCompat;

const wb = readFile('/Users/mike/Downloads/Part 135_Operators_and_Aircraft_List.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const raw = utils.sheet_to_json(ws);

const seen = new Set();
const rows = [];
for (const row of raw) {
  const tail = String(row['Registration No.'] || '').trim();
  const name = String(row['Name'] || '').trim();
  const type = String(row['Aircraft M/M/S'] || '').trim();
  const cfr  = String(row['CFR'] || '').trim();
  if (tail && name && type && !seen.has(tail)) {
    seen.add(tail);
    rows.push({ operator_name: name, aircraft_type: type, tail_number: tail, cfr });
  }
}

console.log(`Loaded ${rows.length} unique aircraft rows`);

const BATCH = 500;
let inserted = 0;
let skipped = 0;

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error, count } = await supabase
    .from('aircraft')
    .upsert(batch, { onConflict: 'tail_number', ignoreDuplicates: true })
    .select('id', { count: 'exact', head: true });

  if (error) {
    // Table may not exist yet — create it first
    if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
      console.error('Table "aircraft" does not exist. Please run the SQL schema first:');
      console.error('  supabase/aircraft_schema.sql in the Supabase SQL Editor');
      process.exit(1);
    }
    console.error(`Batch ${i}-${i+BATCH} error:`, error.message);
    skipped += batch.length;
  } else {
    inserted += batch.length;
    process.stdout.write(`\rImported ${inserted}/${rows.length}...`);
  }
}

console.log(`\nDone! ${inserted} inserted, ${skipped} skipped.`);
