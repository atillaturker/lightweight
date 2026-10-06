import { numericColumns } from '../ExerciseBlock';

describe('numericColumns', () => {
  it('uses kg and Reps for a loaded exercise', () => {
    expect(numericColumns({}, false)).toEqual(['kg', 'Reps']);
  });

  it('labels added load for bodyweight exercises', () => {
    expect(numericColumns({ bodyweight: true }, false)).toEqual(['+kg', 'Reps']);
  });

  it('labels per-side reps', () => {
    expect(numericColumns({ perSide: true }, false)).toEqual(['kg', 'Reps/side']);
  });

  it('logs time for timed exercises, with RPE when shown', () => {
    expect(numericColumns({ measure: 'time' }, true)).toEqual(['+kg', 'Time', 'RPE']);
  });
});
