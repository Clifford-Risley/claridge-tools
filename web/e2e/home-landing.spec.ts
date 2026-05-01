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

test("unauthenticated user is redirected away from /", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveURL(/sign-in/)
})

test("Home Landing renders greeting with first name", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/")
  // Greeting shows "Hi" followed by a name (real or seeded "Anna" in dev)
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/^Hi\b/)
})

test("Search Tools tile navigates to /directory", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/")
  await page.getByRole("link", { name: /search tools/i }).click()
  await expect(page).toHaveURL(/\/directory/)
})

test("Manage My Tools tile navigates to /my-listings", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/")
  await page.getByRole("link", { name: /manage my tools/i }).click()
  await expect(page).toHaveURL(/\/my-listings/)
})
