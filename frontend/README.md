# PythonTodo Frontend

React + TypeScript client for the FastAPI todo API. Uses Redux Toolkit Query.

## Setup

```bash
npm install
```

Copy `.env.example` if you need a custom API base URL.

## Development

Start the backend on port 8000, then:

```bash
npm run dev
```

Vite proxies `/todos` and `/health` to `http://127.0.0.1:8000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Vitest unit/component tests |
| `npm run test:e2e` | Playwright (starts backend + frontend) |
| `npm run codegen:api` | OpenAPI → `src/features/todos/types/openapi.d.ts` |
