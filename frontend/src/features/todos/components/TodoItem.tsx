import { memo, useEffect, useRef, useState } from 'react'
import type { Todo } from '../types/todo'

type TodoItemProps = {
  todo: Todo
  busy?: boolean
  onToggle: (todo: Todo) => void
  onRename: (todo: Todo, body: string) => Promise<void> | void
  onDelete: (todo: Todo) => void
}

function TodoItemComponent({
  todo,
  busy = false,
  onToggle,
  onRename,
  onDelete,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.body)
  const inputRef = useRef<HTMLInputElement>(null)
  const checkboxId = `todo-check-${todo.id}`

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function startEditing() {
    setDraft(todo.body)
    setEditing(true)
  }

  async function commit() {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === todo.body) {
      setDraft(todo.body)
      setEditing(false)
      return
    }
    await onRename(todo, trimmed)
    setEditing(false)
  }

  return (
    <li className={`todo-item${todo.done ? ' is-done' : ''}${busy ? ' is-busy' : ''}`}>
      <div className="todo-item__main">
        <input
          id={checkboxId}
          type="checkbox"
          checked={todo.done}
          disabled={busy}
          onChange={() => onToggle(todo)}
        />
        {editing ? (
          <input
            ref={inputRef}
            className="todo-edit"
            value={draft}
            disabled={busy}
            maxLength={500}
            aria-label={`Edit text for ${todo.body}`}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => void commit()}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void commit()
              }
              if (event.key === 'Escape') {
                setDraft(todo.body)
                setEditing(false)
              }
            }}
          />
        ) : (
          <label htmlFor={checkboxId} className="visually-hidden">
            {todo.done ? 'Mark incomplete' : 'Mark complete'}: {todo.body}
          </label>
        )}
        {!editing ? (
          <button
            type="button"
            className={`todo-body${todo.done ? ' completed' : ''}`}
            disabled={busy}
            onDoubleClick={startEditing}
          >
            {todo.body}
          </button>
        ) : null}
      </div>
      <div className="todo-item__actions">
        {!editing ? (
          <button
            type="button"
            className="todo-edit-btn"
            disabled={busy}
            onClick={startEditing}
            aria-label={`Edit "${todo.body}"`}
          >
            Edit
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(todo)}
          aria-label={`Delete "${todo.body}"`}
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export const TodoItem = memo(TodoItemComponent)
