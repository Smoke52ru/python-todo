type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search todos…',
}: SearchBarProps) {
  return (
    <div className="search-bar">
      <label htmlFor="todo-search" className="visually-hidden">
        Search todos
      </label>
      <input
        id="todo-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
