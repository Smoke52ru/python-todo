import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Todo, TodoCreate, TodoUpdate } from '../types/todo'

export const todosApi = createApi({
  reducerPath: 'todosApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
  }),
  tagTypes: ['Todo'],
  endpoints: (builder) => ({
    listAll: builder.query<Todo[], string | void>({
      query: (q) => ({
        url: 'todo/read',
        params: { q: q ?? '' },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Todo' as const, id })),
              { type: 'Todo', id: 'LIST' },
            ]
          : [{ type: 'Todo', id: 'LIST' }],
    }),
    getTodo: builder.query<Todo, number>({
      query: (id) => `todo/read/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Todo', id }],
    }),
    createTodo: builder.mutation<Todo, TodoCreate>({
      query: ({ body }) => ({
        url: 'todo/create',
        method: 'POST',
        // Backend validates against full Todo; only `body` is used.
        body: { id: 0, body, done: false },
      }),
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
    }),
    updateTodo: builder.mutation<Todo, { id: number } & TodoUpdate>({
      query: ({ id, body, done }) => ({
        url: `todo/update/${id}`,
        method: 'PATCH',
        body: { id, body, done },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Todo', id },
        { type: 'Todo', id: 'LIST' },
      ],
    }),
    deleteTodo: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `todo/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Todo', id },
        { type: 'Todo', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useListAllQuery,
  useGetTodoQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = todosApi
