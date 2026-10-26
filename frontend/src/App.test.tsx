import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import App from './App'
import { todosApi } from './features/todos/api/todosApi'
import { resetTodos, server } from './test/server'

function renderApp() {
  const store = configureStore({
    reducer: {
      [todosApi.reducerPath]: todosApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(todosApi.middleware),
  })

  return render(
    <Provider store={store}>
      <App />
    </Provider>,
  )
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetTodos([
    {
      id: 1,
      body: 'Sample task',
      done: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ])
})
afterAll(() => server.close())

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('lists todos from the API', async () => {
    renderApp()
    expect(await screen.findByRole('button', { name: 'Sample task' })).toBeInTheDocument()
  })

  it('creates a todo', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByRole('button', { name: 'Sample task' })

    const createForm = document.querySelector('.todo-create') as HTMLElement
    await user.type(within(createForm).getByRole('textbox'), 'Write tests')
    await user.click(within(createForm).getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Write tests' })).toBeInTheDocument()
    })
  })

  it('shows empty search state', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByRole('button', { name: 'Sample task' })

    await user.type(screen.getByRole('searchbox'), 'zzz')
    expect(await screen.findByText('No todos match your search.')).toBeInTheDocument()
  })
})
