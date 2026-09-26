const path = require("path");
const fs = require("fs");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const USER_UID = process.argv[2];
if (!USER_UID) {
  console.error("Usage: node scripts/seed-firestore.js <user-uid>");
  process.exit(1);
}

const keyPath = path.join(__dirname, "..", "serviceAccountKey.json");
if (!fs.existsSync(keyPath)) {
  console.error("Missing serviceAccountKey.json in project root.");
  console.error(
    "Get it: Firebase Console → Project Settings → Service accounts → Generate new private key",
  );
  process.exit(1);
}

initializeApp({
  credential: cert(require(keyPath)),
});

const db = getFirestore();

// ---------- Deterministic RNG ----------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(42);
const rand = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
const randF = (min, max) => rng() * (max - min) + min;

// ---------- Exercise catalogs ----------
// startKg: base at week 0. gain: kg added per week.
// reps: target reps per set. sets: number of working sets.

const UPPER = [
  { id: "bench-press", startKg: 65, gain: 1.4, reps: 8, sets: 3 },
  { id: "incline-dumbbell-press", startKg: 22, gain: 0.55, reps: 10, sets: 3 },
  { id: "dumbbell-fly", startKg: 12, gain: 0.3, reps: 12, sets: 3 },
  { id: "overhead-press", startKg: 40, gain: 0.9, reps: 8, sets: 3 },
  { id: "lateral-raise", startKg: 8, gain: 0.25, reps: 12, sets: 3 },
  { id: "barbell-row", startKg: 55, gain: 1.2, reps: 8, sets: 3 },
  { id: "barbell-curl", startKg: 25, gain: 0.5, reps: 10, sets: 3 },
  { id: "tricep-pushdown", startKg: 25, gain: 0.5, reps: 12, sets: 3 },
];

const LOWER = [
  { id: "back-squat", startKg: 80, gain: 1.8, reps: 8, sets: 3 },
  { id: "romanian-deadlift", startKg: 70, gain: 1.4, reps: 8, sets: 3 },
  { id: "leg-press", startKg: 120, gain: 3.0, reps: 10, sets: 3 },
  { id: "lunge", startKg: 20, gain: 0.6, reps: 10, sets: 3 },
  { id: "deadlift", startKg: 100, gain: 2.0, reps: 5, sets: 3 },
  { id: "plank", startKg: 0, gain: 0, reps: 60, sets: 3 },
];

// ---------- Workout generator ----------

function generateWorkout(weekIndex, dayIndex, routineName, catalog, dateMs) {
  const workoutId = `seed-w${weekIndex}-d${dayIndex}`;
  const sets = [];
  let order = 0;

  // Choose 4-5 exercises from the catalog deterministically.
  const sessionSize = weekIndex % 4 === 0 ? 4 : 5;
  const selected = catalog.slice(0, sessionSize);

  for (const ex of selected) {
    const baseWeight = ex.startKg + ex.gain * weekIndex;
    const jitter = randF(-2.5, 2.5);
    const weight =
      ex.startKg === 0
        ? 0
        : Math.max(0, Math.round((baseWeight + jitter) / 2.5) * 2.5);

    for (let s = 0; s < ex.sets; s++) {
      // Reps drop slightly on the last set
      const reps =
        s === ex.sets - 1 ? Math.max(ex.reps - 2, ex.reps - 1) : ex.reps;

      sets.push({
        id: `${workoutId}-s${order}`,
        exerciseId: ex.id,
        workoutId,
        weightKg: weight,
        reps,
        type: "normal",
        completed: true,
        rpe: rand(6, 9),
        completedAt: dateMs + order * 120000,
        order,
        isPR: false,
      });
      order++;
    }
  }

  return {
    id: workoutId,
    routineId: routineName === "Upper Body A" ? "upper-a" : "lower-a",
    routineName,
    startedAt: dateMs,
    finishedAt: dateMs + (45 + rand(0, 15)) * 60 * 1000,
    sets,
    note: "",
  };
}

// ---------- PR computation ----------

function computePRFlags(workouts) {
  const flat = [];
  for (const w of workouts) {
    for (const s of w.sets) flat.push(s);
  }
  flat.sort((a, b) => a.completedAt - b.completedAt);

  const bestWeight = {};
  const bestE1RM = {};

  for (const s of flat) {
    const ex = s.exerciseId;
    const e1rm = s.reps === 1 ? s.weightKg : s.weightKg * (1 + s.reps / 30);

    const isHeavier =
      bestWeight[ex] === undefined || s.weightKg > bestWeight[ex];
    const isStronger = bestE1RM[ex] === undefined || e1rm > bestE1RM[ex];

    if (isHeavier || isStronger) {
      s.isPR = true;
    }

    if (isHeavier) bestWeight[ex] = s.weightKg;
    if (isStronger) bestE1RM[ex] = e1rm;
  }
}

// ---------- Main ----------

async function seed() {
  console.log(`\nSeeding workouts for uid: ${USER_UID}\n`);

  const now = Date.now();
  const MS_DAY = 24 * 60 * 60 * 1000;
  const MS_WEEK = 7 * MS_DAY;

  const workouts = [];

  // 12 weeks of history, most recent last.
  for (let w = 0; w < 12; w++) {
    const weekStartMs = now - (11 - w) * MS_WEEK;

    // Monday: Upper Body A
    workouts.push(
      generateWorkout(w, 0, "Upper Body A", UPPER, weekStartMs - 4 * MS_DAY),
    );
    // Wednesday: Lower Body
    workouts.push(
      generateWorkout(w, 1, "Lower Body", LOWER, weekStartMs - 2 * MS_DAY),
    );
    // Friday: Upper Body A
    workouts.push(generateWorkout(w, 2, "Upper Body A", UPPER, weekStartMs));
  }

  computePRFlags(workouts);

  const totalSets = workouts.reduce((n, w) => n + w.sets.length, 0);
  console.log(`Generated ${workouts.length} workouts, ${totalSets} sets.`);

  // Delete existing workouts for this user.
  const colRef = db.collection("users").doc(USER_UID).collection("workouts");

  const existing = await colRef.listDocuments();
  if (existing.length > 0) {
    console.log(`Deleting ${existing.length} existing workouts...`);
    // Firestore batches cap at 500 operations.
    for (let i = 0; i < existing.length; i += 500) {
      const batch = db.batch();
      for (const d of existing.slice(i, i + 500)) batch.delete(d);
      await batch.commit();
    }
  }

  // Write new workouts in batches.
  console.log(`Writing ${workouts.length} new workouts...`);
  for (let i = 0; i < workouts.length; i += 400) {
    const batch = db.batch();
    for (const w of workouts.slice(i, i + 400)) {
      batch.set(colRef.doc(w.id), w);
    }
    await batch.commit();
  }

  console.log("\nDone. Restart the app to see the data.\n");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
