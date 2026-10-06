#!/usr/bin/env node
/**
 * Build the bundled exercise catalog from two third-party datasets.
 *
 *   node scripts/build-exercise-catalog.mjs <exercises-dataset.json> <everkinetic-repo>
 *
 * Inputs (download them yourself; they are not vendored):
 *   - hasaneyldrm/exercises-dataset `data/exercises.json` (MIT; text only —
 *     its images/GIFs are © Gym visual and are never read here)
 *   - a checkout of everkinetic/data (CC BY-SA 4.0 line illustrations)
 *
 * Outputs (committed; re-run the script instead of editing them):
 *   - src/features/routines/data/exerciseCatalog.json
 *   - src/features/routines/data/exerciseMedia.ts
 *   - assets/exercises/<id>-start.svg, <id>-end.svg
 *
 * Exercise ids are permanent: history and PRs are keyed on them. The
 * hand-picked CURATED entries keep the ids the app has always used; every
 * other id is derived from the dataset name. Changing the slug rule would
 * rename ids, so it must stay stable.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT_JSON = path.join(ROOT, 'src/features/routines/data/exerciseCatalog.json');
const OUT_MEDIA = path.join(ROOT, 'src/features/routines/data/exerciseMedia.ts');
const OUT_SVG_DIR = path.join(ROOT, 'assets/exercises');

/**
 * The original library, mapped onto dataset records. `source: null` keeps
 * an exercise without a close enough dataset match (no instructions).
 */
const CURATED = [
  ['bench-press', 'Bench Press', 'chest', 'barbell', '0025'],
  ['incline-bench-press', 'Incline Bench Press', 'chest', 'barbell', '0047'],
  ['dumbbell-fly', 'Dumbbell Fly', 'chest', 'dumbbell', '0308'],
  ['cable-crossover', 'Cable Crossover', 'chest', 'cable', '0227'],
  ['push-up', 'Push-up', 'chest', 'bodyweight', '0662'],
  ['deadlift', 'Deadlift', 'back', 'barbell', '0032'],
  ['barbell-row', 'Barbell Row', 'back', 'barbell', '0027'],
  ['pull-up', 'Pull Up', 'back', 'bodyweight', '0652'],
  ['lat-pulldown', 'Lat Pulldown', 'back', 'cable', '2330'],
  ['seated-cable-row', 'Seated Cable Row', 'back', 'cable', '0861'],
  ['back-squat', 'Back Squat', 'legs', 'barbell', '0043'],
  ['romanian-deadlift', 'Romanian Deadlift', 'legs', 'barbell', '0085'],
  ['leg-press', 'Leg Press', 'legs', 'machine', '0739'],
  ['leg-curl', 'Leg Curl', 'legs', 'machine', '0586'],
  ['leg-extension', 'Leg Extension', 'legs', 'machine', '0585'],
  ['calf-raise', 'Calf Raise', 'legs', 'machine', '0605'],
  ['bulgarian-split-squat', 'Bulgarian Split Squat', 'legs', 'dumbbell', '0410'],
  ['overhead-press', 'Overhead Press', 'shoulders', 'barbell', '1456'],
  ['dumbbell-shoulder-press', 'Dumbbell Shoulder Press', 'shoulders', 'dumbbell', '0405'],
  ['lateral-raise', 'Lateral Raise', 'shoulders', 'dumbbell', '0334'],
  ['face-pull', 'Face Pull', 'shoulders', 'cable', null],
  ['barbell-curl', 'Barbell Curl', 'arms', 'barbell', '0031'],
  ['dumbbell-curl', 'Dumbbell Curl', 'arms', 'dumbbell', '0294'],
  ['hammer-curl', 'Hammer Curl', 'arms', 'dumbbell', '0313'],
  ['tricep-pushdown', 'Tricep Pushdown', 'arms', 'cable', '0201'],
  ['skullcrusher', 'Skullcrusher', 'arms', 'barbell', '0060'],
  ['overhead-tricep-extension', 'Overhead Tricep Extension', 'arms', 'dumbbell', '0430'],
  ['dip', 'Dip', 'arms', 'bodyweight', '0814'],
];

/**
 * Everkinetic illustrations for curated exercises whose names differ too
 * much for the automatic match. Each pair was checked by eye.
 */
const EVERKINETIC_OVERRIDES = {
  'cable-crossover': 'cable-crossover',
  'push-up': 'push-ups',
  deadlift: 'barbell-dead-lifts',
  'pull-up': 'pull-ups',
  'back-squat': 'barbell-squat',
  'romanian-deadlift': 'romanian-dead-lift',
  'leg-press': 'leg-press',
  'leg-extension': 'leg-extensions',
  'calf-raise': 'standing-calf-raises-using-machine',
  'barbell-curl': 'biceps-curls-with-barbell',
  'hammer-curl': 'biceps-hammer-curl-with-dumbbell',
  'tricep-pushdown': 'triceps-pushdown-with-cable',
};

/**
 * Exercises logged by time held rather than reps. Picked by hand: name
 * patterns ("plank", "hang") also match dynamic movements like
 * "Hang Clean" or "Push-up to Side Plank".
 */
const TIMED_IDS = new Set([
  'weighted-front-plank',
  'side-bridge-v-2',
  'bodyweight-incline-side-plank',
  'l-sit-on-floor',
  'v-sit-on-floor',
  'isometric-chest-squeeze',
  'farmers-walk',
  'dumbbell-single-arm-overhead-carry',
]);

/** One arm or one leg at a time: reps are logged per side. */
const PER_SIDE_PATTERN = /\b(one|single)[ -](arm|leg)\b/i;

/** Per-side exercises whose names do not say so. */
const PER_SIDE_IDS = new Set([
  'bulgarian-split-squat',
  'side-bridge-v-2',
  'bodyweight-incline-side-plank',
]);

const BODY_PART_TO_GROUP = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  'upper arms': 'arms',
  'lower arms': 'arms',
  'upper legs': 'legs',
  'lower legs': 'legs',
  waist: 'core',
};

const EQUIPMENT_MAP = {
  barbell: 'barbell',
  'ez barbell': 'barbell',
  'olympic barbell': 'barbell',
  'trap bar': 'barbell',
  dumbbell: 'dumbbell',
  cable: 'cable',
  'leverage machine': 'machine',
  'sled machine': 'machine',
  'smith machine': 'machine',
  'body weight': 'bodyweight',
  weighted: 'bodyweight',
  kettlebell: 'kettlebell',
  band: 'band',
  'resistance band': 'band',
};

const SMALL_WORDS = new Set(['a', 'an', 'and', 'at', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);

/** Repair the dataset's mojibake degree sign and stray whitespace. */
function cleanName(raw) {
  return raw.replace(/в°/g, '°').replace(/\s*\((male|female)\)/g, '').replace(/\s+/g, ' ').trim();
}

/** "barbell bench press (wide grip)" → "Barbell Bench Press (Wide Grip)". */
function titleCase(name) {
  return name
    .split(' ')
    .map((word, i) => {
      const bare = word.replace(/^\(/, '');
      if (i > 0 && SMALL_WORDS.has(bare)) return word;
      const at = word.startsWith('(') ? 1 : 0;
      return word.slice(0, at) + word.charAt(at).toUpperCase() + word.slice(at + 1);
    })
    .join(' ');
}

/** Stable id from a cleaned dataset name. Never change this rule. */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/°/g, '-degree')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Whether a dataset record belongs in a strength-training library. */
function isWanted(record, name) {
  if (!BODY_PART_TO_GROUP[record.body_part]) return false;
  if (!EQUIPMENT_MAP[record.equipment]) return false;
  if (/\bstretch\b/.test(name)) return false;
  if (/\((back|side) pov\)/.test(name)) return false;
  return true;
}

const SINGULAR = {
  raises: 'raise', rows: 'row', flys: 'fly', flyes: 'fly', flies: 'fly', curls: 'curl',
  presses: 'press', dumbbells: 'dumbbell', shrugs: 'shrug', dips: 'dip',
  extensions: 'extension', crunches: 'crunch', squats: 'squat', lunges: 'lunge',
  kickbacks: 'kickback', pulldowns: 'pulldown', pullovers: 'pullover', 'pull-ups': 'pull-up',
  pullups: 'pull-up', 'push-ups': 'push-up', pushups: 'push-up', bars: 'bar', grips: 'grip',
  alternating: 'alternate', lever: 'machine', triceps: 'tricep', biceps: 'bicep',
};
const NOISE = new Set(['with', 'the', 'on', 'a', 'exercise', 'body', 'flat', 'standing']);
const EK_EQUIPMENT_TOKENS = ['barbell', 'dumbbell', 'cable', 'smith', 'kettlebell', 'band'];

/** Order-free token key used to match an Everkinetic entry to a record. */
function matchKey(words) {
  const tokens = words
    .flatMap((w) => w.toLowerCase().split(/[\s-]+/))
    .map((w) => SINGULAR[w] ?? w)
    .filter((w) => w && !NOISE.has(w));
  return [...new Set(tokens)].sort().join(' ');
}

/** Key for an Everkinetic entry: its name plus any equipment it omits. */
function everkineticKey(entry) {
  const words = entry.name.split('-');
  for (const eq of entry.equipment) {
    const token = EK_EQUIPMENT_TOKENS.find((t) => eq.includes(t));
    if (token && !words.includes(token) && !words.includes(`${token}s`)) words.push(token);
  }
  return matchKey(words);
}

/** Reduce an Everkinetic SVG to its ink paths, tintable via currentColor. */
function inkOnlySvg(xml) {
  const viewBox = /viewBox="([^"]+)"/.exec(xml)?.[1];
  if (!viewBox) throw new Error('SVG without viewBox');
  const paths = [];
  for (const [, fill, body] of xml.matchAll(/<g fill="([^"]+)">(.*?)<\/g>/gs)) {
    if (/^#f{3}(f{3})?$/i.test(fill)) continue; // white background group
    for (const [, d] of body.matchAll(/<path[^>]*\sd="([^"]+)"/g)) paths.push(d);
  }
  if (paths.length === 0) throw new Error('SVG without ink paths');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><path fill="currentColor" d="${paths.join(' ')}"/></svg>\n`;
}

/** Turn one dataset record into a catalog entry. */
function toEntry(id, name, muscleGroup, equipment, record) {
  const entry = { id, name, muscleGroup, equipment };
  if (TIMED_IDS.has(id)) entry.measure = 'time';
  if (PER_SIDE_IDS.has(id) || PER_SIDE_PATTERN.test(name)) entry.perSide = true;
  if (!record) return entry;
  entry.targetMuscle = record.target;
  entry.secondaryMuscles = record.secondary_muscles;
  entry.instructions = record.instruction_steps.en;
  entry.source = { dataset: 'exercises-dataset', id: record.id };
  return entry;
}

/** Curated entries first, then every wanted record not already used. */
function buildEntries(records) {
  const byId = new Map(records.map((r) => [r.id, r]));
  const used = new Set();
  const taken = new Set(CURATED.map(([id]) => id));
  const entries = CURATED.map(([id, name, group, equipment, sourceId]) => {
    const record = sourceId ? byId.get(sourceId) : null;
    if (sourceId && !record) throw new Error(`curated ${id}: source ${sourceId} missing`);
    if (record) used.add(record.id);
    return { entry: toEntry(id, name, group, equipment, record), record };
  });
  const sorted = [...records].sort((a, b) => a.id.localeCompare(b.id));
  const seenNames = new Set();
  for (const record of sorted) {
    const name = cleanName(record.name);
    if (used.has(record.id) || !isWanted(record, name) || seenNames.has(name)) continue;
    seenNames.add(name);
    let id = slugify(name);
    if (taken.has(id)) id = `${id}-${record.id}`;
    taken.add(id);
    const group = BODY_PART_TO_GROUP[record.body_part];
    const equipment = EQUIPMENT_MAP[record.equipment];
    entries.push({ entry: toEntry(id, titleCase(name), group, equipment, record), record });
  }
  return entries;
}

/** Attach Everkinetic illustrations and write the SVG assets. */
function attachMedia(entries, everkineticDir) {
  const list = JSON.parse(fs.readFileSync(path.join(everkineticDir, 'dist/exercises.json'), 'utf8'));
  const usable = list.filter((ek) => ek.svg.length === 2);
  const byKey = new Map(usable.map((ek) => [everkineticKey(ek), ek]));
  const byName = new Map(usable.map((ek) => [ek.name, ek]));
  for (const [id, name] of Object.entries(EVERKINETIC_OVERRIDES)) {
    if (!byName.has(name)) throw new Error(`override ${id}: ${name} has no illustration`);
  }
  // Replace only the generated drawings; LICENSE.md in the folder stays.
  fs.mkdirSync(OUT_SVG_DIR, { recursive: true });
  for (const file of fs.readdirSync(OUT_SVG_DIR)) {
    if (file.endsWith('.svg')) fs.rmSync(path.join(OUT_SVG_DIR, file));
  }
  const media = [];
  for (const { entry, record } of entries) {
    const override = EVERKINETIC_OVERRIDES[entry.id];
    const ek = override
      ? byName.get(override)
      : record && byKey.get(matchKey([cleanName(record.name)]));
    if (!ek) continue;
    const [relaxed, tense] = ek.svg.map((p) => fs.readFileSync(path.join(everkineticDir, 'dist', p), 'utf8'));
    fs.writeFileSync(path.join(OUT_SVG_DIR, `${entry.id}-start.svg`), inkOnlySvg(relaxed));
    fs.writeFileSync(path.join(OUT_SVG_DIR, `${entry.id}-end.svg`), inkOnlySvg(tense));
    media.push({ id: entry.id, everkinetic: ek.name });
  }
  return media;
}

/** The generated module mapping exercise ids to their bundled frames. */
function mediaModule(media) {
  const lines = media.map(
    ({ id }) =>
      `  '${id}': {\n    start: require('../../../../assets/exercises/${id}-start.svg'),\n    end: require('../../../../assets/exercises/${id}-end.svg'),\n  },`,
  );
  return `// GENERATED by scripts/build-exercise-catalog.mjs — do not edit.
// Illustrations: Everkinetic (https://github.com/everkinetic/data), CC BY-SA 4.0.
import type { ImageSourcePropType } from 'react-native';

/** Start and end frame of an exercise illustration. */
export interface ExerciseMediaFrames {
  start: ImageSourcePropType;
  end: ImageSourcePropType;
}

/** Illustration frames keyed by exercise id. */
export const EXERCISE_MEDIA: Readonly<Record<string, ExerciseMediaFrames>> = {
${lines.join('\n')}
};
`;
}

function main() {
  const [datasetPath, everkineticDir] = process.argv.slice(2);
  if (!datasetPath || !everkineticDir) {
    console.error('usage: build-exercise-catalog.mjs <exercises.json> <everkinetic-repo>');
    process.exit(1);
  }
  const records = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  const entries = buildEntries(records);
  const media = attachMedia(entries, everkineticDir);
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  // One entry per line: compact, but still diffable when the data changes.
  const rows = entries.map((e) => JSON.stringify(e.entry));
  fs.writeFileSync(OUT_JSON, `[\n${rows.join(',\n')}\n]\n`);
  fs.writeFileSync(OUT_MEDIA, mediaModule(media));
  const groups = {};
  for (const { entry } of entries) groups[entry.muscleGroup] = (groups[entry.muscleGroup] ?? 0) + 1;
  console.log(`catalog: ${entries.length} exercises`, groups);
  console.log(`illustrated: ${media.length}`);
  const timed = entries.filter((e) => e.entry.measure === 'time').map((e) => e.entry.id);
  const missing = [...TIMED_IDS].filter((id) => !timed.includes(id));
  if (missing.length > 0) throw new Error(`TIMED_IDS not in catalog: ${missing.join(', ')}`);
  console.log(`timed: ${timed.length}, per side: ${entries.filter((e) => e.entry.perSide).length}`);
  if (process.env.VERBOSE) for (const m of media) console.log(`  ${m.id} ← ${m.everkinetic}`);
}

main();
