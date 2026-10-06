/**
 * Geometry of the muscle map: a front and a back figure, each in a
 * 120 × 220 viewBox. Drawn for this app (not traced from any source).
 * Shapes listed under `*_SIDES` are the figure's left-hand copy; the
 * right-hand copy is produced by {@link mirrorPath}.
 */
import type { BodyRegion } from "@domain/rules";

/** Width of each figure's viewBox. */
export const FIGURE_WIDTH = 120;

/** Height of each figure's viewBox. */
export const FIGURE_HEIGHT = 220;

/** Region → SVG path data. */
export type RegionShapes = Partial<Record<BodyRegion, readonly string[]>>;

/** Mirror an absolute path across the figure's vertical center line. */
export function mirrorPath(d: string): string {
  return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x: string, y: string) =>
    `${Number((FIGURE_WIDTH - Number(x)).toFixed(1))} ${y}`,
  );
}

const SHOULDER = "M47 41 C40 40 33 42 30 50 C28 56 30 60 33 61 C36 55 41 50 47 48 Z";
const UPPER_ARM = "M31 62 C28 66 26 74 26 82 C27 86 31 86 33 83 C35 76 36 69 35 63 Z";
const FOREARM = "M26 87 C23 95 21 104 20 113 C22 116 25 116 27 113 C29 104 31 96 32 89 Z";
const ABDUCTOR = "M41 100 C38 104 37 110 38 116 C40 116 42 111 43 106 Z";

export const FRONT_SIDES: RegionShapes = {
  shoulders: [SHOULDER],
  chest: ["M48 45 C53 44 58 44 59 45 L59 66 C54 68 46 67 40 63 C36 60 36 55 38 52 C41 49 44 46 48 45 Z"],
  biceps: [UPPER_ARM],
  forearms: [FOREARM],
  obliques: ["M40 66 C44 69 48 70 51 70 C50 82 51 94 52 104 C48 103 44 100 42 96 C40 87 39 76 40 66 Z"],
  abductors: [ABDUCTOR],
  quads: ["M43 108 C47 107 52 108 55 111 C56 124 55 138 54 150 C50 154 45 154 42 150 C39 137 39 121 43 108 Z"],
  adductors: ["M56.5 113 C58.5 116 59.5 120 59.5 126 C59.5 133 58.5 139 56.5 143 C56.5 133 57 123 56.5 113 Z"],
  calves: ["M44 160 C47 158 52 158 54 160 C55 172 54 186 52 198 C49 200 46 200 45 198 C43 186 42 172 44 160 Z"],
};
export const FRONT_CENTER: RegionShapes = {
  abs: ["M53 69 L67 69 C68 80 68 92 66 104 C62 107 58 107 54 104 C52 92 52 80 53 69 Z"],
};

export const BACK_SIDES: RegionShapes = {
  shoulders: [SHOULDER],
  triceps: [UPPER_ARM],
  forearms: [FOREARM],
  upperBack: ["M46 47 C50 52 55 57 59 62 L59 72 C53 71 46 68 42 64 C41 58 42 52 46 47 Z"],
  lats: ["M41 66 C46 70 53 73 59 74 L59 82 C55 88 50 92 46 94 C43 88 40 78 41 66 Z"],
  abductors: [ABDUCTOR],
  glutes: ["M44 104 C48 102 55 103 59 106 L59 122 C55 126 48 126 45 122 C42 117 42 109 44 104 Z"],
  hamstrings: ["M43 127 C48 129 54 129 58 128 C58 139 56 148 54 154 C50 156 46 156 43 153 C41 144 41 136 43 127 Z"],
  calves: ["M44 160 C48 157 53 158 55 162 C57 172 55 184 52 196 C49 199 46 199 45 196 C42 184 41 170 44 160 Z"],
};
export const BACK_CENTER: RegionShapes = {
  traps: ["M52 34 L68 34 C72 38 78 41 82 43 C74 46 68 52 60 60 C52 52 46 46 38 43 C42 41 48 38 52 34 Z"],
  lowerBack: ["M50 92 C54 88 57 86 60 86 C63 86 66 88 70 92 C70 98 69 102 68 104 L52 104 C51 102 50 98 50 92 Z"],
};

/** Non-muscle parts (head, hands, knees, feet): drawn so the figure reads as a body. */
export const INERT_SIDES: readonly string[] = [
  "M21 117 C18 120 18 126 21 128 C24 128 26 124 25 119 Z", // hand
  "M44 152 C47 155 51 156 54 154 L54 158 C51 160 47 160 44 158 Z", // knee
  "M45 200 C44 204 45 208 49 208 C53 208 54 204 52 200 Z", // foot
];
export const INERT_CENTER: readonly string[] = [
  "M60 6 C67 6 71 12 71 20 C71 28 66 33 60 33 C54 33 49 28 49 20 C49 12 53 6 60 6 Z", // head
  "M55 32 L65 32 L66 40 L54 40 Z", // neck
];
