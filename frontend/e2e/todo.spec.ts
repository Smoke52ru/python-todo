import { expect, test } from '@playwright/test'

test('create, complete, search, and delete a todo', async ({ page }) => {
  const label = `e2e-${Date.now()}`

  await page.goto('/')
  await page.getByLabel('New todo').fill(label)
  await page.getByRole('button', { name: 'Add' }).click()

  const row = page.locator('li.todo-item', { hasText: label })
  await expect(row).toBeVisible()

  await row.getByRole('checkbox').check()
  await page.getByRole('tab', { name: 'Completed' }).click()
  await expect(page.locator('li.todo-item', { hasText: label })).toBeVisible()

  await page.getByLabel('Search todos').fill(label)
  await expect(page.locator('li.todo-item', { hasText: label })).toBeVisible()

  await page.getByRole('button', { name: `Delete "${label}"` }).click()
  await expect(page.getByText(`Deleted “${label}”`)).toBeVisible()
})
