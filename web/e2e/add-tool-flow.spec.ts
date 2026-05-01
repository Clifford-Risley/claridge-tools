import { test, expect } from "@playwright/test"
import { signInWithEmail } from "./helpers/auth"

function requireCreds() {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD
  if (!email || !password) {
    throw new Error("Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD before running e2e tests")
  }
  return { email, password }
}

test("unauthenticated user is redirected from /tools/new", async ({ page }) => {
  await page.goto("/tools/new")
  await expect(page).toHaveURL(/sign-in/)
})

test("Choice modal opens when Add a Tool is tapped", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-listings")

  await page.getByRole("button", { name: /add a tool/i }).first().click()

  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.getByText("How would you like to add your tool?")).toBeVisible()
})

test("Manual entry option navigates to /tools/new", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-listings")

  await page.getByRole("button", { name: /add a tool/i }).first().click()
  await page.getByRole("button", { name: /enter details manually/i }).click()

  await expect(page).toHaveURL(/\/tools\/new/)
})

test("Add Tool form renders with name and description fields", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/tools/new")

  await expect(page.getByRole("heading", { name: /add a tool/i })).toBeVisible()
  await expect(page.getByLabel(/tool name/i)).toBeVisible()
  await expect(page.getByLabel(/description/i)).toBeVisible()
})

test("Edit form renders prefilled with existing tool data", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/tools/1/edit")

  await expect(page.getByRole("heading", { name: /edit tool/i })).toBeVisible()
  await expect(page.getByLabel(/tool name/i)).toHaveValue(/dewalt/i)
})

test("Save is blocked when name is empty", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/tools/new")

  await page.getByRole("button", { name: /save tool/i }).click()

  await expect(page.getByRole("alert")).toContainText(/required/i)
  await expect(page).toHaveURL(/\/tools\/new/)
})

test("Description is blocked at 300 characters", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/tools/new")

  await page.getByLabel(/description/i).fill("a".repeat(400))

  const value = await page.getByLabel(/description/i).inputValue()
  expect(value.length).toBeLessThanOrEqual(300)
})
