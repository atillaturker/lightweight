import type { Workout } from '@domain/entities';

import { buildActivityGrid } from '../activityGrid';

const month = (timestamp: number) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][new Date(timestamp).getMonth()];

function session(start: Date, minutes: number, name = 'Push'): Workout {
  return {
    id: String(start.getTime()),
    routineId: null,
    routineName: name,
    startedAt: start.getTime(),
    finishedAt: start.getTime() + minutes * 60_000,
    sets: [],
  };
}

// Wednesday 17 April 2024, midday.
const NOW = new Date(2024, 3, 17, 12).getTime();

describe('buildActivityGrid', () => {
  it('ends with the current Monday-first week and marks later days as future', () => {
    const grid = buildActivityGrid([], NOW, 4, month);
    const last = grid.weeks[3];

    expect(grid.weeks).toHaveLength(4);
    expect(new Date(last.start).getDay()).toBe(1);
    expect(new Date(last.start).getDate()).toBe(15);
    expect(last.days.map((day) => day.future)).toEqual([false, false, false, true, true, true, true]);
  });

  it('shades a day by minutes and lists its sessions', () => {
    const grid = buildActivityGrid(
      [session(new Date(2024, 3, 16, 7), 40, 'Push'), session(new Date(2024, 3, 16, 18), 30, 'Core')],
      NOW,
      4,
      month,
    );
    const tuesday = grid.weeks[3].days[1];

    expect(tuesday).toMatchObject({ minutes: 70, level: 3, sessions: ['Push', 'Core'] });
    expect(grid.activeDays).toBe(1);
  });

  it('labels the column where a month begins', () => {
    const grid = buildActivityGrid([], NOW, 4, month);
    // 1 April 2024 is a Monday: the column starting on it gets "Apr".
    expect(grid.monthLabels).toEqual([{ column: 1, label: 'Apr' }]);
  });
});
