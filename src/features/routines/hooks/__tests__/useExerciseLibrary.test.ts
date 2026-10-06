import { renderHook } from '@testing-library/react-native';

import type { Exercise } from '@domain/entities';

import { useCustomExerciseStore } from '../../store';
import { useExerciseLibrary } from '../useExerciseLibrary';

function custom(id: string, createdAt: number, isArchived = false): Exercise {
  return {
    id: `custom-${id}`,
    name: id,
    muscleGroup: 'back',
    equipment: 'machine',
    pictogramId: '',
    isCustom: true,
    isArchived,
    createdAt,
  };
}

describe('useExerciseLibrary', () => {
  it('lists active custom exercises first, newest first, then built-ins', () => {
    useCustomExerciseStore.setState({ exercises: [custom('older', 1), custom('newer', 2)] });

    const { result } = renderHook(() => useExerciseLibrary());

    expect(result.current.pickable.slice(0, 3).map((e) => e.id)).toEqual([
      'custom-newer',
      'custom-older',
      'bench-press',
    ]);
  });

  it('hides archived exercises from the picker but still resolves them', () => {
    useCustomExerciseStore.setState({ exercises: [custom('gone', 1, true)] });

    const { result } = renderHook(() => useExerciseLibrary());

    expect(result.current.pickable.some((e) => e.id === 'custom-gone')).toBe(false);
    expect(result.current.byId.get('custom-gone')?.name).toBe('gone');
  });
});
