/**
 * Generated OpenAPI types.
 * Regenerate with `make codegen` (backend must be running on :8000).
 */
export interface paths {
  '/todos': {
    get: {
      parameters: {
        query?: {
          q?: string
          done?: boolean
          limit?: number
          offset?: number
          sort?: 'id' | 'created_at' | 'updated_at' | 'body'
          order?: 'asc' | 'desc'
        }
      }
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['TodoListResponse']
          }
        }
      }
    }
    post: {
      requestBody: {
        content: {
          'application/json': components['schemas']['TodoCreate']
        }
      }
      responses: {
        201: {
          content: {
            'application/json': components['schemas']['TodoRead']
          }
        }
      }
    }
  }
  '/todos/{todo_id}': {
    get: {
      parameters: { path: { todo_id: number } }
      responses: {
        200: {
          content: { 'application/json': components['schemas']['TodoRead'] }
        }
      }
    }
    patch: {
      parameters: { path: { todo_id: number } }
      requestBody: {
        content: { 'application/json': components['schemas']['TodoUpdate'] }
      }
      responses: {
        200: {
          content: { 'application/json': components['schemas']['TodoRead'] }
        }
      }
    }
    delete: {
      parameters: { path: { todo_id: number } }
      responses: { 204: { content?: never } }
    }
  }
  '/health': {
    get: {
      responses: {
        200: { content: { 'application/json': { status: string } } }
      }
    }
  }
}

export interface components {
  schemas: {
    TodoCreate: { body: string }
    TodoUpdate: { body?: string | null; done?: boolean | null }
    TodoRead: {
      id: number
      body: string
      done: boolean
      created_at: string
      updated_at: string
    }
    TodoListResponse: {
      items: components['schemas']['TodoRead'][]
      total: number
      limit: number
      offset: number
    }
  }
}
