/**
 * Keeps the set row being edited above the keyboard.
 *
 * The screen's numeric fields are not real inputs — the keyboard is raised
 * by one hidden `TextInput`, so the platform never scrolls the row the user
 * is looking at into view. This hook restores that for free by measuring the
 * focused row against the scroll viewport, which has already been shrunk by
 * the screen's `KeyboardAvoidingView`, and scrolling by exactly the overflow.
 *
 * Reveal is re-attempted whenever the geometry that decides visibility
 * changes: the keyboard appearing (Android can cover content without
 * resizing the window), the viewport being resized by `KeyboardAvoidingView`,
 * and the draft moving to another cell.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
  type View,
} from 'react-native';

import type { FocusedCell } from '../types';

/** Gap left between the focused row and the bottom edge of the viewport. */
const REVEAL_MARGIN = 20;

/** Handlers and refs the screen wires into its scroll view and rows. */
export interface CellReveal {
  /** Attach to the scroll view that contains the set table. */
  scrollRef: React.RefObject<ScrollView | null>;
  /** Attach to the scroll view's `innerViewRef`. */
  innerViewRef: React.RefObject<View>;
  /** Register a row element so it can be measured. Pass to `ExerciseBlock`. */
  registerRowRef: (setId: string, node: View | null) => void;
  /** Attach to the scroll view's `onScroll`. */
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Attach to the scroll view's `onLayout`. */
  onLayout: (event: LayoutChangeEvent) => void;
}

/**
 * Tracks the geometry needed to scroll `focusedCell` clear of the keyboard,
 * and performs the scroll when the cell would otherwise be hidden.
 */
export function useCellReveal(focusedCell: FocusedCell | null): CellReveal {
  const scrollRef = useRef<ScrollView | null>(null);
  // `ScrollView` types `innerViewRef` as a non-nullable ref, while a ref is
  // always null before mount. The cast bridges that type gap only; the null
  // check below still guards the first render.
  const innerViewRef = useRef<View | null>(null) as React.RefObject<View>;
  const rowsRef = useRef<Map<string, View | null>>(new Map());
  const offsetRef = useRef(0);
  const viewportRef = useRef(0);
  const [geometryEpoch, setGeometryEpoch] = useState(0);

  const registerRowRef = useCallback((setId: string, node: View | null): void => {
    if (node === null) {
      rowsRef.current.delete(setId);
      return;
    }
    rowsRef.current.set(setId, node);
  }, []);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      offsetRef.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  const onLayout = useCallback((event: LayoutChangeEvent): void => {
    viewportRef.current = event.nativeEvent.layout.height;
    setGeometryEpoch((epoch) => epoch + 1);
  }, []);

  // Android can raise the keyboard over the content instead of resizing it,
  // in which case no layout pass follows — the reveal has to re-run anyway.
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', () =>
      setGeometryEpoch((epoch) => epoch + 1),
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (focusedCell === null) return;

    const row = rowsRef.current.get(focusedCell.setId);
    const scroll = scrollRef.current;
    const content = innerViewRef.current;
    const viewport = viewportRef.current;
    if (row == null || scroll == null || content == null || viewport <= 0) {
      return;
    }

    // `measureLayout` against the content container returns the row's
    // position in content coordinates, independent of the current scroll
    // offset. The target offset is therefore the row's bottom minus the
    // visible height of the viewport — never the current offset plus an
    // overflow, which would double-count the offset and drift downward on
    // every reveal.
    row.measureLayout(content, (_x, y, _width, height) => {
      const visibleBottom = offsetRef.current + viewport - REVEAL_MARGIN;
      const rowBottom = y + height;
      if (rowBottom <= visibleBottom) return;
      scroll.scrollTo({
        y: Math.max(rowBottom - viewport + REVEAL_MARGIN, 0),
        animated: true,
      });
    });
  }, [focusedCell, geometryEpoch]);

  return { scrollRef, innerViewRef, registerRowRef, onScroll, onLayout };
}
