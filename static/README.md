# Lattice — HTML / CSS / JS port

Same landing page as the Next.js project one folder up, rebuilt as plain
HTML, CSS and JavaScript. A tiny zero-dependency Node script
([`server.js`](./server.js)) serves the static files and proxies the three
Marketo REST routes — the OAuth `client_credentials` flow has to stay on the
server, otherwise the client secret would leak to every visitor.

## File map

```
static/
  index.html              # all sections, inline SVGs, no framework
  styles.css              # custom utilities (.container-page, .text-gradient, .field, …)
  script.js               # Munchkin, navbar scroll, counters, lead-form submit
  server.js               # static file server + /api/marketo/* + /config.json
  favicon.svg
  package.json            # npm start → node server.js
  .env.local.example
```

No build step. Tailwind comes in via the Play CDN (`cdn.tailwindcss.com`)
with the original `tailwind.config` re-declared inline at the top of
`index.html`, so every utility class from the React version still resolves.

## Run

```bash
cd static
cp .env.local.example .env.local   # then fill in the values
npm start
```

Open <http://localhost:3000>.

## Env vars

| Var | Where it's used |
| --- | --- |
| `MUNCHKIN_ID` | Public. Sent to the browser via `/config.json` so `script.js` can boot Munchkin. |
| `MARKETO_BASE_URL` | Server-only. e.g. `https://XXX-XXX-XXX.mktorest.com`. |
| `MARKETO_CLIENT_ID` | Server-only. OAuth client id. |
| `MARKETO_CLIENT_SECRET` | Server-only. OAuth client secret. |
| `PORT` | Optional, defaults to `3000`. |

Same env contract as the Next.js project, with two name changes:

- `NEXT_PUBLIC_MUNCHKIN_ID` → `MUNCHKIN_ID` (we expose it explicitly via `/config.json`).
- The three `MARKETO_*` keys are unchanged.

## Endpoints

| Route | Method | Purpose |
| --- | --- | --- |
| `/` | GET | The landing page. |
| `/config.json` | GET | Public Munchkin id, consumed by `script.js`. |
| `/api/marketo/token` | GET | Dev-only. Redacted OAuth token + expiry. Disabled when `NODE_ENV=production`. |
| `/api/marketo/resolve-visitor` | GET | Reads `_mkto_trk` from request cookies and looks up the lead. |
| `/api/marketo/submit` | POST | Validates the form payload, calls `upsertAndAssociate(fields, cookie)`. |

## What changed vs the Next.js version

| Original | Replacement |
| --- | --- |
| React component tree (`app/components/sections/*.tsx`) | Inline HTML in `index.html` |
| `framer-motion` (hero reveal, stat counters) | `.reveal` CSS class + `requestAnimationFrame` in `script.js` |
| `lucide-react` icons | Inline SVGs (Lucide paths copied into the markup) |
| `next/script` (Munchkin + AISeller) | Plain `<script>` tags / dynamic `createElement` |
| `app/api/marketo/*` route handlers | Three handlers in `server.js` |
| `lib/marketo.ts` | Re-implemented as plain JS in `server.js` |

Everything visible — colours, gradients, typography, layout, hover states —
is byte-for-byte the same because `tailwind.config` is mirrored in
`index.html` and the custom utilities (`.text-gradient`, `.grid-bg`,
`.container-page`, `.field`) are copied into `styles.css`.

## Quick verification

After `npm start`:

```bash
# 1. OAuth credentials work
curl -s http://localhost:3000/api/marketo/token | jq

# 2. Open http://localhost:3000 to let Munchkin set _mkto_trk.

# 3. Submit the "Request a demo" form with a real work email.
#    Response: { "ok": true, "status": "created" | "updated",
#                "leadId": 12345, "cookieAttached": true }

# 4. Resolve yourself — give Marketo ~30s to index, then:
curl -s http://localhost:3000/api/marketo/resolve-visitor \
  --cookie "_mkto_trk=<paste from devtools>" | jq
```
