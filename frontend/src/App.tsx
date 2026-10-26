import { useState, type FormEvent } from 'react'
import {
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useListAllQuery,
  useUpdateTodoMutation,
} from './api/todosApi'
import { SearchBar } from './components/SearchBar'
import { TodoList } from './components/TodoList'
import './App.css'

function App() {
  const [search, setSearch] = useState('')
  const [newTodo, setNewTodo] = useState('')

  const { data: todos = [], isLoading, isError, error } = useListAllQuery(search)
  const [createTodo, { isLoading: isCreating }] = useCreateTodoMutation()
  const [updateTodo] = useUpdateTodoMutation()
  const [deleteTodo] = useDeleteTodoMutation()

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = newTodo.trim()
    if (!body) return

    await createTodo({ body }).unwrap()
    setNewTodo('')
  }

  function handleToggle(id: number) {
    const todo = todos.find((item) => item.id === id)
    if (!todo) return

    void updateTodo({ id, body: todo.body, done: !todo.done })
  }

  function handleDelete(id: number) {
    void deleteTodo(id)
  }

  return (
    <main className="app">
      <h1>Todo List</h1>

      <form className="todo-create" onSubmit={handleCreate}>
        <label htmlFor="todo-create" className="visually-hidden">
          New todo
        </label>
        <input
          id="todo-create"
          type="text"
          value={newTodo}
          onChange={(event) => setNewTodo(event.target.value)}
          placeholder="Add a todo…"
          disabled={isCreating}
        />
        <button type="submit" disabled={isCreating || !newTodo.trim()}>
          Add
        </button>
      </form>

      <SearchBar value={search} onChange={setSearch} />

      {isLoading ? <p className="status">Loading…</p> : null}
      {isError ? (
        <p className="status error" role="alert">
          {typeof error === 'object' && error && 'status' in error
            ? `Failed to load todos (${String(error.status)})`
            : 'Failed to load todos'}
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <TodoList
          todos={todos}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ) : null}
    </main>
  )
}

export default App
