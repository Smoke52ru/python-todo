import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  ListTodosArgs,
  Todo,
  TodoCreate,
  TodoListResponse,
  TodoUpdate,
} from '../types/todo'

const baseUrl = import.meta.env.VITE_API_URL ?? '/'

export const todosApi = createApi({
  reducerPath: 'todosApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Todo'],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    listTodos: builder.query<TodoListResponse, ListTodosArgs | void>({
      query: (args) => ({
        url: 'todos',
        params: {
          q: args?.q || undefined,
          done: args?.done,
          limit: args?.limit ?? 50,
          offset: args?.offset ?? 0,
          sort: args?.sort ?? 'created_at',
          order: args?.order ?? 'desc',
        },
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const args = queryArgs ?? {}
        return [
          endpointName,
          args.q ?? '',
          String(args.done),
          args.limit ?? 50,
          args.sort ?? 'created_at',
          args.order ?? 'desc',
        ].join('-')
      },
      merge: (currentCache, newItems, { arg }) => {
        const offset = arg?.offset ?? 0
        if (offset === 0) {
          return newItems
        }
        const existingIds = new Set(currentCache.items.map((item) => item.id))
        const appended = newItems.items.filter((item) => !existingIds.has(item.id))
        return {
          ...newItems,
          items: [...currentCache.items, ...appended],
        }
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.offset !== previousArg?.offset ||
        currentArg?.q !== previousArg?.q ||
        currentArg?.done !== previousArg?.done,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Todo' as const, id })),
              { type: 'Todo', id: 'LIST' },
            ]
          : [{ type: 'Todo', id: 'LIST' }],
    }),
    createTodo: builder.mutation<Todo, TodoCreate>({
      query: (body) => ({
        url: 'todos',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
    }),
    updateTodo: builder.mutation<Todo, { id: number } & TodoUpdate>({
      query: ({ id, ...body }) => ({
        url: `todos/${id}`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled, getState }) {
        const patches = todosApi.util
          .selectInvalidatedBy(getState(), [{ type: 'Todo', id: 'LIST' }])
          .filter(({ endpointName }) => endpointName === 'listTodos')
          .map(({ originalArgs }) =>
            dispatch(
              todosApi.util.updateQueryData('listTodos', originalArgs, (draft) => {
                const todo = draft.items.find((item) => item.id === id)
                if (todo) Object.assign(todo, patch)
              }),
            ),
          )

        try {
          const { data } = await queryFulfilled
          for (const { originalArgs } of todosApi.util
            .selectInvalidatedBy(getState(), [{ type: 'Todo', id: 'LIST' }])
            .filter(({ endpointName }) => endpointName === 'listTodos')) {
            dispatch(
              todosApi.util.updateQueryData('listTodos', originalArgs, (draft) => {
                const index = draft.items.findIndex((item) => item.id === id)
                if (index >= 0) draft.items[index] = data
              }),
            )
          }
        } catch {
          for (const patchResult of patches) {
            patchResult.undo()
          }
        }
      },
      invalidatesTags: (_result, error, { id }) =>
        error
          ? [
              { type: 'Todo', id },
              { type: 'Todo', id: 'LIST' },
            ]
          : [],
    }),
    deleteTodo: builder.mutation<void, number>({
      query: (id) => ({
        url: `todos/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patches = todosApi.util
          .selectInvalidatedBy(getState(), [{ type: 'Todo', id: 'LIST' }])
          .filter(({ endpointName }) => endpointName === 'listTodos')
          .map(({ originalArgs }) =>
            dispatch(
              todosApi.util.updateQueryData('listTodos', originalArgs, (draft) => {
                draft.items = draft.items.filter((item) => item.id !== id)
                draft.total = Math.max(0, draft.total - 1)
              }),
            ),
          )

        try {
          await queryFulfilled
        } catch {
          for (const patchResult of patches) {
            patchResult.undo()
          }
        }
      },
      invalidatesTags: (_result, error, id) =>
        error
          ? [
              { type: 'Todo', id },
              { type: 'Todo', id: 'LIST' },
            ]
          : [],
    }),
    bulkSetDone: builder.mutation<{ updated: number; done: boolean }, boolean>({
      query: (done) => ({
        url: 'todos',
        method: 'PATCH',
        body: { done },
      }),
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
    }),
    bulkDeleteDone: builder.mutation<{ deleted: number; done: boolean }, boolean>({
      query: (done) => ({
        url: 'todos',
        method: 'DELETE',
        params: { done },
      }),
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
    }),
  }),
})

export const {
  useListTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  useBulkSetDoneMutation,
  useBulkDeleteDoneMutation,
} = todosApi
