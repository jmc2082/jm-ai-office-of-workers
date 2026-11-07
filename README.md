# jm-ai-office-of-workers (web)

Vue 3 dashboard for the JM Office of AI Workers: the Office view, Needs You approvals,
workers, runs and cost. Talks to the `jm-ai-office-api` repo (also where the roadmap lives, under `planning/`).

## Quick start

```bash
npm install
cp .env.example .env.local   # VITE_API_BASE_URL=http://localhost:4100/api
npm run dev                  # http://localhost:5173
```

Start the API first (`npm run start:dev` in `code/backends/jm-ai-office-api`; `npm run db:seed:demo`
there fills the office with demo workers).

## Pages

| Route | What it shows |
|---|---|
| `/login` | Cognito sign-in (email + password; new-password and authenticator-code steps) |
| `/` | The office: stats, department floor, selected worker, everyone, Needs You, Happening now, Replay |
| `/needs-you` | Open approvals with notes, and resolved history |
| `/workers`, `/workers/:slug` | Enable/disable, status, Run now, recent runs and activity |
| `/runs`, `/runs/:id` | Filterable run list; detail with log, tokens, cost, cards, events |
| `/cost` | Total and daily spend, and spend per worker |

## How it fits together

- `src/stores/office.ts`: one Pinia store. Loads stats, workers, open cards and replay; opens one
  SSE connection (`useEventStream`) and refetches (debounced) whenever an event arrives.
- `src/services/officeApi.ts`: every API call, typed by `src/interfaces/office.ts`.
- `src/services/authService.ts` + `src/stores/auth.ts`: Cognito sign-in (Amplify Auth, SRP). The router
  sends signed-out visitors to `/login`; `src/plugins/axios.ts` adds the access token to every call and
  signs out on a 401; the SSE feed reconnects with a fresh token when the old one expires.
  Sign-in is on only when `VITE_COGNITO_USER_POOL_ID` and `VITE_COGNITO_CLIENT_ID` are set: they are
  in `.env.production` (committed; the IDs are public) and left out of `.env.local`, so local dev runs
  without a login against the API's `AUTH_DISABLED=true`.
- `src/assets/main.css`: Tailwind v4 + Flowbite, plus the office color tokens (light and dark).
  Status colors are only used for state and always appear with an icon and label.
- "Today" is the viewer's local midnight, sent to the API as `since`.

## Tests

```bash
npm run test:unit                          # Vitest
npx playwright test --project=chromium     # E2E with the API mocked
npm run build                              # type-check + production build
```
