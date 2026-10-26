/**
 * Fetches FastAPI OpenAPI schema and refreshes the local contract snapshot.
 * Hand-maintained TypeScript mirror: src/features/todos/types/openapi.d.ts
 */
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const url = process.env.OPENAPI_URL ?? 'http://127.0.0.1:8000/openapi.json'

const response = await fetch(url)
if (!response.ok) {
  console.error(`Failed to fetch ${url}: ${response.status}`)
  process.exit(1)
}

const schema = await response.json()
const out = resolve(root, 'openapi.json')
writeFileSync(out, `${JSON.stringify(schema, null, 2)}\n`)
console.log(`Wrote ${out}`)
console.log('Update src/features/todos/types/openapi.d.ts if the schema changed.')
