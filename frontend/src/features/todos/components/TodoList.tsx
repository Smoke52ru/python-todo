import type { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'
import { TodoSkeleton } from './TodoSkeleton'

type TodoListProps = {
  todos: Todo[]
  isLoading: boolean
  isFetching: boolean
  hasSearch: boolean
  busyIds: Set<number>
  onToggle: (todo: Todo) => void
  onRename: (todo: Todo, body: string) => Promise<void> | void
  onDelete: (todo: Todo) => void
  hasMore: boolean
  onLoadMore: () => void
}

export function TodoList({
  todos,
  isLoading,
  isFetching,
  hasSearch,
  busyIds,
  onToggle,
  onRename,
  onDelete,
  hasMore,
  onLoadMore,
}: TodoListProps) {
  if (isLoading) {
    return <TodoSkeleton rows={4} />
  }

  if (todos.length === 0) {
    return (
      <p className="todo-list-empty">
        {hasSearch ? 'No todos match your search.' : 'No todos yet. Add one above.'}
      </p>
    )
  }

  return (
    <div className={`todo-list-wrap${isFetching ? ' is-fetching' : ''}`}>
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            busy={busyIds.has(todo.id)}
            onToggle={onToggle}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </ul>
      {hasMore ? (
        <button
          type="button"
          className="load-more"
          onClick={onLoadMore}
          disabled={isFetching}
        >
          {isFetching ? 'Loading…' : 'Load more'}
        </button>
      ) : null}
    </div>
  )
}
