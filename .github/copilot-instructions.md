## Quick orientation

This repository implements the "Coffee Tree" platform: smart contracts + indexing/event pipelines + API server + frontend + market providers. Key concerns for an agent: where state is stored (LMDB + SQLite), how events flow from Hedera mirror-node into the app, and which scripts are the canonical developer workflows.

## Big-picture architecture (short)
- Contracts: Solidity sources in `contracts/` and ABIs in `abi/`. Contracts emit events parsed by indexers.
- Event ingestion: `events/*` contains mirror-node readers and indexers. They write to LMDB (local-store) and then to the relational DB via processors.
- Persistence: LMDB is used for streaming/event storage (`lib/store.ts` + `lmdb-shim.ts`). Relational data lives in SQLite (`local-store/sqlite/sqlite.db`) via Drizzle ORM (`db/`, `drizzle.config.ts`).
- API: `api/server.ts` is the single HTTP entrypoint (Node + raw http with an Express-like adapter). It imports modular APIs from `api/*.ts`.
- Providers & background services: `providers/*` (price-provider, timeseries-provider) run as background workers and are started by the `providers` / `start` scripts.
- Frontend: `frontend/` contains a small demo server used in `dev` flows.

## Developer workflows (commands you should use)
- Install and run with pnpm (package.json defines scripts). Primary commands:
  - `pnpm run build` — compile and bundle via `tsup` -> `dist/`.
  - `pnpm run api` — run the TypeScript API server (`tsx api/server.ts`) for local development.
  - `pnpm run start` — starts indexers and providers (background processes in script). Use for a full system run.
  - `pnpm run dev` — starts the frontend mock API and demo frontend for quick UI testing.
  - `pnpm test` — run unit tests with Vitest; E2E and special tests are under `tests/` (see `test:e2e` scripts).
  - `pnpm run generate` / `pnpm run migrate` / `pnpm run studio` — Drizzle DB generation and migrations.

Note: some npm scripts use Unix `rm` and `&`. On Windows prefer running scripts in a POSIX-compatible shell (Git Bash / WSL) or use the provided `.bat` / `.ps1` helpers when available.

## Important files & where to look for patterns (quick index)
- API routing and Express-like adapter: `api/server.ts` — many modules expect `res.json()` or `res.status().json()` and the server provides an adapter.
- Event ingestion and decoding: `events/utils.ts`, `events/*indexer.ts`, and `events/issuer.firehose.ts` — see `eventReader` and `indexFirestore` patterns (ABI decoding via `ethers.Interface`).
- Persistent stores: `lib/store.ts`, `lib/lmdb-shim.ts` (LMDB usage), and `db/index.ts` + `db/schema` (Drizzle ORM models).
- Background providers: `providers/*` (price/timeseries) — they fetch external APIs and push updates used by APIs and smart contracts.
- Types and domain models: `types.ts` — maps DB rows to runtime types; reference this when adding new DB-backed endpoints.

## Project-specific conventions & gotchas
- The API intentionally uses a raw Node HTTP server but provides an Express-like `expressRes` object — modules were written to work with Express-style responses; follow that pattern when adding endpoints.
- Event processing stores intermediate raw events in LMDB (stringified JSON). Indexers iterate over LMDB streams and persist to SQLite. Use `indexingStore` keys like `${contract_id}_lastRecordedEvent` to track progress.
- Native bindings: `better-sqlite3` and `node-lmdb` are native modules. The code includes an explicit in-memory fallback (see `db/index.ts`) enabled by `DISABLE_INVESTOR_KYC=true` for demo/test runs — useful for CI or environments without native builds.
- Hex/bytes handling: logs decode `bytes32` to strings via `ethers.decodeBytes32String` in `events/utils.ts` — follow that when decoding contract logs.

## Integration points & environment
- Hedera mirror node & SDK: configured via `NETWORK` env and mirror-node base URL in `events/*` (see `MIRROR_NODE_BASE_API`). Contracts and Hedera SDK usage live in `contracts/` (solidity) and runtime code that talks to Hedera uses `@hashgraph/sdk`.
- External price data: `providers/` expects API keys via env vars (ICE/CME/COFFEE_EXCHANGE keys are referenced in README). Market data writes feed into market services consumed by API and distribution logic.
- Database file path: `./local-store/sqlite/sqlite.db`. Drizzle config points to this file (`drizzle.config.ts`). Migrations are in `db/migrations`.

## How to extend safely (rules for agents)
- When adding an API endpoint, export the handler from a module in `api/` and wire it into `api/server.ts` using the existing expressRes adapter.
- New indexer logic should follow `eventReader` -> LMDB -> `indexFirestore` pattern. Persist a `lastRecordedEvent` key to make the indexer idempotent.
- For DB schema changes, update `db/schema` and run `pnpm run generate` then `pnpm run migrate`. Keep migration artifacts in `db/migrations`.

## Where to run tests & quick checks
- Unit tests: `pnpm test` (Vitest). E2E: `pnpm run test:e2e` and specialized runners in `tests/`.
- Quick smoke: `pnpm run api` then visit `http://localhost:3001/health` and `http://localhost:3001/api`.

---
If anything is unclear or you'd like more examples (small code templates for adding endpoints, indexers, or a migration checklist), tell me which area to expand and I will iterate.
