import type { TodoStatusFilter } from '../types/todo'

type StatusFilterProps = {
  value: TodoStatusFilter
  onChange: (value: TodoStatusFilter) => void
  remaining: number
  total: number
}

const OPTIONS: { value: TodoStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export function StatusFilter({ value, onChange, remaining, total }: StatusFilterProps) {
  return (
    <div className="status-filter">
      <div className="status-filter__tabs" role="tablist" aria-label="Filter todos">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={value === option.value}
            className={value === option.value ? 'is-active' : undefined}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="status-filter__meta">
        {remaining} remaining · {total} shown
      </p>
    </div>
  )
}
