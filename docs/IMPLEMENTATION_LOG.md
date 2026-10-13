# Implementation log

## 2026-10-13 — v1 first slice

### Done
- Expo SDK 57 + TypeScript (strict) + Expo Router, iOS first. Dark mode only.
- Liquid Glass design: native tab bar (`expo-router/unstable-native-tabs`), `expo-glass-effect` surfaces with a blur fallback, Apple dark system colours, SF Symbols in the tab bar.
- **Home dashboard:** greeting and date (Lagos time), connection status, alerts (unavailable devices, connection errors), scenes, today’s meals with one-tap done, “Up next” timed meals, pinned devices, room summary, and an honest energy card (no readings until real hardware exists).
- **Meal planner:** day view by meal type, week view, week strip with navigation, create/edit/delete, copy to tomorrow/next week, reschedule by changing the day, status (planned/preparing/done/skipped), servings, time, notes, optional cost in naira (never guessed), custom meals without a recipe, custom meal types, duplicate warning.
- **Recipe library:** 8 original starter recipes (Nigerian + international) with ingredients and quantities; recipe detail with “Plan this for today”.
- **Rooms:** PRD rooms seeded; devices grouped by room; touch-and-hold to move rooms or pin to Home.
- **Home Assistant:** configurable connection (URL + long-lived token, tested before saving, token in keychain), REST client with timeouts and typed errors, WebSocket live updates with bounded reconnect and state reconciliation, disconnect that deletes the token, and a **demo home** used by default.
- **Module registry** with Kitchen, Exercise, Wardrobe, Energy and Reminders listed as coming next.
- Tests: 54 (dates/timezone boundary, money, meal rules, SQLite repository + migrations, REST errors, WebSocket auth/reconnect/backoff, demo home).

### Verified
- `npm test`, `npm run typecheck`, `npm run lint` all pass.
- iOS bundle builds (`expo export --platform ios`).
- Browser click-through: add a meal, it shows on Home and survives reload; toggling a light updates its tile; duplicate warning appears.

### Not verified (needs Timi’s iPhone)
- Running on a physical iPhone / Expo Go, and how native Liquid Glass actually looks on iOS 26.
- A real Home Assistant connection (none exists yet). Live client is covered by tests against mocked HA responses only. **The demo home is not a hardware integration.**

### Known limitations
- Recipes are read-only in the app for now (add/edit recipe comes with Phase 2 ingredients work).
- Rooms can’t be renamed or added yet.
- Timezone is fixed to Africa/Lagos (configurable setting planned).
- No dashboard card reordering yet (PRD: later version).
- Web preview is a dev aid; some native dialogs (room picker) are no-ops there.

### Next
1. Phase 2: ingredients + inventory, recipe editor, serving scaling in the plan, meal completion with optional inventory deduction, shopping list from the plan minus inventory, manual prices and NGN budget.
2. Exercise routine module (rule-based weekly plan, today’s session on Home).
3. Wardrobe module (catalogue owned clothes, rule-based outfit suggestions, gap-based “buy next”).
4. Phase 3: cooking reminders (local notifications), household tasks, room editing.
5. Hardware: choose a Home Assistant host, then connect and replace the demo home.

### Open questions for Timi
- Which computer could run Home Assistant (or budget for a small dedicated box)?
- Inverter and battery make/model (needed before any energy work).
- Household size / default servings, and cuisine preferences.
