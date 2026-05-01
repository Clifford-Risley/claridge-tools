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

test("unauthenticated user is redirected away from /directory", async ({ page }) => {
  await page.goto("/directory")
  await expect(page).toHaveURL(/sign-in/)
})

test("Search Tools screen renders with tool list", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/directory")
  await expect(page.getByRole("searchbox", { name: /search tools/i })).toBeVisible()
  await expect(page.getByTestId("tool-card").first()).toBeVisible()
})

test("typing in search input filters results", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/directory")

  await page.getByRole("searchbox", { name: /search tools/i }).fill("drill")
  await expect(page.getByTestId("tool-card")).toHaveCount(1)
  await expect(page.getByText("DeWalt Power Drill")).toBeVisible()
})

test("tapping a category chip filters results", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/directory")

  await page.getByRole("button", { name: "Ladders" }).click()
  const cards = page.getByTestId("tool-card")
  await expect(cards).toHaveCount(2)
  await expect(page.getByText("24 ft Extension Ladder")).toBeVisible()
  await expect(page.getByText("6 ft Step Ladder")).toBeVisible()
})

test("empty state shows when no results match", async ({ page }) => {
  const { email, password } = requireCreds()
  await signInWithEmail(page, email, password)
  await page.goto("/directory")

  await page.getByRole("searchbox", { name: /search tools/i }).fill("xyzzy no match")
  await expect(page.getByText("No tools found")).toBeVisible()
  await expect(page.getByRole("button", { name: /clear filters/i })).toBeVisible()
})
