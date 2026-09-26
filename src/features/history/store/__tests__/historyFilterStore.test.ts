/**
 * Tests for the History list filter store.
 *
 * The filter lives outside the screen so Progress can preselect "PR only"
 * before navigating; these pin the set/reset contract that enables it.
 */
import { useHistoryFilterStore } from '../historyFilterStore';

beforeEach(() => {
  useHistoryFilterStore.setState({ filter: 'all' });
});

describe('historyFilterStore', () => {
  it('defaults to all sessions', () => {
    expect(useHistoryFilterStore.getState().filter).toBe('all');
  });

  it('sets the filter to PR only', () => {
    useHistoryFilterStore.getState().setFilter('pr');

    expect(useHistoryFilterStore.getState().filter).toBe('pr');
  });

  it('resets back to all', () => {
    useHistoryFilterStore.getState().setFilter('pr');
    useHistoryFilterStore.getState().resetFilter();

    expect(useHistoryFilterStore.getState().filter).toBe('all');
  });
});
