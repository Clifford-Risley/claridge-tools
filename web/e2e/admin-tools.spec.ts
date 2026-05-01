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

test("unauthenticated user is redirected away from /admin/tools", async ({ page }) => {
  await page.goto("/admin/tools")
  await expect(page).toHaveURL(/sign-in/)
})

test("Admin Tools renders with full tool list", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/admin/tools")
  await expect(page.getByRole("heading", { name: "Admin Tools" })).toBeVisible()
  await expect(page.getByText("Admin Mode")).toBeVisible()
  await expect(page.getByTestId("tool-card")).toHaveCount(6)
})

test("Filter pills update visible tools", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/admin/tools")

  // Available filter shows only available tools (4)
  await page.getByRole("button", { name: /Available/ }).click()
  await expect(page.getByTestId("tool-card")).toHaveCount(4)

  // Removed filter shows only removed tools (2)
  await page.getByRole("button", { name: /Removed/ }).click()
  await expect(page.getByTestId("tool-card")).toHaveCount(2)
})

test("Removed tools show Restore button and not Edit or Remove", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/admin/tools")

  await page.getByRole("button", { name: /Removed/ }).click()
  const cards = page.getByTestId("tool-card")
  await expect(cards.first()).toBeVisible()

  // Restore button present
  await expect(page.getByRole("button", { name: /Restore/i }).first()).toBeVisible()
  // No Edit or Remove buttons
  await expect(page.getByRole("link", { name: /Edit/i })).not.toBeVisible()
  await expect(page.getByRole("button", { name: /^Remove/i })).not.toBeVisible()
})

test("Remove button shows confirmation before acting", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/admin/tools")

  const cards = page.getByTestId("tool-card")
  await expect(cards).toHaveCount(6)

  // Click Remove on the first available tool
  await page.getByRole("button", { name: /^Remove DeWalt/i }).click()

  // Confirmation UI should appear; tool count unchanged
  await expect(page.getByText("Remove this tool?")).toBeVisible()
  await expect(cards).toHaveCount(6)

  // Cancel returns to normal state
  await page.getByRole("button", { name: /Cancel remove/i }).click()
  await expect(page.getByText("Remove this tool?")).not.toBeVisible()
})

test("Empty filter state shows appropriate message", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/admin/tools")

  // Switch to Removed and restore all removed tools to get an empty Removed list
  await page.getByRole("button", { name: /Removed/ }).click()
  await expect(page.getByTestId("tool-card")).toHaveCount(2)

  // Restore both
  await page.getByRole("button", { name: /Restore/i }).first().click()
  await page.getByRole("button", { name: /Restore/i }).first().click()

  // Empty state message appears
  await expect(page.getByTestId("empty-state")).toBeVisible()
  await expect(page.getByText("No removed tools.")).toBeVisible()
})
