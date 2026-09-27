# AGENTS.md — Auth feature

Authentication and session management. Backed by Firebase Auth.

## Current state

Implemented here: email/password, Google and Apple sign-in
(`services/`), `LogInScreen` and `SignUpScreen`, and the auth store.
Firebase itself is initialized in `src/services/firebase/config.ts`.

## Rules

- Firebase only. Do not introduce a new auth provider.
- The Firebase session is persisted by Firebase Auth itself
  (`getReactNativePersistence` over AsyncStorage — the one allowed
  AsyncStorage use). The auth store persists only the last `user` and
  `onboardedUids` to MMKV.
- Firebase's auth subscription (`useAuth`) is the only writer of `user`.
  The root navigator switches stacks on `user !== null`, not on
  `status`.
- Sign-out calls `reset()` on the auth store. It does NOT clear user data:
  per-account stores are switched away by `src/app/providers/userScope.ts`
  and kept for when the account signs back in.
- Onboarding completion is tracked as `hasOnboarded` on `user`, restored
  from the device-local `onboardedUids` record. A new user goes
  Auth → Onboarding → Main.

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

- Do not add social login providers beyond Google and Apple.
- Do not add password strength meters with red-to-green gradients.
- Do not add "remember me" toggles.
