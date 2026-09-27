# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm start                  # Expo dev server (dev client build, not Expo Go)
npm run ios                # native build + run on iOS
npm run android            # native build + run on Android

npm run typecheck          # tsc --noEmit
npm run lint               # expo lint
npm test                   # jest-expo suite (TZ pinned to America/New_York)
npm test -- path/to/file.test.ts     # one test file
npm test -- -t 'does X'              # tests whose name matches
npm run test:rules         # Firestore rules vs emulator (needs Java 21)

node scripts/seed-firestore.js <uid> # seed a user's Firestore data (firebase-admin;
                                     # key from GOOGLE_APPLICATION_CREDENTIALS)
```

## Notes for Claude Code

- The per-area `AGENTS.md` files under `src/` (see "When to read which
  file" above) are not loaded automatically. Read the matching one before
  working in that area.
- `prompts/` holds past task briefs and is not current guidance; the code
  and `AGENTS.md` win when they disagree. `src/_legacy/` is reference-only.
