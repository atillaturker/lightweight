export const spacing = {
  xxs: 2, // 2px
  xs: 4, // 4px
  s: 8, // 8px
  m: 12, // 12px
  l: 16, // 16px
  xl: 20, // 20px
  xxl: 24, // 24px
  "3xl": 32, // 32px
  "4xl": 40, // 40px
  "5xl": 48, // 48px

  // Layout specific
  gutter: 16,
  container: 24,
} as const;

export type Spacing = typeof spacing;
