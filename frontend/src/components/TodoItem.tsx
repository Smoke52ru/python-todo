import type { Todo } from '../types/todo'

type TodoItemProps = {
  todo: Todo
  onToggle?: (id: number) => void
  onDelete?: (id: number) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="todo-item">
      <label>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle?.(todo.id)}
        />
        <span className={todo.done ? 'completed' : undefined}>
          {todo.body}
        </span>
      </label>
      {onDelete ? (
        <button type="button" onClick={() => onDelete(todo.id)} aria-label="Delete todo">
          Delete
        </button>
      ) : null}
    </li>
  )
}
