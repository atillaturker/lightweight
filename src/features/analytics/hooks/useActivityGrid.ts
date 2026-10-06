/**
 * Activity heatmap read model for the last `weeks` weeks; recomputes when
 * history changes.
 */
import { useMemo } from 'react';

import { useHistoryStore } from '@features/history';
import { formatMonthShort } from '@lib/format';

import { buildActivityGrid, type ActivityGrid } from '../utils';

/** Grid for the heatmap. */
export function useActivityGrid(weeks: number): ActivityGrid {
  const sessions = useHistoryStore((state) => state.sessions);
  return useMemo(
    () => buildActivityGrid(sessions, Date.now(), weeks, formatMonthShort),
    [sessions, weeks],
  );
}
