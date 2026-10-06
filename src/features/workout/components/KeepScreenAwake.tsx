/**
 * Keeps the screen on while mounted. Rendered by Active Workout only while
 * a live session is open, so the phone never locks between sets and the
 * lock is released the moment the session screen goes away.
 */
import { useKeepAwake } from 'expo-keep-awake';

/** Tag so this lock never releases one taken elsewhere. */
const KEEP_AWAKE_TAG = 'active-workout';

/** Renders nothing; holds the keep-awake lock for its lifetime. */
export function KeepScreenAwake(): null {
  useKeepAwake(KEEP_AWAKE_TAG);
  return null;
}
