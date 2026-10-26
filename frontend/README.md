# PythonTodo Frontend

React + TypeScript client for a FastAPI todo API. Uses Redux Toolkit Query for CRUD and list/search.

## Stack

- React 19 + Vite + TypeScript
- Redux Toolkit Query (`todosApi`)
- Vite proxy to the FastAPI backend on `http://127.0.0.1:8000`

## Features

- List todos with server-side search (`GET /todo/read?q=`)
- Create, toggle, and delete todos
- Components: `SearchBar`, `TodoList`, `TodoItem`

## Prerequisites

- Node.js 20+
- Running backend from the sibling `../backend` project (FastAPI, default port `8000`)

## Setup

```bash
npm install
```

## Development

Start the backend first (from `../backend`), then:

```bash
npm run dev
```

The app is served by Vite (usually `http://localhost:5173`). Requests to `/todo/*` are proxied to `http://127.0.0.1:8000`.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start Vite dev server    |
| `npm run build`| Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint               |

## API (RTK Query)

Defined in `src/api/todosApi.ts`:

| Hook                     | Method | Path                    |
|--------------------------|--------|-------------------------|
| `useListAllQuery`        | GET    | `/todo/read?q=`         |
| `useGetTodoQuery`        | GET    | `/todo/read/:id`        |
| `useCreateTodoMutation`  | POST   | `/todo/create`          |
| `useUpdateTodoMutation`  | PATCH  | `/todo/update/:id`      |
| `useDeleteTodoMutation`  | DELETE | `/todo/delete/:id`      |

Todo shape: `{ id: number, body: string, done: boolean }`.

## Project layout

```
src/
  api/todosApi.ts      # RTK Query API
  app/store.ts         # Redux store
  components/          # SearchBar, TodoList, TodoItem
  types/todo.ts        # Shared types
  App.tsx              # Wired CRUD UI
```
