export const typography = {
  /**
   * Font aileleri
   */
  fonts: {
    primary: "Inter",
  },
  /**
   * Font büyüklükleri
   */
  sizes: {
    xxs: 10,
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  /**
   * Font ağırlıkları
   */
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
    extraBold: "800" as const,
  },
};

export type Typography = typeof typography;