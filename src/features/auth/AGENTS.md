# AGENTS.md — Auth feature

Authentication and session management. Backed by Firebase Auth.

## Current state

Legacy auth lives under `/src/screens/auth/`, `/src/services/firebase/`,
`/src/schemas/`, and `/src/hooks/useAuthActions`. It WORKS. Do not
refactor it until the new feature-based auth is written.

## Rules

- Firebase only. Do not introduce a new auth provider.
- Session tokens live in `react-native-mmkv` under the key `auth:session`.
  Never in `AsyncStorage`.
- After successful sign-in, set `authStatus: 'authenticated'` in the
  auth store. The root navigator reacts to this and swaps stacks.
- After sign-out, clear the auth store AND the local session, then
  invalidate every TanStack Query cache key.
- Onboarding completion is tracked as `hasOnboarded` in the same store.
  A new user goes Auth → Onboarding → Main.

## Screens (new implementation)

- `SignUpScreen` and `LogInScreen` share one layout. Only the primary
  label and two extra fields differ.
- Auth screen has NO tab bar. Full-screen focused mode.
- Primary CTA is NEVER disabled. Validation produces inline errors
  on submit. A disabled button gives the user no path forward.

## Error handling

- Invalid email → inline error under the field.
- Wrong credentials → single line above the primary CTA.
- Network failure → same treatment, message reads "Check your connection."
- Never use a modal or toast for auth errors.

## Do not

- Do not add social login providers beyond Apple.
- Do not add password strength meters with red-to-green gradients.
- Do not add "remember me" toggles.
- Do not touch legacy auth until the new screens are feature-complete.
