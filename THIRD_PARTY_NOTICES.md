# Third-party notices

Data and media from other projects that ship inside the app. The same
attributions are shown in the app under Profile → App → Acknowledgements
(`src/features/profile/acknowledgements.ts`); keep both in sync.

Regenerate the bundled files with:

```bash
node scripts/build-exercise-catalog.mjs <exercises-dataset>/data/exercises.json <everkinetic-data-checkout>
```

---

## Exercises Dataset

- **Source:** https://github.com/hasaneyldrm/exercises-dataset
- **Used for:** exercise names, muscle groups, equipment, target and
  secondary muscles, English instructions.
- **Bundled as:** `src/features/routines/data/exerciseCatalog.json`
- **License:** MIT (text, data and translations only).
- **Changes:** filtered to strength exercises (no cardio, neck, stretches
  or unsupported equipment) and mapped onto the app's muscle groups and
  equipment; names cleaned and title-cased.
- **Not used:** the dataset's `images/` and `videos/` media. Those are
  © Gym visual and are not covered by the MIT license; nothing from them
  is bundled.

```
MIT License

Copyright (c) 2026 Hasan Emir Yıldırım

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation and data files (the "Software"),
to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Everkinetic

- **Source:** https://github.com/everkinetic/data (open data project based
  on everkinetic.com by Greg Priday)
- **Used for:** exercise illustrations (start and end pose).
- **Bundled as:** `assets/exercises/*.svg`, indexed by
  `src/features/routines/data/exerciseMedia.ts`
- **License:** Creative Commons Attribution-ShareAlike 4.0 International
  (https://creativecommons.org/licenses/by-sa/4.0/)
- **Changes:** the white background layer was removed and the line color
  replaced with `currentColor` so the drawings follow the app theme. The
  modified illustrations in `assets/exercises/` are licensed under CC BY-SA
  4.0 as well (see `assets/exercises/LICENSE.md`). The ShareAlike term
  applies to these illustrations only, not to the app's source code.
