import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './errors'

describe('getErrorMessage', () => {
  it('reads detail from FetchBaseQueryError', () => {
    expect(getErrorMessage({ status: 404, data: { detail: 'Todo not found' } })).toBe(
      'Todo not found',
    )
  })

  it('falls back with status', () => {
    expect(getErrorMessage({ status: 500, data: 'x' }, 'Failed')).toBe('Failed (500)')
  })

  it('reads SerializedError message', () => {
    expect(getErrorMessage({ message: 'boom', name: 'Error' })).toBe('boom')
  })
})
