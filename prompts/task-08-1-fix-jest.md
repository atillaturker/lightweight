TASK 08.1 — FIX COMPONENT TEST SUITE

==================================================
CONTEXT
==================================================

All 12 component test suites under src/components/ fail with:

TypeError: Cannot read properties of undefined (reading 'constructor')
at constructor (node_modules/react-native/jest/mockComponent.js:42:29)
at Object.mockComponent (node_modules/react-native/jest/mocks/Text.js:21:14)
at Text (src/components/Badge/Badge.tsx:36:8)

The failure happens in React Native's own jest mock system, not in
project code. It reproduces on the simplest component (Badge, which
uses only View and Text — no SVG, no third-party imports).

Infrastructure tests under src/infrastructure/ pass (14 tests).

==================================================
ENVIRONMENT
==================================================

- react-native 0.81.5
- react 19.1.0
- jest-expo ~54.0.0
- @testing-library/react-native 13.3.3 (recently downgraded from 14.0.1)
- react-test-renderer 19.1.0 (just installed to match RNTL 13)
- babel-preset-expo installed at root
- jest preset: "jest-expo"

==================================================
DIAGNOSIS STEPS
==================================================

Step 1 — Check for dual React installs:

npm ls react

Report whether more than one version of React exists in the tree.
If yes, identify which package brings the second copy.

Step 2 — Clear jest cache and rerun:

npx jest --clearCache
npx jest src/components/Badge --no-cache

Report whether the error is identical or different.

Step 3 — Inspect the actual failure:

Read node_modules/react-native/jest/mockComponent.js (around line 42).
Read node_modules/react-native/jest/mocks/Text.js.
Read node_modules/react-native/jest/mock.js.

Identify why mockComponent tries to read `.constructor` of something
undefined. Report the actual cause.

Step 4 — Check RNTL 13 vs jest-expo expectation:

Read the test setup that jest-expo installs.
Determine whether jest-expo expects react-test-renderer or
test-renderer.
Determine whether the two are fighting.

==================================================
FIX — apply whichever is correct, verify with tests
==================================================

Candidate fixes (choose the one that actually works, in this order):

A) Create jest.setup.js with a mock override for react-native's
Text and View that bypasses mockComponent. Add to package.json:

     "jest": {
       "preset": "jest-expo",
       "setupFilesAfterEach": ["<rootDir>/jest.setup.js"],
       "transformIgnorePatterns": [...existing...]
     }

The setup file should:

     jest.mock('react-native/Libraries/Text/Text', () => {
       const React = require('react');
       const RN = jest.requireActual('react-native/Libraries/Text/Text');
       return RN;
     });

Or, if mockComponent is the culprit, patch it directly:

     jest.mock('react-native/jest/mockComponent', () => {
       return (name) => {
         const React = require('react');
         return class Mock extends React.Component {
           render() { return React.createElement(name, this.props); }
         };
       };
     });

B) Downgrade react-native to a version that jest-expo 54 expects.
This is a last resort — do NOT do this without explicit permission.

C) Downgrade jest-expo to a version compatible with RN 0.81 +
React 19.1 + RNTL 13.

Do NOT add new dependencies other than the ones already installed.

==================================================
VERIFY
==================================================

After applying the fix:

npx tsc --noEmit
npx jest src/components
npx jest src/domain
npx jest src/infrastructure

ALL four commands must pass cleanly. Report the actual output of
each, trimmed.

==================================================
DELIVERABLES
==================================================

Report ONLY:

- Root cause: one sentence
- Files modified/created: list
- tsc: clean / error count
- jest src/components: X passed, Y failed
- jest src/domain: X passed, Y failed
- jest src/infrastructure: X passed, Y failed
- Judgment calls: max 3 bullets

Do NOT report a fix that you did not verify by running the commands.
If you cannot fix it, say so honestly and stop — do not fake a pass.

Then stop.
