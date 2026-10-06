/**
 * Third-party content shipped in the app and the attribution each license
 * requires. Mirrors `THIRD_PARTY_NOTICES.md` at the repo root; keep the two
 * in sync when a source is added or removed.
 */

/** One third-party source and the notice it requires. */
export interface Acknowledgement {
  id: string;
  title: string;
  /** What the app uses from this source. */
  usage: string;
  /** Copyright / attribution line, shown verbatim. */
  attribution: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  /** How the material was modified, when the license asks to say so. */
  changes?: string;
  /** Full license text, when the license requires shipping it. */
  licenseText?: string;
}

const MIT_PERMISSION = `Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation and data files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

/** Every third-party source, in display order. */
export const ACKNOWLEDGEMENTS: readonly Acknowledgement[] = [
  {
    id: 'exercises-dataset',
    title: 'Exercises Dataset',
    usage: 'Exercise names, muscle groups, equipment and instructions.',
    attribution: 'Copyright (c) 2026 Hasan Emir Yıldırım',
    license: 'MIT License',
    licenseUrl: 'https://opensource.org/license/mit',
    sourceUrl: 'https://github.com/hasaneyldrm/exercises-dataset',
    changes: 'Filtered to strength exercises and mapped to the app’s muscle groups and equipment.',
    licenseText: MIT_PERMISSION,
  },
  {
    id: 'everkinetic',
    title: 'Everkinetic',
    usage: 'Exercise illustrations.',
    attribution: 'Everkinetic, based on everkinetic.com by Greg Priday',
    license: 'Creative Commons Attribution-ShareAlike 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://github.com/everkinetic/data',
    changes:
      'Background removed and line color adapted to the app theme. The modified illustrations are shared under the same license.',
  },
];
