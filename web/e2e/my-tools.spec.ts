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

test("unauthenticated user is redirected away from /my-listings", async ({ page }) => {
  await page.goto("/my-listings")
  await expect(page).toHaveURL(/sign-in/)
})

test("My Tools page renders tool list for signed-in user", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-listings")
  await expect(page.getByRole("heading", { name: "My Tools" })).toBeVisible()
  await expect(page.getByTestId("tool-card")).toHaveCount(3)
})

test("empty state renders when no tools are present", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-listings?empty=true")
  await expect(page.getByText(/add your first tool/i)).toBeVisible()
  await expect(page.getByRole("link", { name: /add a tool/i })).toBeVisible()
})

test("Remove button requires confirmation before tool is removed", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/my-listings")

  const cards = page.getByTestId("tool-card")
  await expect(cards).toHaveCount(3)

  // Click the first Remove button
  await page.getByRole("button", { name: /^Remove DeWalt/i }).click()

  // Confirmation UI should appear; tool must still be present
  await expect(page.getByText("Remove this tool?")).toBeVisible()
  await expect(cards).toHaveCount(3)

  // Cancel hides the confirmation without removing
  await page.getByRole("button", { name: /cancel remove/i }).click()
  await expect(page.getByText("Remove this tool?")).not.toBeVisible()
  await expect(cards).toHaveCount(3)
})
