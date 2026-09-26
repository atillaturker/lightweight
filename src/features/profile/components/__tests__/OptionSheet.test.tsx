/**
 * Behavior tests for the generic preference sheet.
 *
 * The sheet is the only interaction surface for units, week start, and the
 * rest timer, so it must render every option and report the tapped value
 * before closing.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import type { WeightUnit } from '@domain/entities';

import {
  OptionSheet,
  type OptionSheetOption,
} from '../OptionSheet';

const OPTIONS: readonly OptionSheetOption<WeightUnit>[] = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lb', label: 'Pounds (lb)' },
];

describe('OptionSheet', () => {
  it('renders the title and every option', () => {
    render(
      <OptionSheet
        onClose={jest.fn()}
        onSelect={jest.fn()}
        options={OPTIONS}
        sectionLabel="Units"
        selectedValue="kg"
        title="Choose units"
        visible
      />,
    );

    expect(screen.getByText('Choose units')).toBeTruthy();
    expect(screen.getByText('Units')).toBeTruthy();
    expect(screen.getByText('Kilograms (kg)')).toBeTruthy();
    expect(screen.getByText('Pounds (lb)')).toBeTruthy();
  });

  it('calls onSelect with the tapped value, then closes', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    render(
      <OptionSheet
        onClose={onClose}
        onSelect={onSelect}
        options={OPTIONS}
        sectionLabel="Units"
        selectedValue="kg"
        title="Units"
        visible
      />,
    );

    fireEvent.press(screen.getByText('Pounds (lb)'));

    expect(onSelect).toHaveBeenCalledWith('lb');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
