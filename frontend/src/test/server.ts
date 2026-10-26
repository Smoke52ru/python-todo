import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { Todo } from '../features/todos/types/todo'

let todos: Todo[] = [
  {
    id: 1,
    body: 'Sample task',
    done: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

export function resetTodos(next: Todo[] = []) {
  todos = next.map((todo) => ({ ...todo }))
}

export const server = setupServer(
  http.get('/todos', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    const doneParam = url.searchParams.get('done')
    let items = [...todos]
    if (q) items = items.filter((todo) => todo.body.includes(q))
    if (doneParam === 'true') items = items.filter((todo) => todo.done)
    if (doneParam === 'false') items = items.filter((todo) => !todo.done)
    return HttpResponse.json({
      items,
      total: items.length,
      limit: Number(url.searchParams.get('limit') ?? 50),
      offset: Number(url.searchParams.get('offset') ?? 0),
    })
  }),
  http.post('/todos', async ({ request }) => {
    const body = (await request.json()) as { body: string }
    const created: Todo = {
      id: Math.max(0, ...todos.map((todo) => todo.id)) + 1,
      body: body.body,
      done: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    todos = [created, ...todos]
    return HttpResponse.json(created, { status: 201 })
  }),
  http.patch('/todos/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const patch = (await request.json()) as { body?: string; done?: boolean }
    const index = todos.findIndex((todo) => todo.id === id)
    if (index < 0) return HttpResponse.json({ detail: 'Todo not found' }, { status: 404 })
    todos[index] = {
      ...todos[index],
      ...patch,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(todos[index])
  }),
  http.delete('/todos/:id', ({ params }) => {
    const id = Number(params.id)
    const before = todos.length
    todos = todos.filter((todo) => todo.id !== id)
    if (todos.length === before) {
      return HttpResponse.json({ detail: 'Todo not found' }, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),
  http.delete('/todos', () => {
    const deleted = todos.filter((todo) => todo.done).length
    todos = todos.filter((todo) => !todo.done)
    return HttpResponse.json({ deleted, done: true })
  }),
)
