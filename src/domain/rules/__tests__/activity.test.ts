import type { Workout } from '../../entities/Workout';
import { activityLevel, addDays, dailyActivityMinutes, dayKey, startOfDay } from '../activity';

function session(id: string, start: Date, minutes: number | null): Workout {
  const startedAt = start.getTime();
  return {
    id,
    routineId: null,
    routineName: id,
    startedAt,
    finishedAt: minutes === null ? null : startedAt + minutes * 60_000,
    sets: [],
  };
}

describe('dailyActivityMinutes', () => {
  it('sums sessions on the same local day', () => {
    const minutes = dailyActivityMinutes([
      session('am', new Date(2024, 2, 9, 7), 40),
      session('pm', new Date(2024, 2, 9, 19), 25),
      session('next', new Date(2024, 2, 10, 7), 50),
    ]);

    expect(minutes.get(dayKey(new Date(2024, 2, 9).getTime()))).toBe(65);
    expect(minutes.get(dayKey(new Date(2024, 2, 10).getTime()))).toBe(50);
  });

  it('counts an unfinished session as a minute', () => {
    const minutes = dailyActivityMinutes([session('open', new Date(2024, 2, 9, 7), null)]);
    expect(minutes.get(dayKey(new Date(2024, 2, 9).getTime()))).toBe(1);
  });

  it('keys late-evening sessions to the local day', () => {
    const late = new Date(2024, 2, 9, 23, 30);
    expect(dailyActivityMinutes([session('late', late, 20)]).has(dayKey(new Date(2024, 2, 9).getTime()))).toBe(true);
  });
});

describe('activityLevel', () => {
  it('maps minutes to fixed shade steps', () => {
    expect([0, 10, 30, 59, 60, 89, 90, 200].map(activityLevel)).toEqual([0, 1, 2, 2, 3, 3, 4, 4]);
  });
});

describe('day stepping', () => {
  it('steps calendar days across the spring daylight-saving change', () => {
    // US daylight saving starts on 10 March 2024 (tests run in New York).
    const before = startOfDay(new Date(2024, 2, 9, 15).getTime());
    const after = addDays(before, 2);
    expect(new Date(after).getDate()).toBe(11);
    expect(new Date(after).getHours()).toBe(0);
  });
});
