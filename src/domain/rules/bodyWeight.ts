import type { BodyWeightEntry } from '../entities/BodyWeight';
import { addDays, startOfDay } from './activity';
import { addWeeks, startOfWeek, weeksBetween } from './volume';

/** `YYYY-MM-DD` of the local day containing `timestamp`. */
export function isoDay(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Local midnight of an `YYYY-MM-DD` day. */
export function dayStartOf(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

/** Entries the user has not removed, oldest day first. */
export function liveEntries(entries: BodyWeightEntry[]): BodyWeightEntry[] {
  return entries.filter((entry) => entry.deleted !== true).sort((a, b) => a.date.localeCompare(b.date));
}

/** The most recent live entry, or `null`. */
export function latestEntry(entries: BodyWeightEntry[]): BodyWeightEntry | null {
  return liveEntries(entries).at(-1) ?? null;
}

/**
 * Change from the last entry on or before `days` days ago to the latest
 * entry, in kg, or `null` when there is no earlier entry to compare.
 */
export function weightChange(entries: BodyWeightEntry[], days: number, now: number): number | null {
  const live = liveEntries(entries);
  const latest = live.at(-1);
  if (latest === undefined) return null;
  const cutoff = isoDay(addDays(startOfDay(now), -days));
  const baseline = [...live].reverse().find((entry) => entry.date <= cutoff);
  return baseline === undefined ? null : latest.weightKg - baseline.weightKg;
}

/**
 * Average weight per week for the last `weeks` weeks ending with the week
 * of `now` (Monday first), oldest first; `null` for weeks with no entry.
 */
export function weeklyAverageWeights(
  entries: BodyWeightEntry[],
  now: number,
  weeks: number,
): (number | null)[] {
  const first = addWeeks(startOfWeek(now, 'monday'), -(weeks - 1));
  const sums = Array.from({ length: weeks }, () => ({ total: 0, count: 0 }));
  for (const entry of liveEntries(entries)) {
    const index = weeksBetween(first, startOfWeek(dayStartOf(entry.date), 'monday'));
    if (index < 0 || index >= weeks) continue;
    sums[index].total += entry.weightKg;
    sums[index].count += 1;
  }
  return sums.map(({ total, count }) => (count === 0 ? null : total / count));
}

/** Result of merging the cloud's entries with the device's. */
export interface BodyWeightMerge {
  entries: BodyWeightEntry[];
  /** Local entries (tombstones included) the cloud lacks or holds older. */
  toUpload: BodyWeightEntry[];
}

/** Union by day; the newer `updatedAt` wins, the cloud on a tie. */
export function mergeBodyWeight(local: BodyWeightEntry[], remote: BodyWeightEntry[]): BodyWeightMerge {
  const byDate = new Map(remote.map((entry) => [entry.date, entry]));
  const toUpload: BodyWeightEntry[] = [];
  for (const entry of local) {
    const cloud = byDate.get(entry.date);
    if (cloud === undefined || entry.updatedAt > cloud.updatedAt) {
      byDate.set(entry.date, entry);
      toUpload.push(entry);
    }
  }
  return { entries: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)), toUpload };
}
