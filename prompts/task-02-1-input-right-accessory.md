# Fix — Input rightAccessory

The Input primitive at /src/components/Input/ is missing the
rightAccessory prop support. The Task 2 spec required it, but the
implementation does not accept the prop, and the Playground screen
worked around it with an absolutely positioned Pressable over the
Input. That workaround causes text to render under the accessory
when the user types a long value.

Fix the Input primitive so that rightAccessory is a first-class prop.

Read first:
/AGENTS.md
/src/components/AGENTS.md
/src/components/Input/Input.tsx
/src/components/Input/Input.styles.ts

## Required changes

1. Add to InputProps:
   rightAccessory?: React.ReactNode;

2. When rightAccessory is provided:
   - Render it inside the input container, right-aligned,
     vertically centered, 12px from the right edge.
   - Increase the text input's right padding to 44px so text never
     renders under the accessory.

3. When rightAccessory is NOT provided:
   - Right padding stays at the default spacing.lg (16px).

4. Do not change any other behavior. Do not change the Input's
   height, radius, border color, focus state, or error state.

5. Update the existing Input tests to cover:
   - rightAccessory renders when provided
   - text input receives the larger right padding when
     rightAccessory is present
   - everything continues to pass with the default case

## Do not

- Do not modify any other component.
- Do not modify the Playground screen.
- Do not add new dependencies.
- Do not change the public API in any other way.

## Deliverables

1. Updated Input.tsx and Input.styles.ts
2. Updated Input.test.tsx
3. Run: npx tsc --noEmit
4. Run: npx jest src/components/Input
5. Report: line counts, test pass/fail, any judgment calls

Then stop.
