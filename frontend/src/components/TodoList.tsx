import type { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'

type TodoListProps = {
  todos: Todo[]
  onToggle?: (id: number) => void
  onDelete?: (id: number) => void
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="todo-list-empty">No todos yet.</p>
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
