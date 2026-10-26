export type Todo = {
  id: number
  body: string
  done: boolean
  created_at: string
  updated_at: string
}

export type TodoCreate = {
  body: string
}

export type TodoUpdate = Partial<Pick<Todo, 'body' | 'done'>>

export type TodoStatusFilter = 'all' | 'active' | 'completed'

export type TodoListResponse = {
  items: Todo[]
  total: number
  limit: number
  offset: number
}

export type ListTodosArgs = {
  q?: string
  done?: boolean
  limit?: number
  offset?: number
  sort?: 'id' | 'created_at' | 'updated_at' | 'body'
  order?: 'asc' | 'desc'
}
