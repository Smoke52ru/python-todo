type TodoSkeletonProps = {
  rows?: number
}

export function TodoSkeleton({ rows = 3 }: TodoSkeletonProps) {
  return (
    <ul className="todo-list todo-skeleton" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="todo-item skeleton-row">
          <span className="skeleton-box skeleton-check" />
          <span className="skeleton-box skeleton-text" />
        </li>
      ))}
    </ul>
  )
}
