export type Todo = {
  id: number
  body: string
  done: boolean
}

export type TodoCreate = {
  body: string
}

export type TodoUpdate = {
  body: string
  done: boolean
}
