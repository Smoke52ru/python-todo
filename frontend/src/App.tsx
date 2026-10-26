import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import {
  useBulkDeleteDoneMutation,
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useListTodosQuery,
  useUpdateTodoMutation,
} from './features/todos/api/todosApi'
import { SearchBar } from './features/todos/components/SearchBar'
import { StatusFilter } from './features/todos/components/StatusFilter'
import { TodoList } from './features/todos/components/TodoList'
import { UndoToast } from './features/todos/components/UndoToast'
import { readFiltersFromUrl } from './features/todos/hooks/useTodoFilters'
import type { Todo, TodoStatusFilter } from './features/todos/types/todo'
import { useDebouncedValue } from './lib/debounce'
import { getErrorMessage } from './lib/errors'
import './App.css'

const PAGE_SIZE = 50

function App() {
  const initial = readFiltersFromUrl()
  const [search, setSearch] = useState(initial.q)
  const [status, setStatus] = useState<TodoStatusFilter>(initial.status)
  const [newTodo, setNewTodo] = useState('')
  const [offset, setOffset] = useState(0)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set())
  const [undo, setUndo] = useState<{ todo: Todo; timer: number } | null>(null)
  const createInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebouncedValue(search, 300)
  const doneParam =
    status === 'active' ? false : status === 'completed' ? true : undefined

  useEffect(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (status !== 'all') params.set('status', status)
    const next = params.toString()
    window.history.replaceState(null, '', next ? `?${next}` : window.location.pathname)
  }, [search, status])

  const listArgs = {
    q: debouncedSearch.trim() || undefined,
    done: doneParam,
    limit: PAGE_SIZE,
    offset,
  }

  const { data, isLoading, isFetching, isError, error } = useListTodosQuery(listArgs)
  const activeCountQuery = useListTodosQuery({
    q: debouncedSearch.trim() || undefined,
    done: false,
    limit: 1,
    offset: 0,
  })
  const [createTodo, { isLoading: isCreating }] = useCreateTodoMutation()
  const [updateTodo] = useUpdateTodoMutation()
  const [deleteTodo] = useDeleteTodoMutation()
  const [bulkDeleteDone] = useBulkDeleteDoneMutation()

  const todos = data?.items ?? []
  const total = data?.total ?? 0
  const remaining = activeCountQuery.data?.total ?? 0
  const hasMore = todos.length < total

  const markBusy = useCallback((id: number, busy: boolean) => {
    setBusyIds((current) => {
      const next = new Set(current)
      if (busy) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = newTodo.trim()
    if (!body) return

    setActionError(null)
    try {
      await createTodo({ body }).unwrap()
      setNewTodo('')
      createInputRef.current?.focus()
    } catch (err) {
      setActionError(getErrorMessage(err as never, 'Failed to create todo'))
    }
  }

  function handleToggle(todo: Todo) {
    setActionError(null)
    markBusy(todo.id, true)
    void updateTodo({ id: todo.id, done: !todo.done })
      .unwrap()
      .catch((err) => setActionError(getErrorMessage(err, 'Failed to update todo')))
      .finally(() => markBusy(todo.id, false))
  }

  async function handleRename(todo: Todo, body: string) {
    setActionError(null)
    markBusy(todo.id, true)
    try {
      await updateTodo({ id: todo.id, body }).unwrap()
    } catch (err) {
      setActionError(getErrorMessage(err as never, 'Failed to rename todo'))
      throw err
    } finally {
      markBusy(todo.id, false)
    }
  }

  function clearUndo() {
    if (undo) {
      window.clearTimeout(undo.timer)
      setUndo(null)
    }
  }

  function handleDelete(todo: Todo) {
    setActionError(null)
    clearUndo()
    markBusy(todo.id, true)
    void deleteTodo(todo.id)
      .unwrap()
      .then(() => {
        const timer = window.setTimeout(() => setUndo(null), 5000)
        setUndo({ todo, timer })
      })
      .catch((err) => setActionError(getErrorMessage(err, 'Failed to delete todo')))
      .finally(() => markBusy(todo.id, false))
  }

  async function handleUndo() {
    if (!undo) return
    const restored = undo.todo
    clearUndo()
    setActionError(null)
    try {
      const created = await createTodo({ body: restored.body }).unwrap()
      if (restored.done) {
        await updateTodo({ id: created.id, done: true }).unwrap()
      }
    } catch (err) {
      setActionError(getErrorMessage(err as never, 'Failed to undo delete'))
    }
  }

  async function handleClearCompleted() {
    setActionError(null)
    try {
      await bulkDeleteDone(true).unwrap()
    } catch (err) {
      setActionError(getErrorMessage(err as never, 'Failed to clear completed'))
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <p className="brand">Ledger</p>
        <h1>Todo List</h1>
        <p className="lede">Keep the list honest.</p>
      </header>

      <form className="todo-create" onSubmit={handleCreate}>
        <label htmlFor="todo-create" className="visually-hidden">
          New todo
        </label>
        <input
          ref={createInputRef}
          id="todo-create"
          type="text"
          value={newTodo}
          onChange={(event) => setNewTodo(event.target.value)}
          placeholder="Add a todo…"
          maxLength={500}
          disabled={isCreating}
          autoComplete="off"
        />
        <button type="submit" disabled={isCreating || !newTodo.trim()}>
          Add
        </button>
      </form>

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value)
          setOffset(0)
        }}
      />

      <StatusFilter
        value={status}
        onChange={(value) => {
          setStatus(value)
          setOffset(0)
        }}
        remaining={remaining}
        total={total}
      />

      {isError ? (
        <p className="status error" role="alert">
          {getErrorMessage(error, 'Failed to load todos')}
        </p>
      ) : null}
      {actionError ? (
        <p className="status error" role="alert">
          {actionError}
        </p>
      ) : null}

      <TodoList
        todos={todos}
        isLoading={isLoading}
        isFetching={isFetching && !isLoading}
        hasSearch={Boolean(debouncedSearch.trim()) || status !== 'all'}
        busyIds={busyIds}
        onToggle={handleToggle}
        onRename={handleRename}
        onDelete={handleDelete}
        hasMore={hasMore}
        onLoadMore={() => setOffset((current) => current + PAGE_SIZE)}
      />

      {total > 0 ? (
        <div className="bulk-actions">
          <button type="button" onClick={() => void handleClearCompleted()}>
            Clear completed
          </button>
        </div>
      ) : null}

      {undo ? (
        <UndoToast
          message={`Deleted “${undo.todo.body}”`}
          onUndo={() => void handleUndo()}
          onDismiss={clearUndo}
        />
      ) : null}
    </main>
  )
}

export default App
