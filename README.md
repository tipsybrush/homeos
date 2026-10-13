# HomeOS

A personal home app for a Lagos apartment: smart-home control through Home Assistant, a daily meal planner, and (next) kitchen, groceries, exercise and wardrobe — in one dark, iOS 26 Liquid Glass interface.

**Status:** first slice of v1. Dashboard, persistent meal planner, recipe library, rooms, and a configurable Home Assistant connection. There is no Home Assistant yet, so the app ships with a clearly labelled **demo home** (not real devices). See [docs/IMPLEMENTATION_LOG.md](docs/IMPLEMENTATION_LOG.md) for what is done, what is mocked, and what is next.

## Run it

Requirements: Node 20+ and the **Expo Go** app on your iPhone (iOS 26 for native Liquid Glass; older iOS falls back to a blur).

```bash
npm install
npm start          # scan the QR code with the iPhone camera
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm test` | Unit and integration tests (Jest, runs SQL against real SQLite) |
| `npm run typecheck` | TypeScript, strict mode |
| `npm run lint` | ESLint (Expo config) |
| `npm run web` | Browser preview. A development aid only; the iPhone app is the product |

If Expo Go ever says a native module is missing, build a development client instead: `npx expo run:ios` (Mac + Xcode) or `npx eas-cli@latest build --profile development`.

## Connecting Home Assistant (later)

1. In Home Assistant: your profile → Security → **Long-lived access tokens** → Create token.
2. In HomeOS: More → Home Assistant → **My Home Assistant**. Enter the address (e.g. `http://homeassistant.local:8123`) and paste the token.
3. HomeOS tests the connection before saving. The token is stored only in the iPhone keychain (`expo-secure-store`), never in the database, logs or source.

Disconnecting deletes the token. Meals and rooms keep working with Home Assistant off or unreachable.

Don’t expose Home Assistant’s port to the internet. For access away from home use Home Assistant Cloud or a VPN.

## Architecture

```
src/
  app/                    Expo Router routes (every file is a screen)
    (tabs)/               Home · Rooms · Meals · Kitchen · More (native Liquid Glass tab bar)
    meal/[id].tsx         Meal editor sheet (id = "new" to create)
    recipes.tsx, recipe/  Recipe library
    settings/             Home Assistant connection
  core/
    db/                   SQLite: migrations (PRAGMA user_version), seed data, settings
    theme/tokens.ts       All colours, type, spacing (dark, Apple system palette)
    modules/registry.ts   Module list: where exercise, wardrobe, kitchen etc. slot in
    dates.ts, money.ts    Timezone-aware date keys; NGN stored as integer kobo
  features/
    meals/                Types, pure rules (logic.ts), repository, hooks, components
    homeassistant/        Client interface, REST + WebSocket live client, demo client, provider
    rooms/                Room ↔ entity assignments
  ui/                     Glass, Screen, Button, Chip, TextField, Row… (Liquid Glass kit)
```

Two domains, kept apart as the PRD asks:

- **Smart home** — Home Assistant is the source of truth. Screens talk to `HomeAssistantProvider`, which talks to a `HomeAssistantClient`: either `createLiveClient` (REST for reads/commands, WebSocket for live updates with bounded backoff and state reconciliation after reconnects) or `createMockClient` (the demo home). Commands only change what is shown after Home Assistant confirms them; failures are shown, never hidden.
- **Household** — meals, recipes, rooms, settings in a local SQLite database (`expo-sqlite`). Works fully offline.

### Data model (v1 schema)

`settings`, `rooms`, `device_refs` (HA entity → room, pinned to Home), `ingredients`, `recipes`, `recipe_ingredients`, `meal_plan_entries`. A meal entry needs either a recipe or a custom name (enforced by a CHECK constraint). Dates are stored as local `YYYY-MM-DD` in the household timezone (`Africa/Lagos` by default) so meals never jump days at midnight. Migrations are append-only in `src/core/db/migrations.ts`.

### Adding a module (exercise, wardrobe…)

1. Create `src/features/<module>/` (types, logic, repository, components).
2. Add a migration for its tables.
3. Add routes under `src/app/<module>/`.
4. Set its entry in `src/core/modules/registry.ts` to `status: 'available'` with an `href`.

## Troubleshooting

- **“Could not reach Home Assistant”** — phone and Home Assistant must be on the same Wi-Fi; try the IP address instead of `homeassistant.local`.
- **“Token rejected”** — create a new long-lived token; old ones may have been deleted.
- **Tab bar or cards look flat** — native Liquid Glass needs iOS 26; earlier versions use the blur fallback (More → About shows which).
- **Web preview: data not saving** — the browser needs cross-origin isolation for SQLite; use `npm run web` (the dev server sets the headers).

No environment variables are needed, so there is no `.env.example`.
